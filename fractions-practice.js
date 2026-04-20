import { animationSystem } from './animations.js';
import { pickRandom, setupScratchpad, shuffleArray } from './shared.js';

const categoryConfig = {
  models: {
    title: 'Fraction Models & Groups',
    generators: [generateModelChoiceProblem, generateObjectFractionProblem],
  },
  whole: {
    title: 'Make One Whole & Greater Than One',
    generators: [generateMakeOneWholeProblem, generateMissingAddendProblem, generateGreaterThanOneProblem],
  },
  compare: {
    title: 'Compare & Equivalent Fractions',
    generators: [generateSameNumeratorCompareProblem, generateEquivalentHalfProblem, generateEqualPartsStoryProblem],
  },
  order: {
    title: 'Order Fractions',
    generators: [generateUnitFractionOrderProblem, generateMixedFractionOrderProblem],
  },
  numberlines: {
    title: 'Fractions on Number Lines',
    generators: [generateNumberLineProblem],
  },
  word: {
    title: 'Fraction Word Problems',
    generators: [generateMoneyWordProblem, generateSetWordProblem],
  },
};

const problemElement = document.getElementById('problem-text');
const workspaceElement = document.getElementById('fraction-workspace');
const optionsContainer = document.getElementById('options-container');
const feedbackElement = document.getElementById('feedback-message');
const prevButton = document.getElementById('prev-problem');
const nextButton = document.getElementById('next-problem');
const pageTitle = document.getElementById('page-title');
const problemType = document.getElementById('problem-type');

let currentProblem = null;
const problemHistory = [];
let currentHistoryIndex = -1;
let orderSelection = [];
let placedNumberLineTargets = [];
let activeNumberLineTargetIndex = 0;
let draggedOrderItem = null;
let suppressNextOrderClick = false;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);

  while (right) {
    [left, right] = [right, left % right];
  }

  return left || 1;
}

function simplifyFraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return { n: numerator / divisor, d: denominator / divisor };
}

function fractionKey(fraction) {
  const simplified = simplifyFraction(fraction.n, fraction.d);
  return `${simplified.n}/${simplified.d}`;
}

function rawFractionKey(fraction) {
  return `${fraction.n}/${fraction.d}`;
}

function compareFractions(left, right) {
  return left.n * right.d - right.n * left.d;
}

function fractionText(fraction) {
  return fraction.d === 1 ? `${fraction.n}` : `${fraction.n}/${fraction.d}`;
}

function fractionHtml(fraction, options = {}) {
  if (fraction.d === 1) {
    return `<span class="whole-number">${fraction.n}</span>`;
  }

  const className = options.small ? 'fraction fraction-small' : 'fraction';
  return `
    <span class="${className}" aria-label="${fractionText(fraction)}">
      <span class="fraction-top">${fraction.n}</span>
      <span class="fraction-bottom">${fraction.d}</span>
    </span>
  `;
}

function optionLabelHtml(label, detail = '') {
  return `
    <span class="fraction-option-label">${label}</span>
    ${detail ? `<span class="fraction-option-detail">${detail}</span>` : ''}
  `;
}

function renderPieSvg(parts, shaded, options = {}) {
  const center = 60;
  const radius = 48;
  const startAngle = -90;
  const segments = [];

  for (let index = 0; index < parts; index += 1) {
    const angleOne = ((startAngle + (index * 360) / parts) * Math.PI) / 180;
    const angleTwo = ((startAngle + ((index + 1) * 360) / parts) * Math.PI) / 180;
    const x1 = center + radius * Math.cos(angleOne);
    const y1 = center + radius * Math.sin(angleOne);
    const x2 = center + radius * Math.cos(angleTwo);
    const y2 = center + radius * Math.sin(angleTwo);
    const largeArc = 360 / parts > 180 ? 1 : 0;

    segments.push(`
      <path
        d="M ${center} ${center} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z"
        class="${index < shaded ? 'pie-slice-shaded' : 'pie-slice-empty'}"
      />
    `);
  }

  return `
    <svg class="fraction-pie ${options.compact ? 'fraction-pie-compact' : ''}" viewBox="0 0 120 120" role="img" aria-label="${shaded} out of ${parts} parts shaded">
      ${segments.join('')}
      <circle cx="60" cy="60" r="${radius}" class="pie-outline" />
    </svg>
  `;
}

