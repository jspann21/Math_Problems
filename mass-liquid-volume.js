import { animationSystem } from './animations.js';
import { pickRandom, setupScratchpad, shuffleArray } from './shared.js';
import { createNumberOptions, randomInt } from './generated-multiple-choice.js';

const categoryConfig = {
  estimates: {
    title: 'Mass & Capacity Estimates',
    generators: [generateMassEstimateProblem, generateCapacityEstimateProblem, generateReasonableMeasureProblem],
  },
  scales: {
    title: 'Read Scales & Containers',
    generators: [generateGramScaleProblem, generateKilogramScaleProblem, generateLiterContainerProblem],
  },
  balance: {
    title: 'Balance Scale Reasoning',
    generators: [generateObjectWeightProblem, generateCompareMassProblem, generateMissingBalanceWeightProblem, generateSameItemMassProblem],
  },
  word: {
    title: 'Mass & Liquid Volume Word Problems',
    generators: [generateWaterLeftProblem, generateRecipeScalingProblem, generateSugarBatchesProblem, generateCupsPerLiterProblem],
  },
};

const problemElement = document.getElementById('problem-text');
const optionsContainer = document.getElementById('options-container');
const feedbackElement = document.getElementById('feedback-message');
const prevButton = document.getElementById('prev-problem');
const nextButton = document.getElementById('next-problem');
const pageTitle = document.getElementById('page-title');
const problemType = document.getElementById('problem-type');

const params = new URLSearchParams(window.location.search);
const requestedType = params.get('type') ?? 'estimates';
const activeType = Object.prototype.hasOwnProperty.call(categoryConfig, requestedType) ? requestedType : 'estimates';
const activeConfig = categoryConfig[activeType];

let currentProblem = null;
const problemHistory = [];
let currentHistoryIndex = -1;

function formatUnit(value, singular, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function option(value, label) {
  return { value: String(value), label };
}

function createTextOptions(correctValue, correctLabel, distractors) {
  const options = new Map([[String(correctValue), option(correctValue, correctLabel)]]);

  for (const distractor of shuffleArray([...distractors])) {
    if (!options.has(String(distractor.value))) {
      options.set(String(distractor.value), option(distractor.value, distractor.label));
    }
    if (options.size === 4) {
      break;
    }
  }

  return shuffleArray([...options.values()]);
}

function formatMass(value, unit) {
  return formatUnit(value, unit, unit);
}

function renderDialScale({ value, unit, max, majorStep, minorStep, halfStep = majorStep / 2, maxLabel = `${max} ${unit}` }) {
  const centerX = 160;
  const centerY = 132;
  const radius = 106;
  const valueToAngle = (nextValue) => -90 + (nextValue / max) * 360;
  const polar = (angle, nextRadius) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: centerX + Math.cos(radians) * nextRadius,
      y: centerY + Math.sin(radians) * nextRadius,
    };
  };

  const isMultipleOf = (nextValue, step) => Math.abs(nextValue / step - Math.round(nextValue / step)) < 0.0001;

  const ticks = [];
  const tickCount = Math.round(max / minorStep);
  for (let tickIndex = 0; tickIndex < tickCount; tickIndex += 1) {
    const tickValue = Number((tickIndex * minorStep).toFixed(4));
    const angle = valueToAngle(tickValue);
    const isMajor = isMultipleOf(tickValue, majorStep);
    const isHalf = !isMajor && halfStep && isMultipleOf(tickValue, halfStep);
    const tickClass = isMajor ? 'mass-scale-tick-major' : isHalf ? 'mass-scale-tick-half' : 'mass-scale-tick';
    const outer = polar(angle, radius);
    const inner = polar(angle, isMajor ? radius - 20 : isHalf ? radius - 15 : radius - 8);
    ticks.push(`
      <line
        class="${tickClass}"
        x1="${outer.x.toFixed(1)}"
        y1="${outer.y.toFixed(1)}"
        x2="${inner.x.toFixed(1)}"
        y2="${inner.y.toFixed(1)}"
      ></line>
    `);

    if (isMajor) {
      if (tickValue === 0) {
        ticks.push(`
          <text class="mass-scale-label mass-scale-top-zero" x="${centerX}" y="${centerY - 74}" text-anchor="middle" dominant-baseline="middle">0</text>
          <text class="mass-scale-label mass-scale-top-max" x="${centerX}" y="${centerY - 54}" text-anchor="middle" dominant-baseline="middle">${maxLabel}</text>
        `);
      } else {
        const labelPoint = polar(angle, radius - 39);
        ticks.push(`
          <text class="mass-scale-label" x="${labelPoint.x.toFixed(1)}" y="${labelPoint.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${tickValue}</text>
        `);
      }
    }
  }

  const needleEnd = polar(valueToAngle(value), radius - 48);

  return `
    <svg class="mass-scale-svg" viewBox="0 0 320 272" role="img" aria-label="Scale reading ${value} ${unit}">
      <rect class="mass-scale-base" x="96" y="214" width="128" height="36" rx="9"></rect>
      <rect class="mass-scale-neck" x="132" y="8" width="56" height="30" rx="5"></rect>
      <circle class="mass-scale-face" cx="${centerX}" cy="${centerY}" r="${radius}"></circle>
      ${ticks.join('')}
      <line class="mass-scale-needle" x1="${centerX}" y1="${centerY}" x2="${needleEnd.x.toFixed(1)}" y2="${needleEnd.y.toFixed(1)}"></line>
      <circle class="mass-scale-pin" cx="${centerX}" cy="${centerY}" r="8"></circle>
    </svg>
  `;
}

