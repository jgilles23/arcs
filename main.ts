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
                goal: goalSelect.value as Scenario['goal'],
            };
            scenarios[currentIdx].scenario = scenario;
            console.log('Running scenario:', scenario);
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
            goalSelect,
        }
    });
});