function renderTapeSvg(total, shaded) {
  const cellWidth = 42;
  const height = 52;
  const width = total * cellWidth;
  const cells = [];

  for (let index = 0; index < total; index += 1) {
    cells.push(`
      <rect
        x="${index * cellWidth}"
        y="0"
        width="${cellWidth}"
        height="${height}"
        class="${index < shaded ? 'tape-cell-shaded' : 'tape-cell-empty'}"
      />
    `);
  }

  return `
    <svg class="fraction-tape" viewBox="0 0 ${width} ${height}" role="img" aria-label="${shaded} of ${total} equal parts shaded">
      ${cells.join('')}
    </svg>
  `;
}

function renderCup(isEmpty) {
  return `
    <span class="cup ${isEmpty ? 'cup-empty' : 'cup-filled'}" aria-label="${isEmpty ? 'empty glass' : 'filled glass'}">
      <span class="cup-rim"></span>
      <span class="cup-water"></span>
    </span>
  `;
}

function renderObjectSet(total, emptyCount) {
  const filledCount = total - emptyCount;
  const fractionReduces = gcd(emptyCount, total) > 1;

  if (fractionReduces && filledCount > 0 && emptyCount > 0) {
    const filledStart = randomInt(0, total - filledCount);
    const cups = [];
    for (let index = 0; index < total; index += 1) {
      const isFilled = index >= filledStart && index < filledStart + filledCount;
      cups.push(renderCup(!isFilled));
    }
    return `<div class="object-set">${cups.join('')}</div>`;
  }

  const cups = [];
  for (let index = 0; index < total; index += 1) {
    cups.push(renderCup(index < emptyCount));
  }

  return `<div class="object-set">${shuffleArray(cups).join('')}</div>`;
}

function createFractionOptions(correctFraction, candidates = []) {
  const correct = simplifyFraction(correctFraction.n, correctFraction.d);
  const options = new Map();
  options.set(fractionKey(correct), correct);

  for (const candidate of shuffleArray([...candidates])) {
    const simplified = simplifyFraction(candidate.n, candidate.d);
    const key = fractionKey(simplified);
    if (!options.has(key) && simplified.n >= 0 && simplified.d > 0) {
      options.set(key, simplified);
    }

    if (options.size === 4) {
      break;
    }
  }

  const nearbyDenominators = [2, 3, 4, 5, 6, 8, 10, 12];
  let attempts = 0;
  while (options.size < 4 && attempts < 120) {
    const denominator = pickRandom(nearbyDenominators);
    const numerator = randomInt(1, Math.max(denominator + 2, 3));
    const simplified = simplifyFraction(numerator, denominator);
    const key = fractionKey(simplified);
    if (!options.has(key)) {
      options.set(key, simplified);
    }
    attempts += 1;
  }

  return shuffleArray([...options.values()]).map((fraction) => ({
    value: fractionKey(fraction),
    labelHtml: fractionHtml(fraction),
    ariaLabel: fractionText(fraction),
  }));
}

function createTextChoiceOptions(correctValue, correctLabel, distractors) {
  const options = new Map([[correctValue, correctLabel]]);

  for (const distractor of shuffleArray([...distractors])) {
    if (!options.has(distractor.value)) {
      options.set(distractor.value, distractor.label);
    }

    if (options.size === 4) {
      break;
    }
  }

  return shuffleArray([...options.entries()]).map(([value, labelHtml]) => ({
    value,
    labelHtml,
    ariaLabel: labelHtml.replace(/<[^>]+>/g, ' '),
  }));
}

function createYesNoOptions() {
  return [
    { value: 'yes', labelHtml: 'Yes', ariaLabel: 'Yes' },
    { value: 'no', labelHtml: 'No', ariaLabel: 'No' },
  ];
}

function generateModelChoiceProblem() {
  const denominator = pickRandom([3, 4, 5, 6, 8]);
  const numerator = randomInt(1, Math.min(denominator - 1, 3));
  const correctValue = `${numerator}/${denominator}`;
  const modelChoices = [
    { parts: denominator, shaded: numerator },
    { parts: denominator, shaded: Math.min(denominator, numerator + 1) },
    { parts: Math.max(2, denominator - 1), shaded: numerator },
    { parts: denominator + 1, shaded: numerator },
  ];

  return {
    kind: 'choice',
    promptHtml: `Which model shows ${fractionHtml({ n: numerator, d: denominator })}?`,
    workspaceHtml: '',
    options: shuffleArray(modelChoices).map((choice, index) => ({
      value: choice.parts === denominator && choice.shaded === numerator ? correctValue : `wrong-${index}-${choice.shaded}/${choice.parts}`,
      labelHtml: renderPieSvg(choice.parts, choice.shaded, { compact: true }),
      ariaLabel: `${choice.shaded} out of ${choice.parts} parts shaded`,
    })),
    correctValue,
  };
}

