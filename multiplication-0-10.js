import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

const requestedFactor = new URLSearchParams(window.location.search).get('factor');
const fixedFactor = ['11', '12'].includes(requestedFactor) ? Number(requestedFactor) : null;
const maxFactor = fixedFactor === null ? 10 : 12;
const maxProduct = (fixedFactor ?? maxFactor) * maxFactor;

let currentProblemData = null;
let problemHistory = [];
let currentHistoryIndex = -1;
let remainingFactors = [];

const problemTextElement = document.getElementById('problem-text');
const optionsContainer = document.getElementById('options-container');
const prevButton = document.getElementById('prev-problem');
const nextButton = document.getElementById('next-problem');

function generateOptions(correctAnswer) {
    const options = new Set([correctAnswer]);

    while (options.size < 4) {
        const offset = Math.floor(Math.random() * 21) - 10;
        const candidate = correctAnswer + offset;
        if (candidate >= 0 && candidate <= maxProduct) {
            options.add(candidate);
        }
    }

    return shuffleArray(Array.from(options));
}

function generateProblem() {
    const num1 = fixedFactor ?? Math.floor(Math.random() * (maxFactor + 1));
    let num2;

    if (fixedFactor !== null) {
        if (remainingFactors.length === 0) {
            remainingFactors = shuffleArray(
                Array.from({ length: maxFactor + 1 }, (_, factor) => factor)
            );
        }
        num2 = remainingFactors.pop();
    } else {
        num2 = Math.floor(Math.random() * (maxFactor + 1));
    }

    const correctAnswer = num1 * num2;

    return {
        questionText: `${num1} × ${num2} = ?`,
        correctAnswer,
        options: generateOptions(correctAnswer),
    };
}

function setNavigationState() {
    prevButton.disabled = currentHistoryIndex <= 0;
    nextButton.disabled = false;
}

function displayProblem(problemData) {
    currentProblemData = problemData;
    problemTextElement.textContent = currentProblemData.questionText;

    optionsContainer.innerHTML = '';
    for (const optionValue of currentProblemData.options) {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = String(optionValue);
        button.dataset.value = String(optionValue);
        optionsContainer.appendChild(button);
    }

    setNavigationState();
}

function loadProblemFromHistory(index) {
    if (index < 0 || index >= problemHistory.length) {
        return;
    }

    currentHistoryIndex = index;
    displayProblem(problemHistory[currentHistoryIndex]);
}

function generateAndShowNewProblem() {
    const newProblem = generateProblem();
    problemHistory.push(newProblem);
    currentHistoryIndex = problemHistory.length - 1;
    displayProblem(newProblem);
}

function handleOptionClick(selectedButton) {
    if (!currentProblemData || selectedButton.disabled) {
        return;
    }

    const selectedValue = Number(selectedButton.dataset.value);
    const allOptions = optionsContainer.querySelectorAll('.option');
    allOptions.forEach((option) => {
        option.disabled = true;
    });

    const isCorrect = selectedValue === currentProblemData.correctAnswer;
    if (isCorrect) {
        animationSystem.handleCorrectAnswer(selectedButton, allOptions, () => {
            generateAndShowNewProblem();
        });
    } else {
        animationSystem.handleWrongAnswer(selectedButton);
        setTimeout(() => {
            allOptions.forEach((option) => {
                option.disabled = false;
            });
        }, 550);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (fixedFactor !== null) {
        const title = `Multiplication by ${fixedFactor} (0-12)`;
        document.title = title;
        const heading = document.querySelector('h1');
        heading.textContent = heading.textContent.replace('Multiplication (0-10)', title);
        document.querySelector('.problem-type').textContent = `${title} Problems`;
    }

    setupScratchpad();

    optionsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement) || !target.classList.contains('option')) {
            return;
        }
        handleOptionClick(target);
    });

    prevButton.addEventListener('click', () => {
        if (currentHistoryIndex > 0) {
            loadProblemFromHistory(currentHistoryIndex - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentHistoryIndex < problemHistory.length - 1) {
            loadProblemFromHistory(currentHistoryIndex + 1);
            return;
        }
        generateAndShowNewProblem();
    });

    generateAndShowNewProblem();
});
