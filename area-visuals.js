function arrowDefs(prefix) {
  return `
    <defs>
      <marker id="${prefix}-arrow-end" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#35556a"></path>
      </marker>
    </defs>
  `;
}

export function getColumnShapeCells(columns) {
  const width = columns.length;
  const height = Math.max(...columns);
  const cells = [];

  columns.forEach((columnHeight, columnIndex) => {
    for (let level = 0; level < columnHeight; level += 1) {
      cells.push({
        x: columnIndex,
        y: height - level - 1,
      });
    }
  });

  return {
    cells,
    width,
    height,
  };
}

export function calculateColumnShapeArea(columns) {
  return columns.reduce((sum, value) => sum + value, 0);
}

export function calculateColumnShapePerimeter(columns) {
  const { cells } = getColumnShapeCells(columns);
  const occupied = new Set(cells.map((cell) => `${cell.x},${cell.y}`));
  let perimeter = 0;

  for (const cell of cells) {
    const neighbors = [
      [cell.x + 1, cell.y],
      [cell.x - 1, cell.y],
      [cell.x, cell.y + 1],
      [cell.x, cell.y - 1],
    ];

    neighbors.forEach(([x, y]) => {
      if (!occupied.has(`${x},${y}`)) {
        perimeter += 1;
      }
    });
  }

  return perimeter;
}

export function renderColumnShapeSvg({ columns }) {
  const { cells, width, height } = getColumnShapeCells(columns);
  const cellSize = 52;
  const padding = 16;
  const svgWidth = width * cellSize + padding * 2;
  const svgHeight = height * cellSize + padding * 2;

  const outlineRects = [];
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      outlineRects.push(`
        <rect
          class="grid-outline"
          x="${padding + column * cellSize}"
          y="${padding + row * cellSize}"
          width="${cellSize}"
          height="${cellSize}"
        ></rect>
      `);
    }
  }

  const filledRects = cells
    .map(
      (cell) => `
        <rect
          class="shape-cell"
          x="${padding + cell.x * cellSize}"
          y="${padding + cell.y * cellSize}"
          width="${cellSize}"
          height="${cellSize}"
        ></rect>
      `
    )
    .join('');

  return `
    <svg class="shape-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" aria-hidden="true" role="img">
      ${outlineRects.join('')}
      ${filledRects}
    </svg>
  `;
}

export function renderRectangleDiagram({ width, height, unitLabel }) {
  const scale = Math.max(26, Math.min(52, 420 / width, 240 / height));
  const x = 92;
  const y = 76;
  const rectWidth = width * scale;
  const rectHeight = height * scale;
  const svgWidth = x + rectWidth + 72;
  const svgHeight = y + rectHeight + 60;
  const defsPrefix = 'rect-dim';

  return `
    <svg class="shape-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" aria-hidden="true" role="img">
      ${arrowDefs(defsPrefix)}
      <rect class="rectangle-fill" x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}" rx="12"></rect>

      <line class="dimension-cap" x1="${x}" y1="${y}" x2="${x}" y2="${y - 20}"></line>
      <line class="dimension-cap" x1="${x + rectWidth}" y1="${y}" x2="${x + rectWidth}" y2="${y - 20}"></line>
      <line
        class="dimension-line"
        x1="${x}"
        y1="${y - 28}"
        x2="${x + rectWidth}"
        y2="${y - 28}"
        marker-start="url(#${defsPrefix}-arrow-end)"
        marker-end="url(#${defsPrefix}-arrow-end)"
      ></line>
      <text class="dimension-text" x="${x + rectWidth / 2}" y="${y - 38}" text-anchor="middle">${width} ${unitLabel}</text>

      <line class="dimension-cap" x1="${x}" y1="${y}" x2="${x - 20}" y2="${y}"></line>
      <line class="dimension-cap" x1="${x}" y1="${y + rectHeight}" x2="${x - 20}" y2="${y + rectHeight}"></line>
      <line
        class="dimension-line"
        x1="${x - 28}"
        y1="${y}"
        x2="${x - 28}"
        y2="${y + rectHeight}"
        marker-start="url(#${defsPrefix}-arrow-end)"
        marker-end="url(#${defsPrefix}-arrow-end)"
      ></line>
      <text
        class="dimension-text"
        x="${x - 40}"
        y="${y + rectHeight / 2}"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-90 ${x - 40} ${y + rectHeight / 2})"
      >${height} ${unitLabel}</text>
    </svg>
  `;
}

