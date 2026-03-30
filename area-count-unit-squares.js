import { pickRandom } from './shared.js';
import { createNumberOptions, randomInt, startMultipleChoicePage } from './generated-multiple-choice.js';
import { calculateColumnShapeArea, renderColumnShapeSvg } from './area-visuals.js';

const units = [
  { singular: 'inch', plural: 'inches' },
  { singular: 'foot', plural: 'feet' },
  { singular: 'centimeter', plural: 'centimeters' },
];

function formatAreaLabel(value, unit) {
  return `${value} square ${value === 1 ? unit.singular : unit.plural}`;
}

function formatSingleSquare(unit) {
  return `1 square ${unit.singular}`;
}

function generateColumns() {
  const width = randomInt(3, 5);
  const columns = Array.from({ length: width }, () => randomInt(1, 3));

  if (columns.every((height) => height === columns[0])) {
    const index = randomInt(0, width - 1);
    columns[index] = Math.min(columns[index] + 1, 4);
  }

  return columns;
}

function generateProblem() {
  const unit = pickRandom(units);
  const columns = generateColumns();
  const answer = calculateColumnShapeArea(columns);

  return {
    promptHtml: `
      <div class="visual-problem">
        <p class="problem-question">What is the area of the figure?</p>
        <div class="diagram-panel">
          ${renderColumnShapeSvg({ columns })}
        </div>
        <p class="diagram-caption">Each small square covers ${formatSingleSquare(unit)}.</p>
      </div>
    `,
    options: createNumberOptions(answer, (value) => formatAreaLabel(value, unit), {
      min: 1,
      max: answer + 8,
      offsets: [-4, -3, -2, -1, 1, 2, 3, 4],
    }),
    correctValue: String(answer),
  };
}

startMultipleChoicePage({ generateProblem });
