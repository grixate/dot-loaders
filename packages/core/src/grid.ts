const BRAILLE_DOT_MAP = [
  [1, 8],
  [2, 16],
  [4, 32],
  [64, 128]
] as const;

export function makeGrid(rows: number, cols: number): boolean[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
}

export function gridToBraille(grid: boolean[][]): string {
  if (grid.length === 0) return "";
  const rows = Math.max(grid.length, 4);
  const cols = grid[0]?.length ?? 0;
  const glyphCount = Math.ceil(cols / 2);
  let output = "";

  for (let glyph = 0; glyph < glyphCount; glyph += 1) {
    let bits = 0;

    for (let row = 0; row < 4; row += 1) {
      for (let dot = 0; dot < 2; dot += 1) {
        const col = glyph * 2 + dot;
        if (row < rows && grid[row]?.[col]) {
          bits |= BRAILLE_DOT_MAP[row][dot];
        }
      }
    }

    output += String.fromCodePoint(0x2800 + bits);
  }

  return output;
}

export function brailleToGrid(frame: string): boolean[][] {
  const cols = frame.length * 2;
  const grid = makeGrid(4, cols);

  for (let glyphIndex = 0; glyphIndex < frame.length; glyphIndex += 1) {
    const bits = (frame.codePointAt(glyphIndex) ?? 0x2800) - 0x2800;

    for (let row = 0; row < 4; row += 1) {
      for (let dot = 0; dot < 2; dot += 1) {
        if (bits & BRAILLE_DOT_MAP[row][dot]) {
          grid[row][glyphIndex * 2 + dot] = true;
        }
      }
    }
  }

  return grid;
}

export function trimGrid(grid: boolean[][]): boolean[][] {
  const activeRows = new Set<number>();
  const activeCols = new Set<number>();

  grid.forEach((row, rowIndex) => {
    row.forEach((active, colIndex) => {
      if (active) {
        activeRows.add(rowIndex);
        activeCols.add(colIndex);
      }
    });
  });

  if (activeRows.size === 0 || activeCols.size === 0) {
    return grid;
  }

  const minRow = Math.min(...activeRows);
  const maxRow = Math.max(...activeRows);
  const minCol = Math.min(...activeCols);
  const maxCol = Math.max(...activeCols);

  return Array.from({ length: maxRow - minRow + 1 }, (_, rowOffset) => {
    const sourceRow = grid[minRow + rowOffset] ?? [];
    return sourceRow.slice(minCol, maxCol + 1);
  });
}
