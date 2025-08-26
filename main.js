//Create a random indexed outcome selector
class BinaryIndexedOutcomeSelector {
    binaryIndexer;
    entries;
    total;
    constructor() {
        this.binaryIndexer = [];
        this.entries = 0;
        this.total = 0; // The overall sum of the selector
    }
    addWeight(weight) {
        this.entries++;
        //If entries are a power of two, assign the total to the indexer
        if ((this.entries & (this.entries - 1)) === 0) {
            this.binaryIndexer[this.entries - 1] = this.total;
        }
        //Now update the weights
        this.updateWeight(this.entries - 1, weight);
    }
    updateWeight(index, delta) {
        // Update the binary indexed tree for the given index with delta
        // Throw an error if a weight is attempted to be updated greater than the number of entries
        if (index >= this.entries) {
            throw new Error("Index out of bounds");
        }
        // Traverse up the tree, updating all relevant nodes
        for (let j = 0; (1 << j) <= this.entries; j++) {
            if ((index & (1 << j)) == 0) {
                let spot = index | ((1 << j) - 1);
                this.binaryIndexer[spot] = (this.binaryIndexer[spot] || 0) + delta;
            }
        }
        this.total += delta;
    }
    getRandomOutcome() {
        // Generate a random number between 0 and total
        const rand = Math.random() * this.total;
        let idx = -1;
        let bitMask = 1 << Math.floor(Math.log2(this.entries));
        let sum = 0;
        while (bitMask !== 0) {
            const nextIdx = idx + bitMask;
            if (nextIdx < this.entries && sum + (this.binaryIndexer[nextIdx] || 0) < rand) {
                sum += this.binaryIndexer[nextIdx] || 0;
                idx = nextIdx;
            }
            bitMask >>= 1;
        }
        return idx + 1; // Return the index of the selected outcome
    }
    // Helper to get prefix sum up to index
    query(idx) {
        let sum = 0;
        for (let j = idx; j >= 0; j = (j & (j + 1)) - 1) {
            sum += this.binaryIndexer[j] || 0;
        }
        return sum;
    }
    getWeights() {
        //Recover the weights of the original entries
        const weights = [];
        for (let i = 0; i < this.entries; i++) {
            const w = this.query(i) - (i > 0 ? this.query(i - 1) : 0);
            weights.push(w);
        }
        return weights;
    }
}
//ScenarioNode -> DiceNode -> ResultsNode -> ScenarioNode
class ScenarioNode {
    scenario;
    edges;
    constructor(scenario) {
        this.scenario = scenario;
        this.edges = [];
        this.edges = generateDiceOptions(scenario).map(selection => new DiceNode(selection, scenario));
    }
}
class DiceNode {
    selection;
    scenario;
    constructor(selection, scenario) {
        this.selection = selection;
        this.scenario = scenario;
    }
    roll() {
        // Roll the dice based on the selection
        let symbolCounts = rollDice(this.selection);
        return symbolCounts;
    }
}
// Assault Dice: fill in with your data
const assaultDice = [
    // Example: each array is a face, add/remove symbols as needed
    ['hit', 'hit'],
    ['hit', 'hit', 'fire'],
    ['hit', 'intercept'],
    ['hit', 'fire'],
    ['hit', 'fire'],
    []
];
// Skirmish Dice: fill in with your data
const skirmishDice = [
    ['hit'],
    ['hit'],
    ['hit'],
    [],
    [],
    []
];
// Raid Dice: fill in with your data
const raidDice = [
    ['intercept', 'key', 'key'],
    ['fire', 'key'],
    ['triangle', 'key'],
    ['triangle', 'fire'],
    ['triangle', 'fire'],
    ['intercept']
];
// Run the simulation for a scenario and return a new scenario (result)
function rollDice(selection) {
    // Count symbols for all dice
    const symbolCounts = {
        fire: 0,
        intercept: 0,
        hit: 0,
        triangle: 0,
        key: 0
    };
    function roll(dice, num) {
        for (let i = 0; i < num; i++) {
            const idx = Math.floor(Math.random() * dice.length);
            const face = dice[idx];
            if (face && Array.isArray(face)) {
                for (const symbol of face) {
                    symbolCounts[symbol]++;
                }
            }
        }
    }
    roll(assaultDice, selection.assaultDice);
    roll(skirmishDice, selection.skirmishDice);
    roll(raidDice, selection.raidDice);
    console.log(symbolCounts);
    return symbolCounts;
}
function generateDiceOptions(scenario) {
    const maxDice = scenario.healthyAttackingShips + scenario.damagedAttackingShips;
    const options = [];
    for (let total = 0; total <= maxDice; total++) {
        for (let assault = 0; assault <= total; assault++) {
            for (let skirmish = 0; skirmish <= total - assault; skirmish++) {
                const raid = total - assault - skirmish;
                options.push({
                    assaultDice: assault,
                    skirmishDice: skirmish,
                    raidDice: raid
                });
            }
        }
    }
    return options;
}
// Generic helper to serialize any object for dictionary keys
function serializeObject(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort());
}
// Main function: for each dice option, run rollDice N times, collect unique results, and count occurrences
function simulateDiceOptions(scenario, numSimulations) {
    // Generate all possible dice selections for the scenario
    const diceOptions = generateDiceOptions(scenario);
    // Dictionary to store unique symbol count results by their serialized key
    const uniqueResults = {};
    // Array to keep references to unique result objects
    const resultRefs = [];
    // Array to store DiceSelectionResults
    const diceSelectionResults = [];
    diceOptions.forEach((option) => {
        // Map from serialized symbol counts to number of occurrences
        const resultCounts = {};
        for (let i = 0; i < numSimulations; i++) {
            // Roll dice for this option
            const result = rollDice(option);
            // Serialize the result for dictionary key
            const key = serializeObject(result);
            // If this result is new, add to uniqueResults and resultRefs
            if (!(key in uniqueResults)) {
                uniqueResults[key] = result;
                resultRefs.push(result);
            }
            // Count how many times this result occurred
            resultCounts[key] = (resultCounts[key] || 0) + 1;
        }
        // Add DiceSelectionResults for this option
        diceSelectionResults.push({
            diceSelection: option,
            selectionKey: serializeObject(option),
            resultCounts
        });
    });
    // Return DiceSelectionResults and the list of unique results
    return {
        diceSelectionResults,
        uniqueResults: resultRefs
    };
}
// Automatically add a scenario when the page loads
window.addEventListener('DOMContentLoaded', () => {
    addScenarioBtn.click();
});
// Returns all possible ways symbols can be applied to a scenario
function applySymbolsToScenario(startScenario, symbolCounts) {
    // Helper to deep clone a scenario
    function cloneScenario(s) {
        return JSON.parse(JSON.stringify(s));
    }
    // Track all possible scenarios
    const results = [];
    const seen = new Set();
    // For combinatorial application, use a queue (BFS)
    const queue = [
        { scenario: cloneScenario(startScenario), ...symbolCounts }
    ];
    while (queue.length > 0) {
        const { scenario, fire, intercept, hit, triangle, key } = queue.shift();
        let s = cloneScenario(scenario);
        let outrages = s.outragesProvoked || 0;
        let attackerTrophies = s.attackerTrophies || 0;
        let defenderTrophies = s.defenderTrophies || 0;
        let keysAvailable = s.keysAvailable || 0;
        // Helper to serialize scenario and remaining symbols
        function serializeState(fire, intercept, hit, triangle, key) {
            return JSON.stringify({
                fire,
                intercept,
                hit,
                triangle,
                key
            });
        }
        const stateKey = serializeState(fire, intercept, hit, triangle, key);
        //Exit if the state has been seen before
        if (seen.has(stateKey))
            continue;
        seen.add(stateKey);
        // Decision points for each symbol type
        // 1. For each fire, try all possible ways to apply to healthy/damaged attacking ships
        if (fire > 0 && (s.healthyAttackingShips > 0 || s.damagedAttackingShips > 0)) {
            if (s.healthyAttackingShips > 0) {
                let next = cloneScenario(s);
                next.healthyAttackingShips--;
                next.damagedAttackingShips++;
                queue.push({ scenario: next, fire: fire - 1, intercept, hit, triangle, key });
            }
            if (s.damagedAttackingShips > 0) {
                let next = cloneScenario(s);
                next.damagedAttackingShips--;
                next.defenderTrophies = (next.defenderTrophies || 0) + 1;
                queue.push({ scenario: next, fire: fire - 1, intercept, hit, triangle, key });
            }
            continue;
        }
        // 2. For each intercept, hit an attacking ship for each healthy defending ship
        if (intercept > 0 && s.healthyDefendingShips > 0 && (s.healthyAttackingShips > 0 || s.damagedAttackingShips > 0)) {
            for (let i = 0; i < s.healthyDefendingShips; i++) {
                if (s.healthyAttackingShips > 0) {
                    let next = cloneScenario(s);
                    next.healthyAttackingShips--;
                    next.damagedAttackingShips++;
                    queue.push({ scenario: next, fire, intercept: 0, hit, triangle, key }); //only one intercept allowed
                }
                if (s.damagedAttackingShips > 0) {
                    let next = cloneScenario(s);
                    next.damagedAttackingShips--;
                    next.defenderTrophies = (next.defenderTrophies || 0) + 1;
                    queue.push({ scenario: next, fire, intercept: 0, hit, triangle, key });
                }
            }
            continue;
        }
        // 3. For each hit, try all possible ways to apply to defending ships/cities/spaceports
        if (hit > 0) {
            const shipsLeft = s.healthyDefendingShips + s.damagedDefendingShips;
            if (shipsLeft > 0) {
                if (s.healthyDefendingShips > 0) {
                    let next = cloneScenario(s);
                    next.healthyDefendingShips--;
                    next.damagedDefendingShips++;
                    queue.push({ scenario: next, fire, intercept, hit: hit - 1, triangle, key });
                }
                if (s.damagedDefendingShips > 0) {
                    let next = cloneScenario(s);
                    next.damagedDefendingShips--;
                    next.attackerTrophies = (next.attackerTrophies || 0) + 1;
                    queue.push({ scenario: next, fire, intercept, hit: hit - 1, triangle, key });
                }
            }
            else {
                if (s.healthyDefendingCities > 0) {
                    let next = cloneScenario(s);
                    next.healthyDefendingCities--;
                    next.damagedDefendingCities++;
                    queue.push({ scenario: next, fire, intercept, hit: hit - 1, triangle, key });
                }
                if (s.damagedDefendingCities > 0) {
                    let next = cloneScenario(s);
                    next.damagedDefendingCities--;
                    next.outragesProvoked = (next.outragesProvoked || 0) + 1;
                    next.attackerTrophies = (next.attackerTrophies || 0) + 1;
                    queue.push({ scenario: next, fire, intercept, hit: hit - 1, triangle, key });
                }
                if (s.healthyDefendingSpaceports > 0) {
                    let next = cloneScenario(s);
                    next.healthyDefendingSpaceports--;
                    next.damagedDefendingSpaceports++;
                    queue.push({ scenario: next, fire, intercept, hit: hit - 1, triangle, key });
                }
                if (s.damagedDefendingSpaceports > 0) {
                    let next = cloneScenario(s);
                    next.damagedDefendingSpaceports--;
                    next.attackerTrophies = (next.attackerTrophies || 0) + 1;
                    queue.push({ scenario: next, fire, intercept, hit: hit - 1, triangle, key });
                }
            }
            continue;
        }
        // 4. For each triangle, try all possible ways to apply to cities/spaceports
        if (triangle > 0) {
            if (s.healthyDefendingCities > 0) {
                let next = cloneScenario(s);
                next.healthyDefendingCities--;
                next.damagedDefendingCities++;
                queue.push({ scenario: next, fire, intercept, hit, triangle: triangle - 1, key });
            }
            if (s.damagedDefendingCities > 0) {
                let next = cloneScenario(s);
                next.damagedDefendingCities--;
                next.outragesProvoked = (next.outragesProvoked || 0) + 1;
                next.attackerTrophies = (next.attackerTrophies || 0) + 1;
                queue.push({ scenario: next, fire, intercept, hit, triangle: triangle - 1, key });
            }
            if (s.healthyDefendingSpaceports > 0) {
                let next = cloneScenario(s);
                next.healthyDefendingSpaceports--;
                next.damagedDefendingSpaceports++;
                queue.push({ scenario: next, fire, intercept, hit, triangle: triangle - 1, key });
            }
            if (s.damagedDefendingSpaceports > 0) {
                let next = cloneScenario(s);
                next.damagedDefendingSpaceports--;
                next.attackerTrophies = (next.attackerTrophies || 0) + 1;
                queue.push({ scenario: next, fire, intercept, hit, triangle: triangle - 1, key });
            }
            continue;
        }
        // 5. If attacker has any ships left, count keys
        if (s.healthyAttackingShips + s.damagedAttackingShips > 0) {
            keysAvailable += key;
        }
        s.keysAvailable = keysAvailable;
        s.outragesProvoked = outrages;
        s.attackerTrophies = attackerTrophies;
        s.defenderTrophies = defenderTrophies;
        // Only add unique scenarios to results
        // Semi dangerous, since we are using two different data structures in seen
        const scenarioKey = JSON.stringify(s);
        if (!seen.has(scenarioKey)) {
            results.push(s);
            seen.add(scenarioKey);
        }
    }
    return results;
}
const addScenarioBtn = document.getElementById('add-scenario');
let scenarioList = document.getElementById('scenario-list');
if (!scenarioList) {
    scenarioList = document.createElement('ul');
    scenarioList.id = 'scenario-list';
    document.querySelector('.container')?.appendChild(scenarioList);
}
const scenarios = [];
addScenarioBtn.addEventListener('click', () => {
    // Create input elements for a new scenario
    const li = document.createElement('li');
    li.className = 'scenario-item';
    function createInput(id, label) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.marginRight = '8px';
        const lbl = document.createElement('label');
        lbl.textContent = label;
        lbl.htmlFor = id;
        const input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.value = '0';
        input.style.width = '60px';
        input.addEventListener('focus', function () {
            input.select();
        });
        input.addEventListener('change', function () {
            let val = Number(input.value);
            if (!Number.isInteger(val)) {
                input.value = String(Math.round(val));
            }
        });
        wrapper.appendChild(lbl);
        wrapper.appendChild(input);
        li.appendChild(wrapper);
        return input;
    }
    const healthyAttackingShipsInput = createInput('healthy-attacking-ships', 'Healthy Attacking Ships');
    const damagedAttackingShipsInput = createInput('damaged-attacking-ships', 'Damaged Attacking Ships');
    const healthyDefendingShipsInput = createInput('healthy-defending-ships', 'Healthy Defending Ships');
    const damagedDefendingShipsInput = createInput('damaged-defending-ships', 'Damaged Defending Ships');
    const healthyDefendingCitiesInput = createInput('healthy-defending-cities', 'Healthy Defending Cities');
    const damagedDefendingCitiesInput = createInput('damaged-defending-cities', 'Damaged Defending Cities');
    const healthyDefendingSpaceportsInput = createInput('healthy-defending-spaceports', 'Healthy Defending Spaceports');
    const damagedDefendingSpaceportsInput = createInput('damaged-defending-spaceports', 'Damaged Defending Spaceports');
    const attackerActionPipsInput = createInput('attacker-action-pips', 'Attacker Action Pips');
    attackerActionPipsInput.value = '1';
    const assaultDiceInput = createInput('assault-dice', 'Assault Dice');
    const skirmishDiceInput = createInput('skirmish-dice', 'Skirmish Dice');
    const raidDiceInput = createInput('raid-dice', 'Raid Dice');
    // Goal select
    const goalWrapper = document.createElement('div');
    goalWrapper.style.display = 'flex';
    goalWrapper.style.alignItems = 'center';
    goalWrapper.style.marginRight = '8px';
    const goalLabel = document.createElement('label');
    goalLabel.textContent = 'Goal';
    goalLabel.htmlFor = 'goal-select';
    goalLabel.style.marginRight = '6px';
    const goalSelect = document.createElement('select');
    goalSelect.id = 'goal-select';
    ['complete destruction', 'loss minimization', 'key maximization'].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        goalSelect.appendChild(option);
    });
    goalWrapper.appendChild(goalLabel);
    goalWrapper.appendChild(goalSelect);
    li.appendChild(goalWrapper);
    // Add buttons
    const runBtn = document.createElement('button');
    runBtn.textContent = 'Run Scenario';
    runBtn.style.marginLeft = '8px';
    runBtn.addEventListener('click', () => {
        // Find the current index of this scenario item
        const currentIdx = Array.from(scenarioList.children).indexOf(li);
        if (scenarios[currentIdx]) {
            const scenario = {
                healthyAttackingShips: Number(healthyAttackingShipsInput.value),
                damagedAttackingShips: Number(damagedAttackingShipsInput.value),
                healthyDefendingShips: Number(healthyDefendingShipsInput.value),
                damagedDefendingShips: Number(damagedDefendingShipsInput.value),
                healthyDefendingCities: Number(healthyDefendingCitiesInput.value),
                damagedDefendingCities: Number(damagedDefendingCitiesInput.value),
                healthyDefendingSpaceports: Number(healthyDefendingSpaceportsInput.value),
                damagedDefendingSpaceports: Number(damagedDefendingSpaceportsInput.value),
                attackerActionPips: Number(attackerActionPipsInput.value),
                diceSelection: {
                    assaultDice: Number(assaultDiceInput.value),
                    skirmishDice: Number(skirmishDiceInput.value),
                    raidDice: Number(raidDiceInput.value)
                },
                goal: goalSelect.value,
            };
            scenarios[currentIdx].scenario = scenario;
            console.log('Running scenario:', scenario);
            rollDice(scenario.diceSelection);
            // --- Run the test for this scenario ---
            const diceOptions = generateDiceOptions(scenario);
            if (!diceOptions || diceOptions.length === 0) {
                console.log('No dice options available for scenario.');
                return;
            }
            const randomIdx = Math.floor(Math.random() * diceOptions.length);
            const randomDiceSelection = diceOptions[randomIdx];
            if (!randomDiceSelection) {
                console.log('No valid dice selection.');
                return;
            }
            const symbolCounts = rollDice(randomDiceSelection);
            if (!symbolCounts) {
                console.log('No symbol counts generated.');
                return;
            }
            const possibleScenarios = applySymbolsToScenario(scenario, symbolCounts);
            if (!possibleScenarios || possibleScenarios.length === 0) {
                console.log('No possible outcome scenarios.');
                return;
            }
            console.log('User scenario:', scenario);
            console.log('Random dice selection:', randomDiceSelection);
            console.log('Rolled symbol counts:', symbolCounts);
            console.log('Possible outcome scenarios:');
            possibleScenarios.forEach((sc, i) => {
                console.log(`Outcome ${i + 1}:`, sc);
            });
            // --- End Test ---
            console.log('Test completed.');
        }
    });
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy Scenario';
    copyBtn.style.marginLeft = '8px';
    copyBtn.addEventListener('click', () => {
        // Copy current scenario values and create a new scenario with them
        const currentIdx = Array.from(scenarioList.children).indexOf(li);
        if (scenarios[currentIdx]) {
            const s = scenarios[currentIdx];
            addScenarioBtn.click();
            // Find the last scenario just added
            const lastIdx = scenarios.length - 1;
            const lastScenario = scenarios[lastIdx];
            if (lastScenario && lastScenario.inputs) {
                const lastInputs = lastScenario.inputs;
                lastInputs.healthyAttackingShipsInput.value = s.inputs.healthyAttackingShipsInput.value;
                lastInputs.damagedAttackingShipsInput.value = s.inputs.damagedAttackingShipsInput.value;
                lastInputs.healthyDefendingShipsInput.value = s.inputs.healthyDefendingShipsInput.value;
                lastInputs.damagedDefendingShipsInput.value = s.inputs.damagedDefendingShipsInput.value;
                lastInputs.healthyDefendingCitiesInput.value = s.inputs.healthyDefendingCitiesInput.value;
                lastInputs.damagedDefendingCitiesInput.value = s.inputs.damagedDefendingCitiesInput.value;
                lastInputs.healthyDefendingSpaceportsInput.value = s.inputs.healthyDefendingSpaceportsInput.value;
                lastInputs.damagedDefendingSpaceportsInput.value = s.inputs.damagedDefendingSpaceportsInput.value;
                lastInputs.attackerActionPipsInput.value = s.inputs.attackerActionPipsInput.value;
                lastInputs.assaultDiceInput.value = s.inputs.assaultDiceInput.value;
                lastInputs.skirmishDiceInput.value = s.inputs.skirmishDiceInput.value;
                lastInputs.raidDiceInput.value = s.inputs.raidDiceInput.value;
                lastInputs.goalSelect.value = s.inputs.goalSelect.value;
            }
        }
    });
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = '8px';
    deleteBtn.addEventListener('click', () => {
        scenarioList.removeChild(li);
        scenarios.splice(idx, 1);
    });
    li.appendChild(runBtn);
    li.appendChild(copyBtn);
    li.appendChild(deleteBtn);
    scenarioList.appendChild(li);
    // Store scenario and inputs
    const idx = scenarios.length;
    scenarios.push({
        scenario: {
            healthyAttackingShips: Number(healthyAttackingShipsInput.value),
            damagedAttackingShips: Number(damagedAttackingShipsInput.value),
            healthyDefendingShips: Number(healthyDefendingShipsInput.value),
            damagedDefendingShips: Number(damagedDefendingShipsInput.value),
            healthyDefendingCities: Number(healthyDefendingCitiesInput.value),
            damagedDefendingCities: Number(damagedDefendingCitiesInput.value),
            healthyDefendingSpaceports: Number(healthyDefendingSpaceportsInput.value),
            damagedDefendingSpaceports: Number(damagedDefendingSpaceportsInput.value),
            attackerActionPips: Number(attackerActionPipsInput.value),
            diceSelection: {
                assaultDice: Number(assaultDiceInput.value),
                skirmishDice: Number(skirmishDiceInput.value),
                raidDice: Number(raidDiceInput.value)
            },
            goal: goalSelect.value,
        },
        inputs: {
            healthyAttackingShipsInput,
            damagedAttackingShipsInput,
            healthyDefendingShipsInput,
            damagedDefendingShipsInput,
            healthyDefendingCitiesInput,
            damagedDefendingCitiesInput,
            healthyDefendingSpaceportsInput,
            damagedDefendingSpaceportsInput,
            attackerActionPipsInput,
            assaultDiceInput,
            skirmishDiceInput,
            raidDiceInput,
            goalSelect,
        }
    });
});
export {};
//# sourceMappingURL=main.js.map