function generateObjectFractionProblem() {
  const total = pickRandom([6, 7, 8, 9, 10]);
  const emptyCount = randomInt(1, total - 2);
  const correct = simplifyFraction(emptyCount, total);

  return {
    kind: 'choice',
    promptHtml: 'What fraction of the glasses are empty?',
    workspaceHtml: renderObjectSet(total, emptyCount),
    options: createFractionOptions(correct, [
      { n: total - emptyCount, d: total },
      { n: emptyCount + 1, d: total },
      { n: Math.max(1, emptyCount - 1), d: total },
      { n: total, d: total },
      { n: emptyCount, d: total - 1 },
    ]),
    correctValue: fractionKey(correct),
  };
}

function generateMakeOneWholeProblem() {
  const denominator = pickRandom([5, 6, 8, 10, 12]);
  const known = randomInt(1, denominator - 2);
  const missing = denominator - known;
  const correct = { n: missing, d: denominator };

  return {
    kind: 'choice',
    promptHtml: `${fractionHtml({ n: known, d: denominator })} and ____ make one whole. Which fraction is missing?`,
    workspaceHtml: `
      <div class="diagram-panel fraction-diagram-panel">
        ${renderTapeSvg(denominator, known)}
      </div>
    `,
    options: createFractionOptions(correct, [
      { n: known, d: denominator },
      { n: missing - 1, d: denominator },
      { n: missing + 1, d: denominator },
      { n: denominator, d: denominator },
      { n: missing, d: denominator - 1 },
    ]),
    correctValue: fractionKey(correct),
  };
}

function generateMissingAddendProblem() {
  const denominator = pickRandom([4, 5, 6, 8, 10]);
  const known = randomInt(1, denominator - 1);
  const correct = { n: denominator - known, d: denominator };

  return {
    kind: 'choice',
    promptHtml: `${fractionHtml({ n: known, d: denominator })} + ____ = 1. What is the missing fraction?`,
    workspaceHtml: '',
    options: createFractionOptions(correct, [
      { n: known, d: denominator },
      { n: denominator - known + 1, d: denominator },
      { n: denominator - known - 1, d: denominator },
      { n: denominator + known, d: denominator },
      { n: denominator - known, d: denominator + 1 },
    ]),
    correctValue: fractionKey(correct),
  };
}

function generateGreaterThanOneProblem() {
  const denominator = pickRandom([3, 4, 5, 6, 8, 10]);
  const correct = { n: denominator + randomInt(1, 3), d: denominator };
  const distractors = [
    { n: denominator - 1, d: denominator },
    { n: denominator, d: denominator },
    { n: Math.max(1, denominator - 2), d: denominator },
    { n: denominator + 1, d: denominator + 2 },
    { n: 1, d: denominator },
  ];

  return {
    kind: 'choice',
    promptHtml: 'Which fraction is greater than 1?',
    workspaceHtml: '',
    options: createFractionOptions(correct, distractors),
    correctValue: fractionKey(correct),
  };
}

function generateSameNumeratorCompareProblem() {
  const numerator = pickRandom([1, 2, 3, 4]);
  const smallerDenominator = randomInt(numerator + 2, numerator + 5);
  const largerDenominator = smallerDenominator + randomInt(2, 4);
  const largerFraction = { n: numerator, d: smallerDenominator };
  const smallerFraction = { n: numerator, d: largerDenominator };
  const studentName = pickRandom(['Melinda', 'Ava', 'Noah', 'Sofia']);
  const statementSaysSmallerIsGreater = Math.random() < 0.5;
  const claimedGreater = statementSaysSmallerIsGreater ? smallerFraction : largerFraction;
  const claimedLesser = statementSaysSmallerIsGreater ? largerFraction : smallerFraction;
  const correctValue = statementSaysSmallerIsGreater ? 'no' : 'yes';
  const reasonText = statementSaysSmallerIsGreater
    ? `${claimedGreater.d} is the larger denominator`
    : `${claimedGreater.d} is the smaller denominator`;

  return {
    kind: 'choice',
    promptHtml: `
      ${studentName} says ${fractionHtml(claimedGreater)} is greater than ${fractionHtml(claimedLesser)}
      because ${reasonText}. Do you agree?
    `,
    workspaceHtml: '',
    options: createYesNoOptions(),
    correctValue,
  };
}

