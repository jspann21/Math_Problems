import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

const ROUNDING_UNITS = [10, 100, 1000, 10000, 100000];
const LARGE_ROUNDING_UNITS = [10000, 100000];
const DEFAULT_ROUNDING_MODE = '10000';
const VALID_ROUNDING_MODES = new Set([
    ...ROUNDING_UNITS.map(String),
    'mixed-large',
    'mixed',
]);
const PLACE_LABELS = ['Hundred-thousands', 'Ten-thousands', 'Thousands', 'Hundreds', 'Tens', 'Ones'];
const SHORT_PLACE_LABELS = ['100,000s', '10,000s', '1,000s', '100s', '10s', '1s'];
const PLACE_UNITS = [100000, 10000, 1000, 100, 10, 1];
const QUESTION_PATTERN = ['round', 'relationship', 'nearer', 'round', 'boundary'];
const QUESTION_LABELS = {
    round: 'Round the number',
    relationship: 'Compare with halfway',
    nearer: 'Choose the nearer benchmark',
    boundary: 'Find the rounding range',
};

const modeSelect = document.getElementById('rounding-mode');
const problemCount = document.getElementById('problem-count');
const question = document.getElementById('rounding-question');
const hintButton = document.getElementById('hint-button');
const roundingVisual = document.getElementById('rounding-visual');
const placeValueHeading = document.getElementById('place-value-heading');
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

