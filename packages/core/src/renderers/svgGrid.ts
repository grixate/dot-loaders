import { brailleToGrid, trimGrid } from "../grid";
import type { GridCell, GridShape, RenderModel, SvgGridRenderOutput, SvgGridRendererConfig } from "../types";

export function renderSvgGrid(model: RenderModel, config?: SvgGridRendererConfig): SvgGridRenderOutput {
  const grid = trimGrid(brailleToGrid(model.text));
  const cellSize = config?.cellSize ?? 14;
  const gap = config?.gap ?? 3;
  const rows = grid.length || 1;
  const cols = grid[0]?.length || 1;
  const width = cols * cellSize + Math.max(cols - 1, 0) * gap;
  const height = rows * cellSize + Math.max(rows - 1, 0) * gap;
  const cells: GridCell[] = [];

  grid.forEach((row, rowIndex) => {
    row.forEach((active, colIndex) => {
      cells.push({
        row: rowIndex,
        col: colIndex,
        active,
        opacity: active ? 1 : config?.inactiveOpacity ?? 0.12
      });
    });
  });

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