function generateEquivalentHalfProblem() {
  const denominator = pickRandom([4, 6, 8, 10, 12]);
  const half = { n: denominator / 2, d: denominator };
  const choicesByValue = new Map();
  const candidateChoices = [
    half,
    { n: Math.max(1, denominator / 2 - 1), d: denominator },
    { n: denominator / 2 + 1, d: denominator },
    { n: 1, d: denominator },
    { n: 2, d: denominator + 2 },
    { n: denominator - 1, d: denominator },
  ];

  for (const choice of candidateChoices) {
    choicesByValue.set(fractionKey(choice), choice);
  }

  const distractors = shuffleArray([...choicesByValue.values()].filter((choice) => fractionKey(choice) !== '1/2')).slice(0, 3);
  const choices = shuffleArray([half, ...distractors]);

  return {
    kind: 'choice',
    promptHtml: `Which fraction is equal to ${fractionHtml({ n: 1, d: 2 })}?`,
    workspaceHtml: `<p class="fraction-hint">Think about the point halfway between 0 and 1.</p>`,
    options: choices.map((fraction) => {
      const simplified = simplifyFraction(fraction.n, fraction.d);
      return {
        value: fractionKey(simplified),
        labelHtml: fractionHtml(fraction),
        ariaLabel: fractionText(fraction),
      };
    }),
    correctValue: '1/2',
  };
}

function generateEqualPartsStoryProblem() {
  const fraction = pickRandom([
    { n: 1, d: 2 },
    { n: 1, d: 4 },
  ]);
  const totalOptions = fraction.d === 4 ? [8, 12, 16] : [8, 10, 12, 14, 16];
  const totalOne = pickRandom(totalOptions);
  const totalTwo = totalOne + (fraction.d === 4 ? pickRandom([4, 8]) : pickRandom([2, 4, 6]));
  const amountOne = (totalOne * fraction.n) / fraction.d;
  const amountTwo = (totalTwo * fraction.n) / fraction.d;
  const sameAmount = amountOne === amountTwo;

  return {
    kind: 'choice',
    promptHtml: `
      Joyce has ${totalOne} marbles and Leon has ${totalTwo} marbles.
      Is ${fractionHtml(fraction)} of Joyce's marbles equal to ${fractionHtml(fraction)} of Leon's marbles?
    `,
    workspaceHtml: '',
    options: createYesNoOptions(),
    correctValue: sameAmount ? 'yes' : 'no',
  };
}

function sortedFractions(fractions, direction) {
  return [...fractions].sort((left, right) => {
    const comparison = compareFractions(left, right);
    return direction === 'least' ? comparison : -comparison;
  });
}

function generateUnitFractionOrderProblem() {
  const fractions = shuffleArray([
    { n: 1, d: 5 },
    { n: 1, d: 9 },
    { n: 1, d: 6 },
    { n: 1, d: 1 },
  ]);

  return {
    kind: 'order',
    direction: 'least',
    fractions,
    correctOrder: sortedFractions(fractions, 'least').map(rawFractionKey),
    promptHtml: `Order ${fractions.map((fraction) => fractionHtml(fraction)).join(', ')} from least to greatest.`,
  };
}

function generateMixedFractionOrderProblem() {
  const baseSets = [
    [
      { n: 1, d: 12 },
      { n: 3, d: 8 },
      { n: 1, d: 8 },
      { n: 9, d: 8 },
    ],
    [
      { n: 2, d: 3 },
      { n: 3, d: 6 },
      { n: 5, d: 6 },
      { n: 1, d: 6 },
    ],
    [
      { n: 1, d: 4 },
      { n: 3, d: 8 },
      { n: 7, d: 8 },
      { n: 1, d: 2 },
    ],
  ];
  const direction = Math.random() < 0.5 ? 'greatest' : 'least';
  const fractions = shuffleArray([...pickRandom(baseSets)]);

  return {
    kind: 'order',
    direction,
    fractions,
    correctOrder: sortedFractions(fractions, direction).map(rawFractionKey),
    promptHtml: `Order ${fractions.map((fraction) => fractionHtml(fraction)).join(', ')} from ${direction} to ${direction === 'least' ? 'greatest' : 'least'}.`,
  };
}

function generateNumberLineProblem() {
  const denominator = pickRandom([8, 10, 12]);
  const possibleTargets = {
    8: [
      { n: 1, d: 2 },
      { n: 1, d: 8 },
      { n: 1, d: 4 },
      { n: 3, d: 8 },
      { n: 7, d: 8 },
    ],
    10: [
      { n: 3, d: 10 },
      { n: 3, d: 5 },
      { n: 5, d: 10 },
      { n: 1, d: 5 },
    ],
    12: [
      { n: 1, d: 3 },
      { n: 1, d: 4 },
      { n: 1, d: 2 },
      { n: 5, d: 6 },
    ],
  };
  const targets = shuffleArray(possibleTargets[denominator]).slice(0, randomInt(3, 5)).map((fraction) => ({
    ...fraction,
    tick: (fraction.n * denominator) / fraction.d,
  }));

  return {
    kind: 'numberLine',
    denominator,
    targets,
    promptHtml: `Write ${targets.map((fraction) => fractionHtml(fraction)).join(', ')} on the number line.`,
  };
}

