// Dice face symbols
type DiceSymbol = 'fire' | 'intercept' | 'hit' | 'triangle' | 'key';
// Each face can have multiple symbols
type DiceFace = DiceSymbol[];
// Dice data structure: array of 6 faces
type DiceType = DiceFace[];
// Assault Dice: fill in with your data
const assaultDice: DiceType = [
    // Example: each array is a face, add/remove symbols as needed
    ['hit', 'hit'],
    ['hit', 'hit', 'fire'],
    ['hit', 'intercept'],
    ['hit', 'fire'],
    ['hit', 'fire'],
    []
];
// Skirmish Dice: fill in with your data
const skirmishDice: DiceType = [
    ['hit'],
    ['hit'],
    ['hit'],
    [],
    [],
    []
];
// Raid Dice: fill in with your data
const raidDice: DiceType = [
    ['intercept', 'key', 'key'],
    ['fire', 'key'],
    ['triangle', 'key'],
    ['triangle','fire'],
    ['triangle', 'fire'],
    ['intercept']
];
// Run the simulation for a scenario and return a new scenario (result)
function rollDice(input: Scenario): Record<DiceSymbol, number> {
    // Count symbols for all dice
    const symbolCounts: Record<DiceSymbol, number> = {
        fire: 0,
        intercept: 0,
        hit: 0,
        triangle: 0,
        key: 0
    };

    function roll(dice: DiceType, num: number) {
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

    roll(assaultDice, input.assaultDice);
    roll(skirmishDice, input.skirmishDice);
    roll(raidDice, input.raidDice);

    console.log(symbolCounts);
    return symbolCounts;
}
// Automatically add a scenario when the page loads
window.addEventListener('DOMContentLoaded', () => {
    addScenarioBtn.click();
});
// main.ts

type Scenario = {
    healthyAttackingShips: number;
    damagedAttackingShips: number;
    healthyDefendingShips: number;
    damagedDefendingShips: number;
    healthyDefendingCities: number;
    damagedDefendingCities: number;
    healthyDefendingSpaceports: number;
    damagedDefendingSpaceports: number;
    attackerActionPips: number;
    assaultDice: number;
    skirmishDice: number;
    raidDice: number;
    goal: 'complete destruction' | 'loss minimization' | 'key maximization';
};

const addScenarioBtn = document.getElementById('add-scenario') as HTMLButtonElement;
let scenarioList = document.getElementById('scenario-list') as HTMLUListElement;
if (!scenarioList) {
    scenarioList = document.createElement('ul');
    scenarioList.id = 'scenario-list';
    document.querySelector('.container')?.appendChild(scenarioList);
}

type ScenarioInputs = {
    healthyAttackingShipsInput: HTMLInputElement;
    damagedAttackingShipsInput: HTMLInputElement;
    healthyDefendingShipsInput: HTMLInputElement;
    damagedDefendingShipsInput: HTMLInputElement;
    healthyDefendingCitiesInput: HTMLInputElement;
    damagedDefendingCitiesInput: HTMLInputElement;
    healthyDefendingSpaceportsInput: HTMLInputElement;
    damagedDefendingSpaceportsInput: HTMLInputElement;
    attackerActionPipsInput: HTMLInputElement;
    assaultDiceInput: HTMLInputElement;
    skirmishDiceInput: HTMLInputElement;
    raidDiceInput: HTMLInputElement;
    goalSelect: HTMLSelectElement;
};

const scenarios: { scenario: Scenario; inputs: ScenarioInputs; }[] = [];

addScenarioBtn.addEventListener('click', () => {
    // Create input elements for a new scenario
    const li = document.createElement('li');
    li.className = 'scenario-item';

    function createInput(id: string, label: string): HTMLInputElement {
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
        input.addEventListener('focus', function() {
            input.select();
        });
        input.addEventListener('change', function() {
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
            const scenario: Scenario = {
                healthyAttackingShips: Number(healthyAttackingShipsInput.value),
                damagedAttackingShips: Number(damagedAttackingShipsInput.value),
                healthyDefendingShips: Number(healthyDefendingShipsInput.value),
                damagedDefendingShips: Number(damagedDefendingShipsInput.value),
                healthyDefendingCities: Number(healthyDefendingCitiesInput.value),
                damagedDefendingCities: Number(damagedDefendingCitiesInput.value),
                healthyDefendingSpaceports: Number(healthyDefendingSpaceportsInput.value),
                damagedDefendingSpaceports: Number(damagedDefendingSpaceportsInput.value),
                attackerActionPips: Number(attackerActionPipsInput.value),
                assaultDice: Number(assaultDiceInput.value),
                skirmishDice: Number(skirmishDiceInput.value),
                raidDice: Number(raidDiceInput.value),
                goal: goalSelect.value as Scenario['goal'],
            };
            scenarios[currentIdx].scenario = scenario;
            console.log('Running scenario:', scenario);
            rollDice(scenario);
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
            assaultDice: Number(assaultDiceInput.value),
            skirmishDice: Number(skirmishDiceInput.value),
            raidDice: Number(raidDiceInput.value),
            goal: goalSelect.value as Scenario['goal'],
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