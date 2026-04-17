import { COLS, ROWS, SNAKES, LADDERS } from "./gameConstants";

export function getCellCenter(
  cellNumber: number,
  cellWidth: number,
  cellHeight: number,
) {
  const row = Math.ceil(cellNumber / COLS);
  const isEvenRow = row % 2 === 0;
  let col: number;
  if (isEvenRow) {
    col = COLS - ((cellNumber - 1) % COLS);
  } else {
    col = ((cellNumber - 1) % COLS) + 1;
  }
  const pixelX = (col - 0.5) * cellWidth;
  const pixelY = (ROWS - row + 0.5) * cellHeight;
  return { x: pixelX, y: pixelY };
}

export function drawSnakesAndLadders(
  canvas: HTMLCanvasElement,
  board: HTMLElement,
) {
  if (!board.offsetWidth) return;

  canvas.width = board.offsetWidth;
  canvas.height = board.offsetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cellWidth = board.offsetWidth / COLS;
  const cellHeight = board.offsetHeight / ROWS;

  // Draw Ladders
  Object.entries(LADDERS).forEach(([from, to]) => {
    const fromPos = getCellCenter(parseInt(from), cellWidth, cellHeight);
    const toPos = getCellCenter(to, cellWidth, cellHeight);
    const offsetX = cellWidth * 0.15;

    ctx.strokeStyle = "rgba(6, 214, 160, 0.5)";
    ctx.lineWidth = 3;
    ctx.setLineDash([]);

    // Left rail
    ctx.beginPath();
    ctx.moveTo(fromPos.x - offsetX, fromPos.y);
    ctx.lineTo(toPos.x - offsetX, toPos.y);
    ctx.stroke();

    // Right rail
    ctx.beginPath();
    ctx.moveTo(fromPos.x + offsetX, fromPos.y);
    ctx.lineTo(toPos.x + offsetX, toPos.y);
    ctx.stroke();

    // Rungs
    const steps = 4;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const rx = fromPos.x + (toPos.x - fromPos.x) * t;
      const ry = fromPos.y + (toPos.y - fromPos.y) * t;
      ctx.beginPath();
      ctx.moveTo(rx - offsetX, ry);
      ctx.lineTo(rx + offsetX, ry);
      ctx.stroke();
    }
  });

  // Draw Snakes
  Object.entries(SNAKES).forEach(([from, to], i) => {
    const fromPos = getCellCenter(parseInt(from), cellWidth, cellHeight);
    const toPos = getCellCenter(to, cellWidth, cellHeight);

    ctx.strokeStyle = "rgba(247, 37, 133, 0.5)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.setLineDash([]);

    // Use a deterministic offset per snake (not random) for stable renders
    const offsetSeed = ((i * 137) % 100) / 100 - 0.5;
    const midX = (fromPos.x + toPos.x) / 2 + offsetSeed * cellWidth * 1.5;
    const midY = (fromPos.y + toPos.y) / 2;

    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);
    ctx.quadraticCurveTo(midX, midY, toPos.x, toPos.y);
    ctx.stroke();

    // Snake head dot
    ctx.fillStyle = "rgba(247, 37, 133, 0.8)";
    ctx.beginPath();
    ctx.arc(fromPos.x, fromPos.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Snake tail dot
    ctx.fillStyle = "rgba(247, 37, 133, 0.5)";
    ctx.beginPath();
    ctx.arc(toPos.x, toPos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function getCellGridPosition(cellNumber: number): {
  row: number;
  col: number;
} {
  const rowFromBottom = Math.ceil(cellNumber / COLS);
  const isEvenRow = rowFromBottom % 2 === 0;
  let colFromLeft: number;
  if (isEvenRow) {
    colFromLeft = COLS - ((cellNumber - 1) % COLS);
  } else {
    colFromLeft = ((cellNumber - 1) % COLS) + 1;
  }
  // Convert to visual row (row 0 = top)
  const visualRow = ROWS - rowFromBottom;
  return { row: visualRow, col: colFromLeft - 1 };
}