function generateMoneyWordProblem() {
  const names = ['Danny', 'Maya', 'Leo', 'Ari'];
  const name = pickRandom(names);
  const total = pickRandom([10, 12, 15, 20]);
  const items = [
    { name: 'doll', cost: Math.max(2, Math.floor(total / 5)) },
    { name: 'toy airplane', cost: Math.max(2, Math.floor(total / 5)) },
    { name: 'toy car', cost: Math.max(3, Math.floor(total / 3)) },
  ];
  const spent = items.reduce((sum, item) => sum + item.cost, 0);
  const remaining = total - spent;
  const askRemaining = Math.random() < 0.5 && remaining > 0;
  const targetItem = pickRandom(items);
  const correct = askRemaining ? simplifyFraction(remaining, total) : simplifyFraction(targetItem.cost, total);

  return {
    kind: 'choice',
    promptHtml: askRemaining
      ? `${name} had $${total}. ${name} bought a ${items.map((item) => `${item.name} for $${item.cost}`).join(', and a ')}. What fraction of the money was not spent?`
      : `${name} had $${total}. ${name} bought a ${items.map((item) => `${item.name} for $${item.cost}`).join(', and a ')}. What fraction of the money was spent on the ${targetItem.name}?`,
    workspaceHtml: `
      <div class="price-row">
        ${items.map((item) => `<span class="price-card"><span>${item.name}</span><strong>$${item.cost}</strong></span>`).join('')}
      </div>
    `,
    options: createFractionOptions(correct, [
      { n: askRemaining ? spent : spent, d: total },
      { n: askRemaining ? remaining + 1 : targetItem.cost + 1, d: total },
      { n: askRemaining ? remaining : targetItem.cost, d: spent || total },
      { n: total - targetItem.cost, d: total },
    ]),
    correctValue: fractionKey(correct),
  };
}

function generateSetWordProblem() {
  const names = ['Lina', 'Noah', 'Emma', 'Kai'];
  const objects = ['stickers', 'marbles', 'cards', 'shells'];
  const name = pickRandom(names);
  const object = pickRandom(objects);
  const total = pickRandom([8, 9, 10, 12, 15]);
  const specialCount = randomInt(2, total - 2);
  const specialKind = pickRandom(['blue', 'striped', 'star', 'green']);
  const correct = simplifyFraction(specialCount, total);

  return {
    kind: 'choice',
    promptHtml: `${name} has ${total} ${object}. ${specialCount} of the ${object} are ${specialKind}. What fraction of the ${object} are ${specialKind}?`,
    workspaceHtml: '',
    options: createFractionOptions(correct, [
      { n: total - specialCount, d: total },
      { n: specialCount + 1, d: total },
      { n: specialCount, d: total - 1 },
      { n: total, d: specialCount },
    ]),
    correctValue: fractionKey(correct),
  };
}

function getCategory() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') || 'models';
  return categoryConfig[type] ? type : 'models';
}

function generateProblem(categoryKey) {
  return pickRandom(categoryConfig[categoryKey].generators)();
}

function clearInteractionState() {
  feedbackElement.textContent = '';
  workspaceElement.innerHTML = '';
  optionsContainer.innerHTML = '';
  optionsContainer.className = 'options';
  orderSelection = [];
  placedNumberLineTargets = [];
  activeNumberLineTargetIndex = 0;
  draggedOrderItem = null;
  suppressNextOrderClick = false;
}

function displayChoiceProblem(problem) {
  problemElement.innerHTML = problem.promptHtml;
  workspaceElement.innerHTML = problem.workspaceHtml || '';
  optionsContainer.innerHTML = '';
  optionsContainer.className = 'options fraction-options';

  for (const option of problem.options) {
    const button = document.createElement('button');
    button.className = 'option fraction-choice-option';
    button.dataset.value = option.value;
    button.innerHTML = option.labelHtml;
    button.setAttribute('aria-label', option.ariaLabel);
    optionsContainer.appendChild(button);
  }
}

