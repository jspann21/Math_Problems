import { animationSystem } from './animations.js';
import { setupScratchpad, shuffleArray } from './shared.js';

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createNumberOptions(correctAnswer, formatLabel, config = {}) {
  const {
    count = 4,
    min = 0,
    max = Number.POSITIVE_INFINITY,
    offsets = [-3, -2, -1, 1, 2, 3],
    fallbackStep = 1,
  } = config;

  const values = new Set([correctAnswer]);

  for (const offset of shuffleArray([...offsets])) {
    const candidate = correctAnswer + offset;
    if (candidate >= min && candidate <= max && candidate !== correctAnswer) {
      values.add(candidate);
    }
    if (values.size === count) {
      break;
    }
  }

  let attempts = 0;
  while (values.size < count && attempts < 120) {
    const spread = Math.max(fallbackStep * 3, Math.ceil(Math.max(correctAnswer, 4) * 0.35));
    const candidate = correctAnswer + randomInt(-spread, spread);
    if (candidate >= min && candidate <= max && candidate !== correctAnswer) {
      values.add(candidate);
    }
    attempts += 1;
  }

  let distance = 1;
  while (values.size < count) {
    for (const direction of [1, -1]) {
      const candidate = correctAnswer + direction * distance * fallbackStep;
      if (candidate >= min && candidate <= max && candidate !== correctAnswer) {
        values.add(candidate);
      }
      if (values.size === count) {
        break;
      }
    }
    distance += 1;
  }

  return shuffleArray([...values]).map((value) => ({
    value: String(value),
    label: formatLabel(value),
  }));
}

export function startMultipleChoicePage({
  generateProblem,
  problemElementId = 'problem-text',
  optionsContainerId = 'options-container',
  prevButtonId = 'prev-problem',
  nextButtonId = 'next-problem',
}) {
  document.addEventListener('DOMContentLoaded', () => {
    const problemElement = document.getElementById(problemElementId);
    const optionsContainer = document.getElementById(optionsContainerId);
    const prevButton = document.getElementById(prevButtonId);
    const nextButton = document.getElementById(nextButtonId);

    if (!problemElement || !optionsContainer || !prevButton || !nextButton) {
      return;
    }

    let currentProblem = null;
    const problemHistory = [];
    let currentHistoryIndex = -1;

    function setNavigationState() {
      prevButton.disabled = currentHistoryIndex <= 0;
      nextButton.disabled = false;
    }

    function displayProblem(problemData) {
      currentProblem = problemData;
      problemElement.innerHTML = problemData.promptHtml;
      optionsContainer.innerHTML = '';

      for (const option of currentProblem.options) {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option.label;
        button.dataset.value = option.value;
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
      const nextProblem = generateProblem();
      problemHistory.push(nextProblem);
      currentHistoryIndex = problemHistory.length - 1;
      displayProblem(nextProblem);
    }

    function handleOptionClick(selectedButton) {
      if (!currentProblem || selectedButton.disabled) {
        return;
      }

      const selectedValue = selectedButton.dataset.value;
      const allOptions = optionsContainer.querySelectorAll('.option');
      allOptions.forEach((option) => {
        option.disabled = true;
      });

      if (selectedValue === currentProblem.correctValue) {
        animationSystem.handleCorrectAnswer(selectedButton, allOptions, () => {
          generateAndShowNewProblem();
        });
        return;
      }

      animationSystem.handleWrongAnswer(selectedButton);
      setTimeout(() => {
        allOptions.forEach((option) => {
          option.disabled = false;
        });
      }, 550);
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
}