function renderContainerSvg({ fill, capacity }) {
  const width = 164;
  const height = 220;
  const glassX = 42;
  const glassY = 18;
  const glassWidth = 82;
  const glassHeight = 170;
  const waterHeight = (fill / capacity) * glassHeight;
  const waterY = glassY + glassHeight - waterHeight;
  const marks = [];

  for (let mark = 0; mark <= capacity; mark += 1) {
    const y = glassY + glassHeight - (mark / capacity) * glassHeight;
    marks.push(`
      <line class="container-mark" x1="${glassX + glassWidth}" y1="${y}" x2="${glassX + glassWidth + 17}" y2="${y}"></line>
      <text class="container-label" x="${glassX + glassWidth + 23}" y="${y}" dominant-baseline="middle">${mark} L</text>
    `);
  }

  return `
    <svg class="liter-container-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Container filled to ${fill} liters">
      <rect class="container-glass" x="${glassX}" y="${glassY}" width="${glassWidth}" height="${glassHeight}" rx="10"></rect>
      <rect class="container-water" x="${glassX + 5}" y="${waterY}" width="${glassWidth - 10}" height="${waterHeight}" rx="4"></rect>
      ${marks.join('')}
    </svg>
  `;
}

function renderWeightBlocks(weights) {
  return weights
    .map((weight) => `<span class="weight-block">${weight}</span>`)
    .join('');
}

function renderBalanceScale({ leftLabel, rightLabel, leftWeights = [], rightWeights = [], tilt = 'level' }) {
  return `
    <div class="balance-scale balance-${tilt}" aria-label="Balance scale">
      <div class="balance-beam">
        <div class="balance-pan balance-pan-left">
          ${leftLabel ? `<span class="balance-object">${leftLabel}</span>` : ''}
          ${renderWeightBlocks(leftWeights)}
        </div>
        <div class="balance-pan balance-pan-right">
          ${rightLabel ? `<span class="balance-object">${rightLabel}</span>` : ''}
          ${renderWeightBlocks(rightWeights)}
        </div>
      </div>
      <div class="balance-stand"></div>
      <div class="balance-base"></div>
    </div>
  `;
}

function promptWithVisual(question, visualHtml, caption = '') {
  return `
    <div class="visual-problem mass-problem">
      <p class="problem-question">${question}</p>
      <div class="diagram-panel mass-diagram-panel">${visualHtml}</div>
      ${caption ? `<p class="diagram-caption">${caption}</p>` : ''}
    </div>
  `;
}