function displayOrderProblem(problem) {
  problemElement.innerHTML = problem.promptHtml;
  optionsContainer.className = 'fraction-actions';
  optionsContainer.innerHTML = `
    <button class="nav-button fraction-check-button" id="check-order">Check Order</button>
    <button class="nav-button fraction-clear-button" id="clear-order">Clear</button>
  `;

  workspaceElement.innerHTML = `
    <div class="fraction-order-area">
      <p class="fraction-hint">Click or drag the cards to fill the boxes in order. Drag filled boxes to swap them.</p>
      <div class="order-slots">
        ${problem.fractions
          .map((_, index) => `<button class="order-slot" data-slot="${index}" draggable="false" aria-label="Order position ${index + 1}">?</button>`)
          .join('')}
      </div>
      <div class="fraction-card-bank">
        ${problem.fractions
          .map(
            (fraction) => `
              <button class="fraction-card" data-key="${rawFractionKey(fraction)}" draggable="true">
                ${fractionHtml(fraction)}
              </button>
            `
          )
          .join('')}
      </div>
    </div>
  `;
  orderSelection = Array(problem.fractions.length).fill(null);
}

function displayNumberLineProblem(problem) {
  problemElement.innerHTML = problem.promptHtml;
  optionsContainer.className = 'fraction-actions';
  optionsContainer.innerHTML = `<button class="nav-button fraction-clear-button" id="restart-number-line">Restart Line</button>`;
  workspaceElement.innerHTML = `
    <div class="number-line-area">
      <p class="fraction-hint">Click the tick mark for <span id="active-number-line-target">${fractionHtml(problem.targets[0])}</span>.</p>
      <div class="number-line-track" style="--tick-count: ${problem.denominator};">
        <span class="number-line-axis"></span>
        ${Array.from({ length: problem.denominator + 1 }, (_, tick) => {
          const left = (tick / problem.denominator) * 100;
          const label = tick === 0 ? '0' : tick === problem.denominator ? '1' : '';
          return `
            <button class="number-line-tick" data-tick="${tick}" style="left: ${left}%;" aria-label="Tick ${tick} of ${problem.denominator}">
              <span class="tick-mark"></span>
              ${label ? `<span class="tick-label">${label}</span>` : ''}
            </button>
          `;
        }).join('')}
        <div class="number-line-markers" id="number-line-markers"></div>
      </div>
      <p class="diagram-caption">The number line is divided into ${problem.denominator} equal parts.</p>
    </div>
  `;
  placedNumberLineTargets = [];
  activeNumberLineTargetIndex = 0;
}

function displayProblem(problem) {
  currentProblem = problem;
  clearInteractionState();

  if (problem.kind === 'choice') {
    displayChoiceProblem(problem);
  } else if (problem.kind === 'order') {
    displayOrderProblem(problem);
  } else if (problem.kind === 'numberLine') {
    displayNumberLineProblem(problem);
  }

  prevButton.disabled = currentHistoryIndex <= 0;
  nextButton.disabled = false;
}

function loadProblemFromHistory(index) {
  if (index < 0 || index >= problemHistory.length) {
    return;
  }

  currentHistoryIndex = index;
  displayProblem(problemHistory[currentHistoryIndex]);
}

function generateAndShowNewProblem(categoryKey) {
  const nextProblem = generateProblem(categoryKey);
  problemHistory.push(nextProblem);
  currentHistoryIndex = problemHistory.length - 1;
  displayProblem(nextProblem);
}

function handleChoiceClick(selectedButton, categoryKey) {
  if (!currentProblem || selectedButton.disabled) {
    return;
  }

  const allOptions = optionsContainer.querySelectorAll('.option');

  if (selectedButton.dataset.value === currentProblem.correctValue) {
    animationSystem.handleCorrectAnswer(selectedButton, allOptions, () => {
      generateAndShowNewProblem(categoryKey);
    });
    return;
  }

  animationSystem.handleWrongAnswer(selectedButton);
}

function getOrderFractionByKey(key) {
  return currentProblem?.fractions?.find((fraction) => rawFractionKey(fraction) === key) ?? null;
}

function getOrderSlot(index) {
  return workspaceElement.querySelector(`.order-slot[data-slot="${index}"]`);
}

function setOrderSlot(index, key) {
  const slot = getOrderSlot(index);
  if (!slot) {
    return;
  }

  orderSelection[index] = key;
  slot.classList.remove('wrong', 'correct', 'drag-over');

  if (!key) {
    slot.textContent = '?';
    slot.classList.remove('filled');
    slot.draggable = false;
    delete slot.dataset.key;
    slot.setAttribute('aria-label', `Order position ${index + 1}`);
    return;
  }

  const fraction = getOrderFractionByKey(key);
  slot.innerHTML = fraction ? fractionHtml(fraction) : key;
  slot.classList.add('filled');
  slot.draggable = true;
  slot.dataset.key = key;
  slot.setAttribute('aria-label', `Order position ${index + 1}: ${fraction ? fractionText(fraction) : key}`);
}

