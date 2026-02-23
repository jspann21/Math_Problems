import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

let currentProblemData = null;
let problemHistory = [];
let currentHistoryIndex = -1;

const problemTextElement = document.getElementById('problem-text');
const optionsContainer = document.getElementById('options-container');
const prevButton = document.getElementById('prev-problem');
const nextButton = document.getElementById('next-problem');

function generateOptions(correctAnswer) {
    const maxProduct = 100;
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
    const minFactor = 0;
    const maxFactor = 10;

    const num1 = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
    const num2 = Math.floor(Math.random() * (maxFactor - minFactor + 1)) + minFactor;
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