function generateMassEstimateProblem() {
  const scenarios = [
    {
      question: 'Which object has a mass closest to 15 kilograms?',
      answer: 'bag-potatoes',
      label: 'a bag of potatoes',
      distractors: ['a cup', 'a laptop', 'a swimming pool'],
    },
    {
      question: 'Which object has a mass closest to 1 kilogram?',
      answer: 'storybook-stack',
      label: 'a small stack of books',
      distractors: ['a paper clip', 'a parked car', 'a full bathtub'],
    },
    {
      question: 'Which object has a mass closest to 80 grams?',
      answer: 'muffin',
      label: 'one muffin',
      distractors: ['a sofa', 'a bicycle', 'a sack of rice'],
    },
  ];
  const scenario = pickRandom(scenarios);

  return {
    promptHtml: `<p class="problem-question">${scenario.question}</p>`,
    options: createTextOptions(
      scenario.answer,
      scenario.label,
      scenario.distractors.map((label, index) => ({ value: `d${index}`, label }))
    ),
    correctValue: scenario.answer,
  };
}

function generateCapacityEstimateProblem() {
  const scenarios = [
    {
      question: 'Which object has a capacity of about 10 liters?',
      answer: 'pail',
      label: 'a pail',
      distractors: ['a storybook', 'a drinking bottle', 'a teaspoon'],
    },
    {
      question: 'Which object has a capacity of about 15 liters?',
      answer: 'washing-machine',
      label: 'a washing machine',
      distractors: ['a cup', 'a lunch box', 'a glue stick'],
    },
    {
      question: 'Which object has a capacity closest to 1 liter?',
      answer: 'water-bottle',
      label: 'a water bottle',
      distractors: ['a bathtub', 'a swimming pool', 'a bottle cap'],
    },
  ];
  const scenario = pickRandom(scenarios);

  return {
    promptHtml: `<p class="problem-question">${scenario.question}</p>`,
    options: createTextOptions(
      scenario.answer,
      scenario.label,
      scenario.distractors.map((label, index) => ({ value: `d${index}`, label }))
    ),
    correctValue: scenario.answer,
  };
}

function generateReasonableMeasureProblem() {
  const scenarios = [
    {
      object: 'a sack of potatoes',
      answer: '5 kg',
      distractors: ['5 g', '50 L', '500 mL'],
    },
    {
      object: 'a bowl of mushrooms',
      answer: '680 g',
      distractors: ['680 kg', '6 L', '68 L'],
    },
    {
      object: 'a bucket of water',
      answer: '10 L',
      distractors: ['10 g', '10 kg', '100 mL'],
    },
  ];
  const scenario = pickRandom(scenarios);

  return {
    promptHtml: `<p class="problem-question">Which is a reasonable measure for ${scenario.object}?</p>`,
    options: createTextOptions(
      scenario.answer,
      scenario.answer,
      scenario.distractors.map((label, index) => ({ value: `d${index}`, label }))
    ),
    correctValue: scenario.answer,
  };
}

function generateGramScaleProblem() {
  const scale = pickRandom([
    {
      max: 1000,
      majorStep: 200,
      halfStep: 100,
      minorStep: 20,
      minAnswer: 80,
      maxAnswer: 940,
      offsets: [-200, -100, -40, -20, 20, 40, 100, 200],
    },
    {
      max: 500,
      majorStep: 100,
      halfStep: 50,
      minorStep: 10,
      minAnswer: 40,
      maxAnswer: 470,
      offsets: [-100, -50, -20, -10, 10, 20, 50, 100],
    },
  ]);
  const answer = randomInt(Math.ceil(scale.minAnswer / scale.minorStep), Math.floor(scale.maxAnswer / scale.minorStep)) * scale.minorStep;

  return {
    promptHtml: promptWithVisual('What is the mass shown on the scale?', renderDialScale({
      value: answer,
      unit: 'g',
      max: scale.max,
      majorStep: scale.majorStep,
      halfStep: scale.halfStep,
      minorStep: scale.minorStep,
    })),
    options: createNumberOptions(answer, (value) => `${value} g`, {
      min: 0,
      max: scale.max,
      offsets: scale.offsets,
      fallbackStep: scale.minorStep,
    }),
    correctValue: String(answer),
  };
}

