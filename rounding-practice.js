import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

const ROUNDING_UNITS = [1, 10, 100, 1000, 10000];
const PLACE_LABELS = ['Ten-thousands', 'Thousands', 'Hundreds', 'Tens', 'Ones'];
const SHORT_PLACE_LABELS = ['10,000s', '1,000s', '100s', '10s', '1s'];
const PLACE_UNITS = [10000, 1000, 100, 10, 1];
const MAX_QUESTIONS = 20;

const modeSelect = document.getElementById('rounding-mode');
const problemCount = document.getElementById('problem-count');
const question = document.getElementById('rounding-question');
const placeValueGrid = document.getElementById('place-value-grid');
const digitRule = document.getElementById('digit-rule');
const numberLineHeading = document.getElementById('number-line-heading');
const numberLine = document.getElementById('rounding-number-line');
const lowerLabel = document.getElementById('lower-label');
const midpointLabel = document.getElementById('midpoint-label');
const upperLabel = document.getElementById('upper-label');
const marker = document.getElementById('number-marker');
const markerLabel = document.getElementById('marker-label');
const optionsContainer = document.getElementById('options-container');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');

let problems = [];
let currentProblemIndex = 0;

function formatNumber(value) {
    return value.toLocaleString('en-US');
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSelectedUnit() {
    if (modeSelect.value === 'mixed') {
        return ROUNDING_UNITS[randomInteger(0, ROUNDING_UNITS.length - 1)];
    }
    return Number(modeSelect.value);
}

function getNumberForUnit(unit) {
    if (unit === 1) {
        return randomInteger(101, 99999);
    }

    const minimum = unit === 10000 ? 10000 : Math.max(101, unit);
    let value = randomInteger(minimum, 99999);

    // Keep the deciding digit meaningful, with extra practice close to the midpoint.
    if (unit === 1000 && Math.random() < 0.55) {
        const lower = randomInteger(1, 98) * unit;
        const midpointOffset = randomInteger(-180, 180);
        value = Math.min(99999, Math.max(1000, lower + unit / 2 + midpointOffset));
    }

    if (value % unit === 0) {
        value += randomInteger(1, Math.max(1, unit - 1));
    }

    return Math.min(value, 99999);
}

function makeChoices(value, unit, lower, upper, answer) {
    const choices = new Set([answer]);

    if (unit === 1) {
        [value - 1, value + 1, value + 10, value - 10, value + 2].forEach((choice) => {
            if (choice >= 0) choices.add(choice);
        });
    } else {
        [lower, upper, lower - unit, upper + unit, answer - 2 * unit, answer + 2 * unit].forEach((choice) => {
            if (choice >= 0) choices.add(choice);
        });
    }

    return shuffleArray(Array.from(choices).slice(0, 4));
}

function createProblem() {
    const unit = getSelectedUnit();
    const value = getNumberForUnit(unit);
    const lower = unit === 1 ? value : Math.floor(value / unit) * unit;
    const upper = unit === 1 ? value : lower + unit;
    const midpoint = unit === 1 ? value : lower + unit / 2;
    const answer = unit === 1 ? value : Math.round(value / unit) * unit;

    return {
        value,
        unit,
        lower,
        upper,
        midpoint,
        answer,
        choices: makeChoices(value, unit, lower, upper, answer),
    };
}

function renderPlaceValue(problem) {
    const digits = String(problem.value).padStart(5, '0').split('');
    const targetIndex = PLACE_UNITS.indexOf(problem.unit);
    const decidingIndex = targetIndex + 1;

    placeValueGrid.innerHTML = PLACE_LABELS.map((label, index) => {
        const classes = ['place-value-cell'];
        if (index === targetIndex) classes.push('rounding-place');
        if (index === decidingIndex) classes.push('deciding-place');

        return `
            <div class="${classes.join(' ')}">
                <span class="place-value-label place-value-label-long">${label}</span>
                <span class="place-value-label place-value-label-short">${SHORT_PLACE_LABELS[index]}</span>
                <strong class="place-value-digit">${digits[index]}</strong>
                ${index === targetIndex ? '<span class="place-value-note">round here</span>' : ''}
                ${index === decidingIndex ? '<span class="place-value-note">look here</span>' : ''}
            </div>
        `;
    }).join('');

    if (problem.unit === 1) {
        digitRule.textContent = 'Ones is the last place. A whole number stays the same when rounded to the nearest 1.';
        return;
    }

    const decidingDigit = digits[decidingIndex];
    digitRule.innerHTML = `<strong>The deciding digit is ${decidingDigit}.</strong> ${Number(decidingDigit) >= 5 ? `${decidingDigit} is 5 or more, so round up.` : `${decidingDigit} is 4 or less, so round down.`}`;
}

function renderNumberLine(problem) {
    markerLabel.textContent = formatNumber(problem.value);

    if (problem.unit === 1) {
        numberLine.classList.add('single-value');
        numberLineHeading.textContent = '2. The number is already on an exact one.';
        lowerLabel.textContent = formatNumber(problem.value - 1);
        midpointLabel.textContent = formatNumber(problem.value);
        upperLabel.textContent = formatNumber(problem.value + 1);
        marker.style.left = '50%';
        return;
    }

    numberLine.classList.remove('single-value');
    numberLineHeading.textContent = '2. See which benchmark is closer.';
    lowerLabel.textContent = formatNumber(problem.lower);
    midpointLabel.textContent = formatNumber(problem.midpoint);
    upperLabel.textContent = formatNumber(problem.upper);

    const rawPosition = ((problem.value - problem.lower) / problem.unit) * 100;
    marker.style.left = `${Math.min(100, Math.max(0, rawPosition))}%`;
}

function setNavigationState() {
    prevButton.disabled = currentProblemIndex === 0;
    nextButton.disabled = currentProblemIndex >= MAX_QUESTIONS - 1;
}

function displayProblem() {
    const problem = problems[currentProblemIndex];
    problemCount.textContent = `Question ${currentProblemIndex + 1} of ${MAX_QUESTIONS}`;
    question.textContent = `Round ${formatNumber(problem.value)} to the nearest ${formatNumber(problem.unit)}.`;

    renderPlaceValue(problem);
    renderNumberLine(problem);

    optionsContainer.innerHTML = '';
    problem.choices.forEach((choice) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = formatNumber(choice);
        button.addEventListener('click', () => handleOptionClick(button, choice));
        optionsContainer.appendChild(button);
    });

    setNavigationState();
}

function goToProblem(index) {
    if (index < 0 || index >= MAX_QUESTIONS) return;

    while (problems.length <= index) {
        problems.push(createProblem());
    }

    currentProblemIndex = index;
    displayProblem();
}

function handleOptionClick(selectedOption, selectedValue) {
    if (selectedOption.disabled) return;

    const problem = problems[currentProblemIndex];
    if (selectedValue === problem.answer) {
        const allOptions = optionsContainer.querySelectorAll('.option');
        animationSystem.handleCorrectAnswer(selectedOption, allOptions, () => {
            if (currentProblemIndex < MAX_QUESTIONS - 1) {
                goToProblem(currentProblemIndex + 1);
            }
        });
    } else {
        animationSystem.handleWrongAnswer(selectedOption);
    }
}

function resetPractice() {
    problems = [createProblem()];
    currentProblemIndex = 0;
    displayProblem();
}

document.addEventListener('DOMContentLoaded', () => {
    setupScratchpad();

    modeSelect.addEventListener('change', resetPractice);
    prevButton.addEventListener('click', () => goToProblem(currentProblemIndex - 1));
    nextButton.addEventListener('click', () => goToProblem(currentProblemIndex + 1));

    resetPractice();
});
