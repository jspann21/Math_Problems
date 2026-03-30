import { pickRandom } from './shared.js';
import { createNumberOptions, randomInt, startMultipleChoicePage } from './generated-multiple-choice.js';
import { renderLShapeDiagram } from './area-visuals.js';

const units = [
  { singular: 'centimeter', plural: 'centimeters', short: 'cm' },
  { singular: 'meter', plural: 'meters', short: 'm' },
  { singular: 'foot', plural: 'feet', short: 'ft' },
];

function formatAreaLabel(value, unit) {
  return `${value} square ${value === 1 ? unit.singular : unit.plural}`;
}

function generateProblem() {
  const unit = pickRandom(units);
  const totalWidth = randomInt(8, 16);
  const topHeight = randomInt(3, 6);
  const legWidth = randomInt(2, Math.min(6, totalWidth - 3));
  const extraHeight = randomInt(1, 3);
  const answer = totalWidth * topHeight + legWidth * extraHeight;

  return {
    promptHtml: `
      <div class="visual-problem">
        <p class="problem-question">What is the area of the figure?</p>
        <div class="diagram-panel">
          ${renderLShapeDiagram({
            totalWidth,
            topHeight,
            legWidth,
            extraHeight,
            unitLabel: unit.short,
          })}
        </div>
        <p class="diagram-caption">Split the figure into rectangles or subtract the missing rectangle.</p>
      </div>
    `,
    options: createNumberOptions(answer, (value) => formatAreaLabel(value, unit), {
      min: 1,
      max: answer + 30,
      offsets: [-18, -12, -8, -4, 4, 8, 12, 18],
      fallbackStep: 2,
    }),
    correctValue: String(answer),
  };
}

startMultipleChoicePage({ generateProblem });
