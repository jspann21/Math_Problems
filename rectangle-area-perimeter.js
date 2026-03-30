import { pickRandom } from './shared.js';
import { createNumberOptions, randomInt, startMultipleChoicePage } from './generated-multiple-choice.js';
import { renderRectangleDiagram } from './area-visuals.js';

const units = [
  { singular: 'centimeter', plural: 'centimeters', short: 'cm' },
  { singular: 'meter', plural: 'meters', short: 'm' },
  { singular: 'foot', plural: 'feet', short: 'ft' },
];

function formatAreaLabel(value, unit) {
  return `${value} square ${value === 1 ? unit.singular : unit.plural}`;
}

function formatPerimeterLabel(value, unit) {
  return `${value} ${value === 1 ? unit.singular : unit.plural}`;
}

function generateProblem() {
  const unit = pickRandom(units);
  const width = randomInt(4, 12);
  const height = randomInt(2, 8);
  const askForArea = Math.random() < 0.55;
  const answer = askForArea ? width * height : 2 * (width + height);

  return {
    promptHtml: `
      <div class="visual-problem">
        <p class="problem-question">Find the ${askForArea ? 'area' : 'perimeter'} of the rectangle.</p>
        <div class="diagram-panel">
          ${renderRectangleDiagram({ width, height, unitLabel: unit.short })}
        </div>
        <p class="diagram-caption">${askForArea ? 'Area = length × width.' : 'Perimeter is the distance around the rectangle.'}</p>
      </div>
    `,
    options: createNumberOptions(
      answer,
      (value) => (askForArea ? formatAreaLabel(value, unit) : formatPerimeterLabel(value, unit)),
      {
        min: 1,
        max: answer + (askForArea ? 18 : 14),
        offsets: askForArea ? [-12, -8, -4, -2, 2, 4, 8, 12] : [-10, -6, -4, -2, 2, 4, 6, 10],
        fallbackStep: 2,
      }
    ),
    correctValue: String(answer),
  };
}

startMultipleChoicePage({ generateProblem });
