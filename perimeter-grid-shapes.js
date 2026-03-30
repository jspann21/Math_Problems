import { pickRandom } from './shared.js';
import { createNumberOptions, randomInt, startMultipleChoicePage } from './generated-multiple-choice.js';
import { calculateColumnShapePerimeter, renderColumnShapeSvg } from './area-visuals.js';

const units = [
  { singular: 'inch', plural: 'inches' },
  { singular: 'foot', plural: 'feet' },
  { singular: 'centimeter', plural: 'centimeters' },
];

function formatPerimeterLabel(value, unit) {
  return `${value} ${value === 1 ? unit.singular : unit.plural}`;
}

function generateColumns() {
  const width = randomInt(3, 5);
  const columns = Array.from({ length: width }, () => randomInt(1, 3));

  if (columns.every((height) => height === columns[0])) {
    columns[randomInt(0, width - 1)] = Math.max(1, columns[0] - 1);
  }

  return columns;
}

function generateProblem() {
  const unit = pickRandom(units);
  const columns = generateColumns();
  const answer = calculateColumnShapePerimeter(columns);

  return {
    promptHtml: `
      <div class="visual-problem">
        <p class="problem-question">What is the perimeter of the figure?</p>
        <div class="diagram-panel">
          ${renderColumnShapeSvg({ columns })}
        </div>
        <p class="diagram-caption">Each side of a small square is 1 ${unit.singular}.</p>
      </div>
    `,
    options: createNumberOptions(answer, (value) => formatPerimeterLabel(value, unit), {
      min: 4,
      max: answer + 10,
      offsets: [-8, -6, -4, -2, 2, 4, 6, 8],
      fallbackStep: 2,
    }),
    correctValue: String(answer),
  };
}

startMultipleChoicePage({ generateProblem });
