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
        console.log(this.edges);
    }
}
class DiceNode {
    selection;
    scenario;
    edges;
    constructor(selection, scenario) {
        this.selection = selection;
        this.scenario = scenario;
        this.edges = [];
    }
    sample() {
        console.log("here");
    }
    roll() {
        // Roll the dice based on the selection
        let symbolCounts = rollDice(this.selection);
        return symbolCounts;
    }
}
class DiceResultsNode {
    symbolCounts;
    constructor(symbolCounts) {
        this.symbolCounts = symbolCounts;
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
// Automatically add a scenario and press the run scenario button when the page loads
window.addEventListener('DOMContentLoaded', () => {
    addScenarioBtn.click();
    // Find the first scenario's run button and click it
    setTimeout(() => {
        const firstScenarioItem = scenarioList.querySelector('.scenario-item');
        if (firstScenarioItem) {
            const runBtn = firstScenarioItem.querySelector('button');
            if (runBtn) {
                runBtn.click();
            }
        }
    }, 100); // Delay to ensure scenario is added and DOM is updated 
});
const seenBuildingStates = {}; //Should be a key value pair where each key is a string and each value is a list of lists
function getBruteBuildingDamageResults(hits, s) {
    // Serialize hits-state
    const stateKey = `${hits}:${s.healthyDefendingCities}-${s.damagedDefendingCities}-${s.healthyDefendingSpaceports}-${s.damagedDefendingSpaceports}`;
    // See if the key has been seen before
    if (seenBuildingStates[stateKey]) {
        return seenBuildingStates[stateKey];
    }
    // Initialize results array
    const results = [];
    // See if we are in a zero hits scenario or a more hits than we have available points scenario
    if (hits == 0) {
        results.push({
            healthyCities: s.healthyDefendingCities,
            damagedCities: s.damagedDefendingCities,
            healthySpaceports: s.healthyDefendingSpaceports,
            damagedSpaceports: s.damagedDefendingSpaceports,
            outrages: 0,
            trophies: 0
        });
        return results;
    }
    let hitPointsAvailable = 2 * s.healthyDefendingCities + s.damagedDefendingCities + 2 * s.healthyDefendingSpaceports + s.damagedDefendingSpaceports;
    if (hits >= hitPointsAvailable) {
        results.push({
            healthyCities: 0,
            damagedCities: 0,
            healthySpaceports: 0,
            damagedSpaceports: 0,
            outrages: s.healthyDefendingCities + s.damagedDefendingCities,
            trophies: s.healthyDefendingCities + s.damagedDefendingCities + s.healthyDefendingSpaceports + s.damagedDefendingSpaceports
        });
        return results;
    }
    // Perform a brute force search
    for (let HC = 0; HC <= s.healthyDefendingCities; HC++) {
        for (let DC = 0; DC <= (s.damagedDefendingCities + (s.healthyDefendingCities - HC)); DC++) {
            for (let HS = 0; HS <= s.healthyDefendingSpaceports; HS++) {
                for (let DS = 0; DS <= (s.damagedDefendingSpaceports + (s.healthyDefendingSpaceports - HS)); DS++) {
                    let hitPointsUsed = 2 * (s.healthyDefendingCities - HC) + (s.damagedDefendingCities - DC) + 2 * (s.healthyDefendingSpaceports - HS) + (s.damagedDefendingSpaceports - DS);
                    //Check if the correct number of hit points were used
                    if (hitPointsUsed !== hits)
                        continue;
                    //Valid result, push to the results array
                    results.push({
                        healthyCities: HC,
                        damagedCities: DC,
                        healthySpaceports: HS,
                        damagedSpaceports: DS,
                        outrages: s.healthyDefendingCities + s.damagedDefendingCities - (HC + DC),
                        trophies: (s.healthyDefendingCities - HC) + (s.damagedDefendingCities - DC) + (s.healthyDefendingSpaceports - HS) + (s.damagedDefendingSpaceports - DS)
                    });
                }
            }
        }
    }
    //Save the results as having been seen before
    seenBuildingStates[stateKey] = results;
    return results;
}
// Returns all possible ways symbols can be applied to a scenario
function applySymbolsToScenario(startScenario, symbolCounts) {
    // We are going to completely re-write this function as the breath first seach is actually far more complicated than we need to go
    // This instead can be accomplished with relativly simple combinatorics that should run much faster
    function getHealthyDamagedResults(hits, healthyShips, damagedShips) {
        let hitsToAttackerHealthyShips = Math.min(hits, healthyShips);
        let hitsToAttackerDamagedShips = hits - hitsToAttackerHealthyShips;
        let healthy = healthyShips - hitsToAttackerHealthyShips; //Fewest healthy ships possible
        let damaged = Math.max(damagedShips + hitsToAttackerHealthyShips - hitsToAttackerDamagedShips, 0); //Most damaged ships possible
        const healthyDamagedResults = [];
        while (healthy <= healthyShips && damaged >= 0) {
            healthyDamagedResults.push({ healthy, damaged, trophies: healthyShips + damagedShips - (healthy + damaged) });
            healthy++;
            damaged -= 2;
        }
        return healthyDamagedResults;
    }
    //Calculate the output scenarios for the attacking ships
    let hitsToAttacker = symbolCounts.fire + (symbolCounts.intercept > 0 ? startScenario.healthyDefendingShips : 0);
    let attackerShipResults = getHealthyDamagedResults(hitsToAttacker, startScenario.healthyAttackingShips, startScenario.damagedAttackingShips);
    console.log("Attacker Ship Results:", attackerShipResults);
    //Calculate the output scenarios for the defending ships
    let defenderShipResults = getHealthyDamagedResults(symbolCounts.hit, startScenario.healthyDefendingShips, startScenario.damagedDefendingShips);
    console.log("Defender Ship Results:", defenderShipResults);
    let defenderHitPointsAvailable = 2 * startScenario.healthyDefendingShips + startScenario.damagedDefendingShips;
    //Calculate the output scenarios for the defending buildings
    let hitsToDefenderBuildings = symbolCounts.triangle + Math.max(symbolCounts.hit - defenderHitPointsAvailable, 0);
    let defenderBuildingResults = getBruteBuildingDamageResults(hitsToDefenderBuildings, startScenario);
    console.log("Defender Building Results:", defenderBuildingResults);
    // Track all possible scenarios
    const results = [];
    // For each combination of attacking and defending ships and building results create a new scenario 
    for (const AS of attackerShipResults) {
        for (const DS of defenderShipResults) {
            for (const B of defenderBuildingResults) {
                const newScenario = {
                    healthyAttackingShips: AS.healthy,
                    damagedAttackingShips: AS.damaged,
                    healthyDefendingShips: DS.healthy,
                    damagedDefendingShips: DS.damaged,
                    healthyDefendingCities: B.healthyCities,
                    damagedDefendingCities: B.damagedCities,
                    healthyDefendingSpaceports: B.healthySpaceports,
                    damagedDefendingSpaceports: B.damagedSpaceports,
                    attackerActionPips: startScenario.attackerActionPips - 1,
                    diceSelection: startScenario.diceSelection, //This should really not be contained in the scenario TODO
                    goal: startScenario.goal,
                    keysAvailable: AS.healthy + AS.damaged > 0 ? symbolCounts.key : 0, //keys avaliable only if ships remaining
                    outragesProvoked: B.outrages,
                    attackerTrophies: DS.trophies + B.trophies,
                    defenderTrophies: AS.trophies
                };
                results.push(newScenario);
            }
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
    healthyAttackingShipsInput.value = '2';
    const damagedAttackingShipsInput = createInput('damaged-attacking-ships', 'Damaged Attacking Ships');
    damagedAttackingShipsInput.value = '1';
    const healthyDefendingShipsInput = createInput('healthy-defending-ships', 'Healthy Defending Ships');
    healthyDefendingShipsInput.value = '1';
    const damagedDefendingShipsInput = createInput('damaged-defending-ships', 'Damaged Defending Ships');
    damagedDefendingShipsInput.value = '1';
    const healthyDefendingCitiesInput = createInput('healthy-defending-cities', 'Healthy Defending Cities');
    healthyDefendingCitiesInput.value = '0';
    const damagedDefendingCitiesInput = createInput('damaged-defending-cities', 'Damaged Defending Cities');
    damagedDefendingCitiesInput.value = '1';
    const healthyDefendingSpaceportsInput = createInput('healthy-defending-spaceports', 'Healthy Defending Spaceports');
    healthyDefendingSpaceportsInput.value = '1';
    const damagedDefendingSpaceportsInput = createInput('damaged-defending-spaceports', 'Damaged Defending Spaceports');
    damagedDefendingSpaceportsInput.value = '0';
    const attackerActionPipsInput = createInput('attacker-action-pips', 'Attacker Action Pips');
    attackerActionPipsInput.value = '1';
    const assaultDiceInput = createInput('assault-dice', 'Assault Dice');
    assaultDiceInput.value = '1';
    const skirmishDiceInput = createInput('skirmish-dice', 'Skirmish Dice');
    skirmishDiceInput.value = '1';
    const raidDiceInput = createInput('raid-dice', 'Raid Dice');
    raidDiceInput.value = '1';
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
                keysAvailable: 0,
                outragesProvoked: 0,
                attackerTrophies: 0,
                defenderTrophies: 0
            };
            scenarios[currentIdx].scenario = scenario;
            console.log('Running scenario:', scenario);
            let root = new ScenarioNode(scenario);
            console.log(root);
            return;
            // --- Run the test for this scenario ---
            console.log('STARTING TEST FOR SCENARIO:', scenario);
            const diceOptions = generateDiceOptions(scenario);
            if (!diceOptions || diceOptions.length === 0) {
                console.log('No dice options available for scenario.');
                return;
            }
            const randomIdx = 15; //Math.floor(Math.random() * diceOptions.length); 
            const randomDiceSelection = diceOptions[randomIdx];
            if (!randomDiceSelection) {
                console.log('No valid dice selection.');
                return;
            }
            //const symbolCounts = rollDice(randomDiceSelection);
            if (!symbolCounts) {
                console.log('No symbol counts generated.');
                return;
            }
            const possibleScenarios = applySymbolsToScenario(scenario, symbolCounts);
            if (!possibleScenarios || possibleScenarios.length === 0) {
                console.log('No possible outcome scenarios.');
                return;
            }
            console.log(`Random dice selection (${randomIdx} of ${diceOptions.length}):`, randomDiceSelection);
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
            keysAvailable: 0,
            outragesProvoked: 0,
            attackerTrophies: 0,
            defenderTrophies: 0
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