function syncOrderCardBank() {
  const usedKeys = new Set(orderSelection.filter(Boolean));

  workspaceElement.querySelectorAll('.fraction-card').forEach((card) => {
    const isUsed = usedKeys.has(card.dataset.key);
    card.disabled = isUsed;
    card.draggable = !isUsed;
    card.classList.toggle('selected', isUsed);
    card.classList.remove('dragging', 'drag-over');
  });
}

function fillNextOrderSlot(card) {
  const openIndex = orderSelection.findIndex((item) => item === null);
  if (openIndex === -1) {
    return;
  }

  setOrderSlot(openIndex, card.dataset.key);
  syncOrderCardBank();
  feedbackElement.textContent = '';
}

function clearOrderSlot(slot) {
  const slotIndex = Number(slot.dataset.slot);
  const key = orderSelection[slotIndex];
  if (!key) {
    return;
  }

  setOrderSlot(slotIndex, null);
  syncOrderCardBank();
  feedbackElement.textContent = '';
}

function resetOrderProblem() {
  for (let index = 0; index < currentProblem.fractions.length; index += 1) {
    setOrderSlot(index, null);
  }
  syncOrderCardBank();
  feedbackElement.textContent = '';
}

function clearOrderDragStyles() {
  workspaceElement.querySelectorAll('.dragging, .drag-over').forEach((element) => {
    element.classList.remove('dragging', 'drag-over');
  });
}

function moveDraggedOrderItemToSlot(targetIndex) {
  if (!draggedOrderItem) {
    return;
  }

  const { key, sourceIndex, sourceType } = draggedOrderItem;
  const targetKey = orderSelection[targetIndex];

  if (sourceType === 'slot' && sourceIndex === targetIndex) {
    return;
  }

  if (sourceType === 'slot') {
    setOrderSlot(targetIndex, key);
    setOrderSlot(sourceIndex, targetKey ?? null);
  } else {
    setOrderSlot(targetIndex, key);
  }

  syncOrderCardBank();
  feedbackElement.textContent = '';
}

function moveDraggedOrderItemToBank() {
  if (!draggedOrderItem || draggedOrderItem.sourceType !== 'slot') {
    return;
  }

  setOrderSlot(draggedOrderItem.sourceIndex, null);
  syncOrderCardBank();
  feedbackElement.textContent = '';
}

function handleOrderDragStart(event) {
  const source = event.target instanceof Element ? event.target.closest('.fraction-card, .order-slot.filled') : null;

  if (!(source instanceof HTMLButtonElement) || source.disabled || !source.dataset.key) {
    return;
  }

  draggedOrderItem = {
    key: source.dataset.key,
    sourceType: source.classList.contains('order-slot') ? 'slot' : 'bank',
    sourceIndex: source.classList.contains('order-slot') ? Number(source.dataset.slot) : null,
  };
  source.classList.add('dragging');

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedOrderItem.key);
  }
}