function generateKilogramScaleProblem() {
  const answer = randomInt(2, 9);

  return {
    promptHtml: promptWithVisual('What is the mass shown on the scale?', renderDialScale({
      value: answer,
      unit: 'kg',
      max: 10,
      majorStep: 2,
      halfStep: 1,
      minorStep: 0.2,
      maxLabel: '10 kg',
    })),
    options: createNumberOptions(answer, (value) => `${value} kg`, {
      min: 0,
      max: 10,
      offsets: [-2, -1, 1, 2, 3],
    }),
    correctValue: String(answer),
  };
}

function generateLiterContainerProblem() {
  const capacity = pickRandom([3, 4, 5]);
  const fill = randomInt(1, capacity);

  return {
    promptHtml: promptWithVisual('How much liquid is in the container?', renderContainerSvg({ fill, capacity })),
    options: createNumberOptions(fill, (value) => `${value} L`, {
      min: 0,
      max: capacity,
      offsets: [-2, -1, 1, 2],
    }),
    correctValue: String(fill),
  };
}

function generateObjectWeightProblem() {
  const object = pickRandom(['bag of apples', 'box', 'bag of rice', 'sack']);
  const answer = randomInt(3, 9);
  const weights = answer >= 6 ? [5, answer - 5].filter(Boolean) : [answer];

  return {
    promptHtml: promptWithVisual(
      `The ${object} balances the weights. What is the mass of the ${object}?`,
      renderBalanceScale({ leftLabel: object, rightWeights: weights.map((weight) => `${weight} kg`) })
    ),
    options: createNumberOptions(answer, (value) => `${value} kg`, {
      min: 1,
      max: 12,
      offsets: [-3, -2, -1, 1, 2, 3],
    }),
    correctValue: String(answer),
  };
}

function generateCompareMassProblem() {
  const left = randomInt(3, 7);
  const right = left + randomInt(1, 3);

  return {
    promptHtml: promptWithVisual(
      'Which statement is true?',
      renderBalanceScale({
        leftLabel: `Box A<br>${left} kg`,
        rightLabel: `Box B<br>${right} kg`,
        tilt: 'right',
      })
    ),
    options: createTextOptions('b-heavier', 'Box B is heavier than Box A.', [
      { value: 'a-heavier', label: 'Box A is heavier than Box B.' },
      { value: 'same', label: 'Box A and Box B have the same mass.' },
      { value: 'a-is-right', label: `Box A has a mass of ${right} kg.` },
    ]),
    correctValue: 'b-heavier',
  };
}

function generateMissingBalanceWeightProblem() {
  const objectMass = randomInt(5, 10);
  const knownWeight = randomInt(1, objectMass - 2);
  const missing = objectMass - knownWeight;

  return {
    promptHtml: promptWithVisual(
      `A box has a mass of ${objectMass} kg. What weight is needed to make the scale balance?`,
      renderBalanceScale({
        leftLabel: 'Box',
        rightWeights: [`${knownWeight} kg`, '?'],
        tilt: 'left',
      })
    ),
    options: createNumberOptions(missing, (value) => `${value} kg`, {
      min: 1,
      max: 10,
      offsets: [-3, -2, -1, 1, 2, 3],
    }),
    correctValue: String(missing),
  };
}

function generateSameItemMassProblem() {
  const count = randomInt(3, 5);
  const each = randomInt(2, 6);
  const total = count * each;

  return {
    promptHtml: promptWithVisual(
      `${count} bags of beans have the same mass. What is the mass of each bag?`,
      renderBalanceScale({
        leftLabel: `${count} bags`,
        rightWeights: [`${total} kg`],
      })
    ),
    options: createNumberOptions(each, (value) => `${value} kg`, {
      min: 1,
      max: 12,
      offsets: [-3, -2, -1, 1, 2, 3],
    }),
    correctValue: String(each),
  };
}