export function renderLShapeDiagram({ totalWidth, topHeight, legWidth, extraHeight, unitLabel }) {
  const scale = Math.max(26, Math.min(38, 420 / totalWidth, 250 / (topHeight + extraHeight)));
  const x = 92;
  const y = 70;
  const totalHeight = topHeight + extraHeight;
  const rightWidth = totalWidth - legWidth;
  const shapePath = [
    `M ${x} ${y}`,
    `L ${x + totalWidth * scale} ${y}`,
    `L ${x + totalWidth * scale} ${y + topHeight * scale}`,
    `L ${x + legWidth * scale} ${y + topHeight * scale}`,
    `L ${x + legWidth * scale} ${y + totalHeight * scale}`,
    `L ${x} ${y + totalHeight * scale}`,
    'Z',
  ].join(' ');
  const defsPrefix = 'composite-dim';
  const svgWidth = x + totalWidth * scale + 84;
  const svgHeight = y + totalHeight * scale + 84;

  return `
    <svg class="shape-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" aria-hidden="true" role="img">
      ${arrowDefs(defsPrefix)}
      <path class="composite-fill" d="${shapePath}"></path>

      <line class="dimension-cap" x1="${x}" y1="${y}" x2="${x}" y2="${y - 20}"></line>
      <line class="dimension-cap" x1="${x + totalWidth * scale}" y1="${y}" x2="${x + totalWidth * scale}" y2="${y - 20}"></line>
      <line
        class="dimension-line"
        x1="${x}"
        y1="${y - 28}"
        x2="${x + totalWidth * scale}"
        y2="${y - 28}"
        marker-start="url(#${defsPrefix}-arrow-end)"
        marker-end="url(#${defsPrefix}-arrow-end)"
      ></line>
      <text class="dimension-text" x="${x + (totalWidth * scale) / 2}" y="${y - 38}" text-anchor="middle">${totalWidth} ${unitLabel}</text>

      <line class="dimension-cap" x1="${x}" y1="${y}" x2="${x - 20}" y2="${y}"></line>
      <line class="dimension-cap" x1="${x}" y1="${y + totalHeight * scale}" x2="${x - 20}" y2="${y + totalHeight * scale}"></line>
      <line
        class="dimension-line"
        x1="${x - 28}"
        y1="${y}"
        x2="${x - 28}"
        y2="${y + totalHeight * scale}"
        marker-start="url(#${defsPrefix}-arrow-end)"
        marker-end="url(#${defsPrefix}-arrow-end)"
      ></line>
      <text
        class="dimension-text"
        x="${x - 40}"
        y="${y + (totalHeight * scale) / 2}"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-90 ${x - 40} ${y + (totalHeight * scale) / 2})"
      >${totalHeight} ${unitLabel}</text>

      <line class="dimension-cap" x1="${x + legWidth * scale}" y1="${y + topHeight * scale}" x2="${x + legWidth * scale}" y2="${y + totalHeight * scale + 18}"></line>
      <line class="dimension-cap" x1="${x + totalWidth * scale}" y1="${y + topHeight * scale}" x2="${x + totalWidth * scale}" y2="${y + totalHeight * scale + 18}"></line>
      <line
        class="dimension-line"
        x1="${x + legWidth * scale}"
        y1="${y + totalHeight * scale + 26}"
        x2="${x + totalWidth * scale}"
        y2="${y + totalHeight * scale + 26}"
        marker-start="url(#${defsPrefix}-arrow-end)"
        marker-end="url(#${defsPrefix}-arrow-end)"
      ></line>
      <text
        class="dimension-text"
        x="${x + legWidth * scale + (rightWidth * scale) / 2}"
        y="${y + totalHeight * scale + 44}"
        text-anchor="middle"
      >${rightWidth} ${unitLabel}</text>

      <line class="dimension-cap" x1="${x + legWidth * scale}" y1="${y + topHeight * scale}" x2="${x + legWidth * scale + 18}" y2="${y + topHeight * scale}"></line>
      <line class="dimension-cap" x1="${x + legWidth * scale}" y1="${y + totalHeight * scale}" x2="${x + legWidth * scale + 18}" y2="${y + totalHeight * scale}"></line>
      <line
        class="dimension-line"
        x1="${x + legWidth * scale + 26}"
        y1="${y + topHeight * scale}"
        x2="${x + legWidth * scale + 26}"
        y2="${y + totalHeight * scale}"
        marker-start="url(#${defsPrefix}-arrow-end)"
        marker-end="url(#${defsPrefix}-arrow-end)"
      ></line>
      <text
        class="dimension-text"
        x="${x + legWidth * scale + 40}"
        y="${y + topHeight * scale + (extraHeight * scale) / 2}"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-90 ${x + legWidth * scale + 40} ${y + topHeight * scale + (extraHeight * scale) / 2})"
      >${extraHeight} ${unitLabel}</text>
    </svg>
  `;
}
