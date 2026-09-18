import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

const PLACE_UNITS = [10, 100, 1000, 10000, 100000];
const LARGE_PLACE_UNITS = [10000, 100000];
const DEFAULT_MODE = '10000';
const VALID_MODES = new Set([
    ...PLACE_UNITS.map(String),
    'mixed-large',
    'mixed',
]);
const NUMBER_WORDS = {
    10: 'ten',
    100: 'one hundred',
    1000: 'one thousand',
    10000: 'ten thousand',
    100000: 'one hundred thousand',
};
const PLACE_LABELS = [
    ['100,000s', '100K'],
    ['10,000s', '10K'],
    ['1,000s', '1K'],
    ['100s', '100s'],
    ['10s', '10s'],
    ['1s', '1s'],
];
const MAX_VALUE = 999999;
const MAX_QUESTIONS = 20;

const modeSelect = document.getElementById('place-value-mode');
const problemCount = document.getElementById('problem-count');
const question = document.getElementById('place-value-question');
const hintButton = document.getElementById('hint-button');
const placeValueVisual = document.getElementById('place-value-visual');
const hintHeading = document.getElementById('hint-heading');
const changeEquation = document.getElementById('place-change-equation');
const changeTable = document.getElementById('place-change-table');
const changeRule = document.getElementById('place-change-rule');
const optionsContainer = document.getElementById('options-container');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');

let problems = [];
let currentProblemIndex = 0;

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(value) {
    return value.toLocaleString('en-US');
}

function getSelectedUnit() {
    const selectedMode = VALID_MODES.has(modeSelect.value) ? modeSelect.value : DEFAULT_MODE;

    if (modeSelect.value !== selectedMode) {
        modeSelect.value = selectedMode;
    }

    if (selectedMode === 'mixed-large') {
        return LARGE_PLACE_UNITS[randomInteger(0, LARGE_PLACE_UNITS.length - 1)];
    }

    if (selectedMode === 'mixed') {
        return PLACE_UNITS[randomInteger(0, PLACE_UNITS.length - 1)];
    }

    return Number(selectedMode);
}

function makeChoices(base, answer, unit, direction) {
    const candidates = [
        answer,
        base,
        base - direction * unit,
        base + direction * (unit / 10),
        base + direction * unit * 10,
        answer - unit,
        answer + unit,
        answer - unit / 10,
        answer + unit / 10,
    ];
    const choices = new Set();

    candidates.forEach((candidate) => {
        if (Number.isInteger(candidate) && candidate >= 0 && candidate <= MAX_VALUE) {
            choices.add(candidate);
        }
    });

    let distance = 2;
    while (choices.size < 4) {
        [answer - distance * unit, answer + distance * unit].forEach((candidate) => {
            if (candidate >= 0 && candidate <= MAX_VALUE) choices.add(candidate);
        });
        distance += 1;
    }

    const distractors = shuffleArray([...choices].filter((choice) => choice !== answer)).slice(0, 3);
    return shuffleArray([answer, ...distractors]);
}

function createProblem(index) {
    const unit = getSelectedUnit();
    const direction = index % 2 === 0 ? 1 : -1;
    const minimumBase = direction === -1 ? Math.max(100000, unit) : 100000;
    const maximumBase = direction === 1 ? MAX_VALUE - unit : MAX_VALUE;
    const base = randomInteger(minimumBase, maximumBase);
    const answer = base + direction * unit;
    const comparison = direction === 1 ? 'greater' : 'less';

    return {
        unit,
        direction,
        base,
        answer,
        comparison,
        prompt: `What number is ${NUMBER_WORDS[unit]} ${comparison} than ${formatNumber(base)}?`,
        choices: makeChoices(base, answer, unit, direction),
    };
}

function renderDigitRow(label, value, comparisonValue) {
    const digits = String(value).padStart(6, '0').split('');
    const comparisonDigits = String(comparisonValue).padStart(6, '0').split('');

    return `
        <div class="place-change-row-label">${label}</div>
        ${digits.map((digit, index) => `
            <div class="place-change-digit${digit !== comparisonDigits[index] ? ' changed-place' : ''}">${digit}</div>
        `).join('')}
    `;
}

function renderHint(problem) {
    const operation = problem.direction === 1 ? 'Add' : 'Subtract';
    const symbol = problem.direction === 1 ? '+' : '−';

    hintHeading.textContent = `${operation} ${formatNumber(problem.unit)}. Watch the ${formatNumber(problem.unit)} place.`;
    changeEquation.textContent = `${formatNumber(problem.base)} ${symbol} ${formatNumber(problem.unit)} = ?`;
    changeTable.innerHTML = `
        <div class="place-change-row-label" aria-hidden="true"></div>
        ${PLACE_LABELS.map(([longLabel, shortLabel]) => `
            <div class="place-change-label">
                <span class="place-change-label-long">${longLabel}</span>
                <span class="place-change-label-short">${shortLabel}</span>
            </div>
        `).join('')}
        ${renderDigitRow('Start', problem.base, problem.answer)}
        ${renderDigitRow('Result', problem.answer, problem.base)}
    `;
    changeRule.innerHTML = `<strong>${problem.comparison[0].toUpperCase()}${problem.comparison.slice(1)} means ${problem.direction === 1 ? 'the number increases' : 'the number decreases'}.</strong>`;
}

function setNavigationState() {
    prevButton.disabled = currentProblemIndex === 0;
    nextButton.disabled = currentProblemIndex >= MAX_QUESTIONS - 1;
}

function setHintVisibility(isVisible) {
    placeValueVisual.hidden = !isVisible;
    hintButton.setAttribute('aria-expanded', String(isVisible));
    hintButton.textContent = isVisible ? 'Hide hint' : '💡 Show hint';
}

function displayProblem() {
    const problem = problems[currentProblemIndex];
    setHintVisibility(false);
    problemCount.textContent = `Question ${currentProblemIndex + 1} of ${MAX_QUESTIONS}`;
    question.textContent = problem.prompt;
    renderHint(problem);

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
        problems.push(createProblem(problems.length));
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
    problems = [createProblem(0)];
    currentProblemIndex = 0;
    displayProblem();
}

function setInitialMode() {
    const requestedMode = new URLSearchParams(window.location.search).get('mode');
    if (VALID_MODES.has(requestedMode)) {
        modeSelect.value = requestedMode;
    }

    if (!VALID_MODES.has(modeSelect.value)) {
        modeSelect.value = DEFAULT_MODE;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupScratchpad();
    setInitialMode();

    hintButton.addEventListener('click', () => {
        setHintVisibility(placeValueVisual.hidden);
    });
    modeSelect.addEventListener('change', resetPractice);
    prevButton.addEventListener('click', () => goToProblem(currentProblemIndex - 1));
    nextButton.addEventListener('click', () => goToProblem(currentProblemIndex + 1));

    resetPractice();
});