function formatChoice(value) {
    return typeof value === 'number' ? formatNumber(value) : value;
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSelectedUnit() {
    const selectedMode = VALID_ROUNDING_MODES.has(modeSelect.value)
        ? modeSelect.value
        : DEFAULT_ROUNDING_MODE;

    if (modeSelect.value !== selectedMode) {
        modeSelect.value = selectedMode;
    }

    if (selectedMode === 'mixed-large') {
        return LARGE_ROUNDING_UNITS[randomInteger(0, LARGE_ROUNDING_UNITS.length - 1)];
    }

    if (selectedMode === 'mixed') {
        return ROUNDING_UNITS[randomInteger(0, ROUNDING_UNITS.length - 1)];
    }

    return Number(selectedMode);
}

function getMaximumValue(unit) {
    return unit >= 10000 ? 999999 : 99999;
}

function getNumberForUnit(unit, kind) {
    const maximum = getMaximumValue(unit);
    const lowerMultiplier = randomInteger(0, Math.floor(maximum / unit));
    const lower = lowerMultiplier * unit;
    const maximumOffset = Math.min(unit - 1, maximum - lower);
    const midpointOffset = unit / 2;
    let offset;

    const midpointChance = kind === 'relationship' ? 0.34 : 0.2;
    if (maximumOffset >= midpointOffset && Math.random() < midpointChance) {
        offset = midpointOffset;
    } else if (maximumOffset >= midpointOffset && Math.random() < 0.55) {
        const spread = Math.max(1, Math.floor(unit * 0.18));
        offset = midpointOffset + randomInteger(-spread, spread);
    } else {
        offset = randomInteger(Math.min(1, maximumOffset), maximumOffset);
    }

    if (kind === 'nearer' && offset === midpointOffset) {
        offset += midpointOffset < maximumOffset ? 1 : -1;
    }

    return lower + offset;
}

function makeRoundChoices(problem) {
    const choices = new Set([problem.answer]);

    [
        problem.lower,
        problem.upper,
        problem.value,
        problem.midpoint,
        problem.answer - problem.unit,
        problem.answer + problem.unit,
    ].forEach((choice) => {
        if (choice >= 0) choices.add(choice);
    });

    return shuffleArray(Array.from(choices).slice(0, 4));
}

function makeNearerChoices(problem) {
    const choices = new Set([
        problem.answer,
        problem.answer === problem.lower ? problem.upper : problem.lower,
        Math.max(0, problem.lower - problem.unit),
        problem.upper + problem.unit,
    ]);

    return shuffleArray(Array.from(choices).slice(0, 4));
}

function makeBoundaryChoices(problem) {
    const choices = new Set([problem.answer]);
    [
        problem.answer - 1,
        problem.answer + 1,
        problem.least,
        problem.greatest,
        problem.least - 1,
        problem.greatest + 1,
        problem.target,
    ].forEach((choice) => {
        if (choice >= 0) choices.add(choice);
    });

    return shuffleArray(Array.from(choices).slice(0, 4));
}

function createBoundaryProblem(unit, index) {
    const maximumTargetMultiplier = Math.max(1, Math.floor(getMaximumValue(unit) / unit));
    const target = randomInteger(1, maximumTargetMultiplier) * unit;
    const least = target - unit / 2;
    const greatest = target + unit / 2 - 1;
    const asksForLeast = index % 2 === 0;
    const answer = asksForLeast ? least : greatest;
    const problem = {
        kind: 'boundary',
        unit,
        target,
        least,
        greatest,
        asksForLeast,
        answer,
        prompt: `A whole number rounds to ${formatNumber(target)} when rounded to the nearest ${formatNumber(unit)}. What is the ${asksForLeast ? 'least' : 'greatest'} possible whole number?`,
    };

    problem.choices = makeBoundaryChoices(problem);
    return problem;
}

function createRoundingProblem(unit, kind) {
    const value = getNumberForUnit(unit, kind);
    const lower = Math.floor(value / unit) * unit;
    const upper = lower + unit;
    const midpoint = lower + unit / 2;
    const roundedAnswer = Math.round(value / unit) * unit;
    const problem = { kind, value, unit, lower, upper, midpoint };

    if (kind === 'relationship') {
        problem.answer = value < midpoint ? 'Less than' : value > midpoint ? 'Greater than' : 'Exactly at';
        problem.prompt = `Where is ${formatNumber(value)} compared with the halfway point, ${formatNumber(midpoint)}?`;
        problem.choices = shuffleArray(['Less than', 'Greater than', 'Exactly at']);
    } else if (kind === 'nearer') {
        problem.answer = value < midpoint ? lower : upper;
        problem.prompt = `Which benchmark is ${formatNumber(value)} nearer to?`;
        problem.choices = makeNearerChoices(problem);
    } else {
        problem.answer = roundedAnswer;
        problem.prompt = `Round ${formatNumber(value)} to the nearest ${formatNumber(unit)}.`;
        problem.choices = makeRoundChoices(problem);
    }

    return problem;
}

function createProblem(index) {
    const unit = getSelectedUnit();
    const kind = QUESTION_PATTERN[index % QUESTION_PATTERN.length];

    if (kind === 'boundary') {
        return createBoundaryProblem(unit, index);
    }

    return createRoundingProblem(unit, kind);
}

function renderPlaceValue(problem) {
    const visualValue = problem.kind === 'boundary' ? problem.answer : problem.value;
    const digits = String(visualValue).padStart(6, '0').split('');
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

    if (problem.kind === 'boundary') {
        placeValueHeading.textContent = `1. Check the ${problem.asksForLeast ? 'least' : 'greatest'} boundary number.`;
        digitRule.innerHTML = `<strong>${formatNumber(problem.least)} through ${formatNumber(problem.greatest)}</strong> all round to ${formatNumber(problem.target)}.`;
        return;
    }

    placeValueHeading.textContent = '1. Find the rounding place. Then look one digit right.';

    const decidingDigit = digits[decidingIndex];
    digitRule.innerHTML = `<strong>The deciding digit is ${decidingDigit}.</strong> ${Number(decidingDigit) >= 5 ? `${decidingDigit} is 5 or more, so round up.` : `${decidingDigit} is 4 or less, so round down.`}`;
}

function renderNumberLine(problem) {
    if (problem.kind === 'boundary') {
        numberLineHeading.textContent = '2. The rounding range lies between the two halfway points.';
        lowerLabel.textContent = formatNumber(problem.target - problem.unit);
        midpointLabel.textContent = formatNumber(problem.target);
        upperLabel.textContent = formatNumber(problem.target + problem.unit);
        markerLabel.textContent = formatNumber(problem.answer);
        marker.style.left = problem.asksForLeast ? '25%' : '75%';
        return;
    }

    markerLabel.textContent = formatNumber(problem.value);

    numberLineHeading.textContent = `${formatNumber(problem.midpoint)} is halfway between the two benchmarks.`;
    lowerLabel.textContent = formatNumber(problem.lower);
    midpointLabel.textContent = formatNumber(problem.midpoint);
    upperLabel.textContent = formatNumber(problem.upper);

    const rawPosition = ((problem.value - problem.lower) / problem.unit) * 100;
    marker.style.left = `${Math.min(100, Math.max(0, rawPosition))}%`;
}

function setNavigationState() {
    prevButton.disabled = currentProblemIndex === 0;
    nextButton.disabled = false;
}

function setHintVisibility(isVisible) {
    roundingVisual.hidden = !isVisible;
    hintButton.setAttribute('aria-expanded', String(isVisible));
    hintButton.textContent = isVisible ? 'Hide hint' : '💡 Show hint';
}

function displayProblem() {
    const problem = problems[currentProblemIndex];
    setHintVisibility(false);
    problemCount.textContent = `Question ${currentProblemIndex + 1} · ${QUESTION_LABELS[problem.kind]}`;
    question.textContent = problem.prompt;

    renderPlaceValue(problem);
    renderNumberLine(problem);

    optionsContainer.innerHTML = '';
    problem.choices.forEach((choice) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = formatChoice(choice);
        button.addEventListener('click', () => handleOptionClick(button, choice));
        optionsContainer.appendChild(button);
    });

    setNavigationState();
}

function goToProblem(index) {
    if (index < 0) return;

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
            goToProblem(currentProblemIndex + 1);
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
    if (VALID_ROUNDING_MODES.has(requestedMode)) {
        modeSelect.value = requestedMode;
    }

    if (!VALID_ROUNDING_MODES.has(modeSelect.value)) {
        modeSelect.value = DEFAULT_ROUNDING_MODE;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupScratchpad();
    setInitialMode();

    hintButton.addEventListener('click', () => {
        setHintVisibility(roundingVisual.hidden);
    });
    modeSelect.addEventListener('change', resetPractice);
    prevButton.addEventListener('click', () => goToProblem(currentProblemIndex - 1));
    nextButton.addEventListener('click', () => goToProblem(currentProblemIndex + 1));

    resetPractice();
});