function handleOrderDragOver(event) {
  if (!draggedOrderItem) {
    return;
  }

  const dropTarget = event.target instanceof Element ? event.target.closest('.order-slot, .fraction-card-bank') : null;
  if (!dropTarget) {
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  workspaceElement.querySelectorAll('.drag-over').forEach((element) => element.classList.remove('drag-over'));
  dropTarget.classList.add('drag-over');
}

function handleOrderDrop(event) {
  if (!draggedOrderItem) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  const targetSlot = target?.closest('.order-slot');
  const targetBank = target?.closest('.fraction-card-bank');

  if (targetSlot instanceof HTMLButtonElement) {
    event.preventDefault();
    moveDraggedOrderItemToSlot(Number(targetSlot.dataset.slot));
    suppressNextOrderClick = true;
  } else if (targetBank) {
    event.preventDefault();
    moveDraggedOrderItemToBank();
    suppressNextOrderClick = true;
  }

  draggedOrderItem = null;
  clearOrderDragStyles();
  window.setTimeout(() => {
    suppressNextOrderClick = false;
  }, 0);
}

function handleOrderDragEnd() {
  draggedOrderItem = null;
  clearOrderDragStyles();
}

function checkOrder(categoryKey) {
  const checkButton = document.getElementById('check-order');
  if (orderSelection.some((item) => item === null)) {
    feedbackElement.textContent = 'Fill every box before checking.';
    animationSystem.handleWrongAnswer(checkButton);
    return;
  }

  const isCorrect = orderSelection.every((key, index) => key === currentProblem.correctOrder[index]);
  const interactiveButtons = workspaceElement.querySelectorAll('button');

  if (isCorrect) {
    workspaceElement.querySelectorAll('.order-slot').forEach((slot) => slot.classList.add('correct'));
    animationSystem.handleCorrectAnswer(checkButton, interactiveButtons, () => {
      generateAndShowNewProblem(categoryKey);
    });
    return;
  }

  feedbackElement.textContent = 'Try moving the fractions into a different order.';
  workspaceElement.querySelectorAll('.order-slot').forEach((slot) => slot.classList.add('wrong'));
  animationSystem.handleWrongAnswer(checkButton);
  setTimeout(() => {
    workspaceElement.querySelectorAll('.order-slot').forEach((slot) => slot.classList.remove('wrong'));
  }, 600);
}

function renderNumberLineMarkers() {
  const markerContainer = document.getElementById('number-line-markers');
  if (!markerContainer) {
    return;
  }

  markerContainer.innerHTML = placedNumberLineTargets
    .map((target) => {
      const left = (target.tick / currentProblem.denominator) * 100;
      return `
        <span class="number-line-marker" style="left: ${left}%;">
          ${fractionHtml(target, { small: true })}
        </span>
      `;
    })
    .join('');
}

function updateActiveNumberLineTarget() {
  const targetElement = document.getElementById('active-number-line-target');
  if (!targetElement) {
    return;
  }

  if (activeNumberLineTargetIndex >= currentProblem.targets.length) {
    targetElement.textContent = 'all fractions';
    return;
  }

  targetElement.innerHTML = fractionHtml(currentProblem.targets[activeNumberLineTargetIndex]);
}

function handleNumberLineClick(tickButton, categoryKey) {
  if (!currentProblem || tickButton.disabled) {
    return;
  }

  const target = currentProblem.targets[activeNumberLineTargetIndex];
  const selectedTick = Number(tickButton.dataset.tick);

  if (selectedTick !== target.tick) {
    animationSystem.handleWrongAnswer(tickButton);
    return;
  }

  placedNumberLineTargets.push(target);
  renderNumberLineMarkers();
  tickButton.classList.add('correct');
  activeNumberLineTargetIndex += 1;

  if (activeNumberLineTargetIndex >= currentProblem.targets.length) {
    const allTicks = workspaceElement.querySelectorAll('.number-line-tick');
    animationSystem.handleCorrectAnswer(tickButton, allTicks, () => {
      generateAndShowNewProblem(categoryKey);
    });
    return;
  }

  updateActiveNumberLineTarget();
}

function restartNumberLine() {
  placedNumberLineTargets = [];
  activeNumberLineTargetIndex = 0;
  workspaceElement.querySelectorAll('.number-line-tick').forEach((tick) => {
    tick.disabled = false;
    tick.classList.remove('correct', 'wrong');
  });
  renderNumberLineMarkers();
  updateActiveNumberLineTarget();
}

document.addEventListener('DOMContentLoaded', () => {
  const categoryKey = getCategory();
  const category = categoryConfig[categoryKey];
  pageTitle.textContent = category.title;
  problemType.textContent = category.title;
  document.title = category.title;

  setupScratchpad();
  generateAndShowNewProblem(categoryKey);

  optionsContainer.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;

    if (target instanceof HTMLButtonElement && target.classList.contains('option')) {
      handleChoiceClick(target, categoryKey);
      return;
    }

    if (target instanceof HTMLButtonElement && target.id === 'check-order') {
      checkOrder(categoryKey);
      return;
    }

    if (target instanceof HTMLButtonElement && target.id === 'clear-order') {
      resetOrderProblem();
      return;
    }

    if (target instanceof HTMLButtonElement && target.id === 'restart-number-line') {
      restartNumberLine();
    }
  });

  workspaceElement.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (suppressNextOrderClick) {
      suppressNextOrderClick = false;
      return;
    }

    const card = target.closest('.fraction-card');
    if (card instanceof HTMLButtonElement && !card.disabled) {
      fillNextOrderSlot(card);
      return;
    }

    const slot = target.closest('.order-slot');
    if (slot instanceof HTMLButtonElement) {
      clearOrderSlot(slot);
      return;
    }

    const tick = target.closest('.number-line-tick');
    if (tick instanceof HTMLButtonElement) {
      handleNumberLineClick(tick, categoryKey);
    }
  });

  workspaceElement.addEventListener('dragstart', handleOrderDragStart);
  workspaceElement.addEventListener('dragover', handleOrderDragOver);
  workspaceElement.addEventListener('drop', handleOrderDrop);
  workspaceElement.addEventListener('dragend', handleOrderDragEnd);

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

    generateAndShowNewProblem(categoryKey);
  });
});
