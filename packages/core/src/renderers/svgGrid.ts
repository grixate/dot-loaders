import { brailleToGrid } from "../grid";
import type { GridCell, GridShape, LoaderSnapshot, RenderModel, SvgGridRenderOutput, SvgGridRendererConfig } from "../types";

function unionBounds(grids: boolean[][][]): { minRow: number; maxRow: number; minCol: number; maxCol: number } | null {
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  for (const grid of grids) {
    for (let r = 0; r < grid.length; r += 1) {
      const row = grid[r];
      for (let c = 0; c < row.length; c += 1) {
        if (row[c]) {
          if (r < minRow) minRow = r;
          if (r > maxRow) maxRow = r;
          if (c < minCol) minCol = c;
          if (c > maxCol) maxCol = c;
        }
      }
    }
  }

  if (minRow === Infinity) return null;
  return { minRow, maxRow, minCol, maxCol };
}

export function renderSvgGrid(
  snapshot: LoaderSnapshot,
  model: RenderModel,
  config?: SvgGridRendererConfig
): SvgGridRenderOutput {
  const currentGrid = brailleToGrid(model.text);
  const allGrids = snapshot.frames.map((frame) => brailleToGrid(frame));
  const bounds = unionBounds(allGrids) ?? { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };
  const cellSize = config?.cellSize ?? 14;
  const gap = config?.gap ?? 3;
  const rows = bounds.maxRow - bounds.minRow + 1;
  const cols = bounds.maxCol - bounds.minCol + 1;
  const width = cols * cellSize + Math.max(cols - 1, 0) * gap;
  const height = rows * cellSize + Math.max(rows - 1, 0) * gap;
  const cells: GridCell[] = [];

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const active = currentGrid[bounds.minRow + r]?.[bounds.minCol + c] ?? false;
      cells.push({
        row: r,
        col: c,
        active,
        opacity: active ? 1 : config?.inactiveOpacity ?? 0.12
      });
    }
  }

  return {
    kind: "svg-grid",
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    shape: (config?.shape ?? "circle") as GridShape,
    gap,
    cellSize,
    inactiveOpacity: config?.inactiveOpacity ?? 0.12,
    cells,
    style: model.style,
    containerStyle: model.containerStyle,
    label: model.label
  };
}