function generateWaterLeftProblem() {
  const containers = randomInt(5, 9);
  const litersEach = pickRandom([10, 12, 15, 20]);
  const drank = randomInt(4, 9) * 5;
  const answer = containers * litersEach - drank;

  return {
    promptHtml: `<p class="problem-question">There are ${containers} containers. Each container holds ${litersEach} liters of water. Campers drink ${drank} liters. How many liters of water are left?</p>`,
    options: createNumberOptions(answer, (value) => `${value} L`, {
      min: 0,
      max: containers * litersEach,
      offsets: [-40, -20, -10, 10, 20, 40],
      fallbackStep: 5,
    }),
    correctValue: String(answer),
  };
}

function generateRecipeScalingProblem() {
  const muffinsPerBatch = pickRandom([4, 6, 8]);
  const flourPerBatch = muffinsPerBatch * pickRandom([15, 20, 25]);
  const totalMuffins = muffinsPerBatch * randomInt(3, 7);
  const answer = (flourPerBatch / muffinsPerBatch) * totalMuffins;

  return {
    promptHtml: `<p class="problem-question">Peggy uses ${flourPerBatch} grams of flour to make ${muffinsPerBatch} muffins. She makes ${totalMuffins} muffins. How many grams of flour does Peggy use?</p>`,
    options: createNumberOptions(answer, (value) => `${value} g`, {
      min: 0,
      max: answer + 300,
      offsets: [-160, -80, -40, 40, 80, 160],
      fallbackStep: 20,
    }),
    correctValue: String(answer),
  };
}

function generateSugarBatchesProblem() {
  const gramsPerBatch = randomInt(45, 85);
  const batches = 2;
  const totalNeeded = gramsPerBatch * batches;
  const has = randomInt(Math.max(30, totalNeeded - 75), totalNeeded - 5);
  const answer = totalNeeded - has;

  return {
    promptHtml: `<p class="problem-question">A batch of cookies needs ${gramsPerBatch} grams of sugar. Jess has ${has} grams of sugar. How many more grams does she need to bake ${batches} batches?</p>`,
    options: createNumberOptions(answer, (value) => `${value} g`, {
      min: 1,
      max: answer + 120,
      offsets: [-40, -20, -10, 10, 20, 40],
      fallbackStep: 5,
    }),
    correctValue: String(answer),
  };
}

function generateCupsPerLiterProblem() {
  const cupsPerLiter = pickRandom([4, 5, 6]);
  const liters = randomInt(2, 5);
  const answer = cupsPerLiter * liters;

  return {
    promptHtml: `<p class="problem-question">1 liter of water can fill ${cupsPerLiter} cups. Dorothy drinks ${liters} liters of water a day. How many cups of water does she drink a day?</p>`,
    options: createNumberOptions(answer, (value) => formatUnit(value, 'cup'), {
      min: 1,
      max: answer + 16,
      offsets: [-6, -4, -2, 2, 4, 6],
    }),
    correctValue: String(answer),
  };
}

function setNavigationState() {
  prevButton.disabled = currentHistoryIndex <= 0;
  nextButton.disabled = false;
}

function displayProblem(problemData) {
  currentProblem = problemData;
  problemElement.innerHTML = currentProblem.promptHtml;
  optionsContainer.innerHTML = '';
  feedbackElement.textContent = '';

  for (const answerOption of currentProblem.options) {
    const button = document.createElement('button');
    button.className = 'option';
    button.textContent = answerOption.label;
    button.dataset.value = answerOption.value;
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

function generateProblem() {
  return pickRandom(activeConfig.generators)();
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
  allOptions.forEach((answerOption) => {
    answerOption.disabled = true;
  });

  if (selectedValue === currentProblem.correctValue) {
    feedbackElement.textContent = 'Correct!';
    animationSystem.handleCorrectAnswer(selectedButton, allOptions, () => {
      generateAndShowNewProblem();
    });
    return;
  }

  feedbackElement.textContent = 'Try again.';
  animationSystem.handleWrongAnswer(selectedButton);
  setTimeout(() => {
    allOptions.forEach((answerOption) => {
      answerOption.disabled = false;
    });
  }, 550);
}

document.addEventListener('DOMContentLoaded', () => {
  document.title = activeConfig.title;
  pageTitle.textContent = activeConfig.title;
  problemType.textContent = activeConfig.title;

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
