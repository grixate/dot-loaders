import {
  defineLoader,
  registerLoaders,
  type FrameGeneratorContext,
  type LoaderDefinition
} from "@braille-loaders/core";

function brailleLoader(
  id: string,
  frames: readonly string[],
  intervalMs: number,
  meta: LoaderDefinition["meta"],
  aliases: readonly string[] = []
): LoaderDefinition {
  return defineLoader({
    id,
    kind: "braille",
    source: {
      type: "frames",
      frames
    },
    intervalMs,
    aliases,
    meta
  });
}

function textLoader(
  id: string,
  frames: readonly string[],
  intervalMs: number,
  meta: LoaderDefinition["meta"],
  aliases: readonly string[] = []
): LoaderDefinition {
  return defineLoader({
    id,
    kind: "text",
    source: {
      type: "frames",
      frames
    },
    intervalMs,
    aliases,
    meta
  });
}

const scanlineGenerator = defineLoader({
  id: "scanline-grid",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const frames: string[] = [];
      const width = 6;
      const height = 4;

      for (let row = 0; row < height; row += 1) {
        const grid = context.makeGrid(height, width);
        for (let y = 0; y <= row; y += 1) {
          for (let x = 0; x < width; x += 1) {
            grid[y][x] = true;
          }
        }
        frames.push(context.gridToBraille(grid));
      }

      for (let row = 0; row < height; row += 1) {
        const grid = context.makeGrid(height, width);
        for (let y = row + 1; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            grid[y][x] = true;
          }
        }
        frames.push(context.gridToBraille(grid));
      }

      return frames;
    }
  },
  intervalMs: 110,
  aliases: ["scanline"],
  meta: {
    category: "scan",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "scanline"
  }
});

const radarGenerator = defineLoader({
  id: "radar",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 4;
      const height = 4;
      const path: Array<[number, number]> = [];
      for (let x = 0; x < width; x += 1) path.push([x, 0]);
      for (let y = 1; y < height; y += 1) path.push([width - 1, y]);
      for (let x = width - 2; x >= 0; x -= 1) path.push([x, height - 1]);
      for (let y = height - 2; y >= 1; y -= 1) path.push([0, y]);

      return path.map(([x, y]) => {
        const grid = context.makeGrid(height, width);
        grid[y][x] = true;
        return context.gridToBraille(grid);
      });
    }
  },
  intervalMs: 85,
  meta: {
    category: "scan",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "radar"
  }
});

const radarWideGenerator = defineLoader({
  id: "radar-wide",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 8;
      const height = 4;
      const path: Array<[number, number]> = [];
      for (let x = 0; x < width; x += 1) path.push([x, 0]);
      for (let y = 1; y < height; y += 1) path.push([width - 1, y]);
      for (let x = width - 2; x >= 0; x -= 1) path.push([x, height - 1]);
      for (let y = height - 2; y >= 1; y -= 1) path.push([0, y]);

      return path.map(([x, y]) => {
        const grid = context.makeGrid(height, width);
        grid[y][x] = true;
        return context.gridToBraille(grid);
      });
    }
  },
  intervalMs: 65,
  aliases: ["radar2"],
  meta: {
    category: "scan",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "radar2"
  }
});

const scanGenerator = defineLoader({
  id: "scan",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 8;
      const height = 4;
      const frames: string[] = [];
      for (let pos = -1; pos < width + 1; pos += 1) {
        const grid = context.makeGrid(height, width);
        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            if (x === pos || x === pos - 1) grid[y][x] = true;
          }
        }
        frames.push(context.gridToBraille(grid));
      }
      return frames;
    }
  },
  intervalMs: 70,
  meta: {
    category: "scan",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "scan"
  }
});

const rainGenerator = defineLoader({
  id: "rain",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 8;
      const height = 4;
      const totalFrames = 12;
      const offsets = [0, 3, 1, 5, 2, 7, 4, 6];
      const frames: string[] = [];
      for (let f = 0; f < totalFrames; f += 1) {
        const grid = context.makeGrid(height, width);
        for (let c = 0; c < width; c += 1) {
          const row = (f + offsets[c]) % (height + 2);
          if (row < height) grid[row][c] = true;
        }
        frames.push(context.gridToBraille(grid));
      }
      return frames;
    }
  },
  intervalMs: 100,
  meta: {
    category: "scan",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "rain"
  }
});

const pulseGenerator = defineLoader({
  id: "pulse",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 6;
      const height = 4;
      const cx = width / 2 - 0.5;
      const cy = height / 2 - 0.5;
      const radii = [0.5, 1.2, 2, 3, 3.5];
      const frames: string[] = [];
      for (const r of radii) {
        const grid = context.makeGrid(height, width);
        for (let row = 0; row < height; row += 1) {
          for (let col = 0; col < width; col += 1) {
            const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
            if (Math.abs(dist - r) < 0.9) grid[row][col] = true;
          }
        }
        frames.push(context.gridToBraille(grid));
      }
      return frames;
    }
  },
  intervalMs: 180,
  meta: {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "pulse"
  }
});

const snakeGenerator = defineLoader({
  id: "snake",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 4;
      const height = 4;
      const path: Array<[number, number]> = [];
      for (let r = 0; r < height; r += 1) {
        if (r % 2 === 0) {
          for (let c = 0; c < width; c += 1) path.push([r, c]);
        } else {
          for (let c = width - 1; c >= 0; c -= 1) path.push([r, c]);
        }
      }
      const frames: string[] = [];
      for (let i = 0; i < path.length; i += 1) {
        const grid = context.makeGrid(height, width);
        for (let t = 0; t < 4; t += 1) {
          const idx = (i - t + path.length) % path.length;
          grid[path[idx][0]][path[idx][1]] = true;
        }
        frames.push(context.gridToBraille(grid));
      }
      return frames;
    }
  },
  intervalMs: 80,
  meta: {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "snake"
  }
});

const sparkleGenerator = defineLoader({
  id: "sparkle",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const patterns = [
        [1,0,0,1,0,0,1,0, 0,0,1,0,0,1,0,0, 0,1,0,0,1,0,0,1, 1,0,0,0,0,1,0,0],
        [0,1,0,0,1,0,0,1, 1,0,0,1,0,0,0,1, 0,0,0,1,0,1,0,0, 0,0,1,0,1,0,1,0],
        [0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0, 1,0,1,0,0,0,0,1, 0,1,0,1,0,0,0,1],
        [1,0,0,0,0,0,1,1, 0,0,1,0,1,0,0,0, 0,0,0,0,1,0,1,0, 1,0,0,1,0,0,1,0],
        [0,0,0,1,1,0,0,0, 0,1,0,0,0,1,0,1, 1,0,0,1,0,0,0,0, 0,1,0,0,0,1,0,1],
        [0,1,1,0,0,0,0,1, 0,0,0,1,0,0,1,0, 0,1,0,0,0,1,0,0, 0,0,1,0,1,0,0,0]
      ];
      const width = 8;
      const height = 4;
      return patterns.map((pat) => {
        const grid = context.makeGrid(height, width);
        for (let r = 0; r < height; r += 1) {
          for (let c = 0; c < width; c += 1) {
            grid[r][c] = pat[r * width + c] === 1;
          }
        }
        return context.gridToBraille(grid);
      });
    }
  },
  intervalMs: 150,
  meta: {
    category: "dots",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "sparkle"
  }
});

const cascadeGenerator = defineLoader({
  id: "cascade",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 8;
      const height = 4;
      const frames: string[] = [];
      for (let offset = -2; offset < width + height; offset += 1) {
        const grid = context.makeGrid(height, width);
        for (let r = 0; r < height; r += 1) {
          for (let c = 0; c < width; c += 1) {
            const diag = c + r;
            if (diag === offset || diag === offset - 1) grid[r][c] = true;
          }
        }
        frames.push(context.gridToBraille(grid));
      }
      return frames;
    }
  },
  intervalMs: 60,
  meta: {
    category: "scan",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "cascade"
  }
});

const columnsGenerator = defineLoader({
  id: "columns",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 6;
      const height = 4;
      const frames: string[] = [];
      for (let col = 0; col < width; col += 1) {
        for (let fillTo = height - 1; fillTo >= 0; fillTo -= 1) {
          const grid = context.makeGrid(height, width);
          for (let pc = 0; pc < col; pc += 1) {
            for (let r = 0; r < height; r += 1) grid[r][pc] = true;
          }
          for (let r = fillTo; r < height; r += 1) grid[r][col] = true;
          frames.push(context.gridToBraille(grid));
        }
      }
      const full = context.makeGrid(height, width);
      for (let r = 0; r < height; r += 1) for (let c = 0; c < width; c += 1) full[r][c] = true;
      frames.push(context.gridToBraille(full));
      frames.push(context.gridToBraille(context.makeGrid(height, width)));
      return frames;
    }
  },
  intervalMs: 60,
  meta: {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "columns"
  }
});

const orbitGenerator = defineLoader({
  id: "orbit",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 2;
      const height = 4;
      const path: Array<[number, number]> = [
        [0, 0], [0, 1],
        [1, 1], [2, 1], [3, 1],
        [3, 0],
        [2, 0], [1, 0]
      ];
      const frames: string[] = [];
      for (let i = 0; i < path.length; i += 1) {
        const grid = context.makeGrid(height, width);
        grid[path[i][0]][path[i][1]] = true;
        const tail = (i - 1 + path.length) % path.length;
        grid[path[tail][0]][path[tail][1]] = true;
        frames.push(context.gridToBraille(grid));
      }
      return frames;
    }
  },
  intervalMs: 100,
  meta: {
    category: "orbit",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "orbit"
  }
});

const breatheGenerator = defineLoader({
  id: "breathe",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const stages: Array<Array<[number, number]>> = [
        [],
        [[1, 0]],
        [[0, 1], [2, 0]],
        [[0, 0], [1, 1], [3, 0]],
        [[0, 0], [1, 1], [2, 0], [3, 1]],
        [[0, 0], [0, 1], [1, 1], [2, 0], [3, 1]],
        [[0, 0], [0, 1], [1, 0], [2, 1], [3, 0], [3, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [3, 0], [3, 1]],
        [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0], [3, 1]]
      ];
      const sequence = [...stages, ...stages.slice().reverse().slice(1)];
      return sequence.map((dots) => {
        const grid = context.makeGrid(4, 2);
        for (const [r, c] of dots) grid[r][c] = true;
        return context.gridToBraille(grid);
      });
    }
  },
  intervalMs: 100,
  meta: {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "breathe"
  }
});

const waveRowsGenerator = defineLoader({
  id: "wave-rows",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 8;
      const height = 4;
      const totalFrames = 16;
      const frames: string[] = [];
      for (let f = 0; f < totalFrames; f += 1) {
        const grid = context.makeGrid(height, width);
        for (let c = 0; c < width; c += 1) {
          const phase = f - c * 0.5;
          const row = Math.round(((Math.sin(phase * 0.8) + 1) / 2) * (height - 1));
          grid[row][c] = true;
          if (row > 0) grid[row - 1][c] = (f + c) % 3 === 0;
        }
        frames.push(context.gridToBraille(grid));
      }
      return frames;
    }
  },
  intervalMs: 90,
  aliases: ["waverows"],
  meta: {
    category: "braille",
    complexity: "high",
    recommendedRenderer: "svg-grid",
    sourceName: "waverows"
  }
});

const checkerboardGenerator = defineLoader({
  id: "checkerboard",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 6;
      const height = 4;
      const frames: string[] = [];
      for (let phase = 0; phase < 4; phase += 1) {
        const grid = context.makeGrid(height, width);
        for (let r = 0; r < height; r += 1) {
          for (let c = 0; c < width; c += 1) {
            grid[r][c] = phase < 2 ? (r + c + phase) % 2 === 0 : (r + c + phase) % 3 === 0;
          }
        }
        frames.push(context.gridToBraille(grid));
      }
      return frames;
    }
  },
  intervalMs: 250,
  meta: {
    category: "dots",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "checkerboard"
  }
});

const helixGenerator = defineLoader({
  id: "helix",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 8;
      const height = 4;
      const totalFrames = 16;
      const frames: string[] = [];
      for (let f = 0; f < totalFrames; f += 1) {
        const grid = context.makeGrid(height, width);
        for (let c = 0; c < width; c += 1) {
          const phase = (f + c) * (Math.PI / 4);
          const y1 = Math.round(((Math.sin(phase) + 1) / 2) * (height - 1));
          const y2 = Math.round(((Math.sin(phase + Math.PI) + 1) / 2) * (height - 1));
          grid[y1][c] = true;
          grid[y2][c] = true;
        }
        frames.push(context.gridToBraille(grid));
      }
      return frames;
    }
  },
  intervalMs: 80,
  meta: {
    category: "braille",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "helix"
  }
});

const fillSweepGenerator = defineLoader({
  id: "fill-sweep",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 4;
      const height = 4;
      const frames: string[] = [];
      for (let row = height - 1; row >= 0; row -= 1) {
        const grid = context.makeGrid(height, width);
        for (let r = row; r < height; r += 1) {
          for (let c = 0; c < width; c += 1) grid[r][c] = true;
        }
        frames.push(context.gridToBraille(grid));
      }
      const full = context.makeGrid(height, width);
      for (let r = 0; r < height; r += 1) for (let c = 0; c < width; c += 1) full[r][c] = true;
      frames.push(context.gridToBraille(full));
      frames.push(context.gridToBraille(full));
      for (let row = 0; row < height; row += 1) {
        const grid = context.makeGrid(height, width);
        for (let r = row + 1; r < height; r += 1) {
          for (let c = 0; c < width; c += 1) grid[r][c] = true;
        }
        frames.push(context.gridToBraille(grid));
      }
      frames.push(context.gridToBraille(context.makeGrid(height, width)));
      return frames;
    }
  },
  intervalMs: 100,
  aliases: ["fillsweep"],
  meta: {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "fillsweep"
  }
});

const diagSwipeGenerator = defineLoader({
  id: "diagonal-swipe",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const width = 4;
      const height = 4;
      const frames: string[] = [];
      const maxDiag = width + height - 2;
      for (let d = 0; d <= maxDiag; d += 1) {
        const grid = context.makeGrid(height, width);
        for (let r = 0; r < height; r += 1) {
          for (let c = 0; c < width; c += 1) {
            if (r + c <= d) grid[r][c] = true;
          }
        }
        frames.push(context.gridToBraille(grid));
      }
      const full = context.makeGrid(height, width);
      for (let r = 0; r < height; r += 1) for (let c = 0; c < width; c += 1) full[r][c] = true;
      frames.push(context.gridToBraille(full));
      for (let d = 0; d <= maxDiag; d += 1) {
        const grid = context.makeGrid(height, width);
        for (let r = 0; r < height; r += 1) {
          for (let c = 0; c < width; c += 1) {
            if (r + c > d) grid[r][c] = true;
          }
        }
        frames.push(context.gridToBraille(grid));
      }
      frames.push(context.gridToBraille(context.makeGrid(height, width)));
      return frames;
    }
  },
  intervalMs: 60,
  aliases: ["diagswipe"],
  meta: {
    category: "scan",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "diagswipe"
  }
});

const lineSweepGenerator = defineLoader({
  id: "line-sweep",
  kind: "braille",
  source: {
    type: "generator",
    generate(context: FrameGeneratorContext) {
      const positions = [-1, 0, 1, 2, 3, 2, 1, 0];
      return positions.map((rowIndex) => {
        const grid = context.makeGrid(4, 8);
        for (let col = 0; col < 8; col += 2) {
          if (rowIndex >= 0 && rowIndex < 4) {
            grid[rowIndex][col] = true;
          }
        }
        return context.gridToBraille(grid);
      });
    }
  },
  intervalMs: 80,
  aliases: ["line-grid", "line"],
  meta: {
    category: "line",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "line"
  }
});

export const curatedLoaders: LoaderDefinition[] = [
  brailleLoader("braille", ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"], 100, {
    category: "braille",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "braille"
  }),
  brailleLoader("braille-wave", ["⠁⠂⠄⡀", "⠂⠄⡀⢀", "⠄⡀⢀⠠", "⡀⢀⠠⠐", "⢀⠠⠐⠈", "⠠⠐⠈⠁", "⠐⠈⠁⠂", "⠈⠁⠂⠄"], 90, {
    category: "braille",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "braillewave"
  }, ["braillewave"]),
  brailleLoader("dna-helix", ["⠋⠉⠙⠚", "⠉⠙⠚⠒", "⠙⠚⠒⠂", "⠚⠒⠂⠂", "⠒⠂⠂⠒", "⠂⠂⠒⠲", "⠂⠒⠲⠴", "⠒⠲⠴⠤", "⠲⠴⠤⠄", "⠴⠤⠄⠋", "⠤⠄⠋⠉", "⠄⠋⠉⠙"], 95, {
    category: "braille",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "dna"
  }, ["dna"]),
  radarGenerator,
  radarWideGenerator,
  scanGenerator,
  scanlineGenerator,
  lineSweepGenerator,
  rainGenerator,
  brailleLoader("sand", ["⠁", "⠂", "⠄", "⡀", "⡈", "⡐", "⡠", "⣀", "⣁", "⣂", "⣄", "⣌", "⣔", "⣤", "⣥", "⣦", "⣮", "⣶", "⣷", "⣿", "⡿", "⠿", "⢟", "⠟", "⡛", "⠛", "⠫", "⢋", "⠋", "⠍", "⡉", "⠉", "⠑", "⠡", "⢁"], 70, {
    category: "dots",
    complexity: "high",
    recommendedRenderer: "text",
    sourceName: "sand"
  }),
  sparkleGenerator,
  checkerboardGenerator,
  helixGenerator,
  waveRowsGenerator,
  snakeGenerator,
  orbitGenerator,
  brailleLoader("bounce", ["⠁", "⠂", "⠄", "⠂"], 120, {
    category: "dots",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "bounce"
  }),
  breatheGenerator,
  brailleLoader("spiral", ["⠁⠀⠀⠀", "⠉⠀⠀⠀", "⠋⠁⠀⠀", "⠋⠉⠀⠀", "⠋⠋⠁⠀", "⠋⠋⠉⠀", "⠋⠋⠋⠁", "⠋⠋⠋⠉", "⠋⠋⠋⠋", "⣿⠋⠋⠋", "⣿⣿⠋⠋", "⣿⣿⣿⠋", "⣿⣿⣿⣿", "⣿⣿⣿⣾", "⣿⣿⣾⣴", "⣿⣾⣴⣤", "⣾⣴⣤⣀", "⣴⣤⣀⠀", "⣤⣀⠀⠀", "⣀⠀⠀⠀", "⠀⠀⠀⠀"], 75, {
    category: "orbit",
    complexity: "high",
    recommendedRenderer: "svg-grid",
    sourceName: "spiral"
  }),
  brailleLoader("vortex", ["⡀⠀⠀⠀", "⣄⠀⠀⠀", "⣦⠀⠀⠀", "⣶⡀⠀⠀", "⣶⣄⠀⠀", "⣶⣦⠀⠀", "⣶⣶⡀⠀", "⣶⣶⣄⠀", "⣶⣶⣦⠀", "⣶⣶⣶⡀", "⣶⣶⣶⣄", "⣶⣶⣶⣦", "⣶⣶⣶⣶", "⠛⣶⣶⣶", "⠛⠛⣶⣶", "⠛⠛⠛⣶", "⠛⠛⠛⠛", "⠀⠛⠛⠛", "⠀⠀⠛⠛", "⠀⠀⠀⠛", "⠀⠀⠀⠀"], 75, {
    category: "orbit",
    complexity: "high",
    recommendedRenderer: "svg-grid",
    sourceName: "vortex"
  }),
  cascadeGenerator,
  columnsGenerator,
  fillSweepGenerator,
  diagSwipeGenerator,
  brailleLoader("pendulum", ["⠁⠀⠀", "⠂⠀⠀", "⠄⠀⠀", "⠆⠀⠀", "⠇⠀⠀", "⠏⠀⠀", "⠟⠀⠀", "⠿⠀⠀", "⠀⠿⠀", "⠀⠀⠿", "⠀⠀⠟", "⠀⠀⠏", "⠀⠀⠇", "⠀⠀⠆", "⠀⠀⠄", "⠀⠀⠂"], 80, {
    category: "orbit",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "pendulum"
  }),
  brailleLoader("wipe", ["⠀⠀⠀", "⡇⠀⠀", "⣿⠀⠀", "⣿⡇⠀", "⣿⣿⠀", "⣿⣿⡇", "⣿⣿⣿", "⢸⣿⣿", "⠀⣿⣿", "⠀⢸⣿", "⠀⠀⣿", "⠀⠀⢸", "⠀⠀⠀"], 85, {
    category: "scan",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "wipe"
  }),
  brailleLoader("zigzag", ["⠁⠀⠀", "⠂⠀⠀", "⠄⠀⠀", "⠠⠀⠀", "⠐⠀⠀", "⠈⠀⠀", "⠀⠁⠀", "⠀⠂⠀", "⠀⠄⠀", "⠀⠠⠀", "⠀⠐⠀", "⠀⠈⠀", "⠀⠀⠁", "⠀⠀⠂", "⠀⠀⠄", "⠀⠀⠠", "⠀⠀⠐", "⠀⠀⠈"], 75, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "zigzag"
  }),
  brailleLoader("wave-two", ["⡀⠀⠀", "⠄⡀⠀", "⠂⠄⡀", "⠁⠂⠄", "⠈⠁⠂", "⠐⠈⠁", "⠠⠐⠈", "⡀⠠⠐", "⠄⡀⠠", "⠂⠄⡀"], 75, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "wave2"
  }, ["wave2"]),
  brailleLoader("progress-dots", ["⠀⠀⠀⠀", "⣀⠀⠀⠀", "⣿⠀⠀⠀", "⣿⣀⠀⠀", "⣿⣿⠀⠀", "⣿⣿⣀⠀", "⣿⣿⣿⠀", "⣿⣿⣿⣀", "⣿⣿⣿⣿", "⠛⣿⣿⣿", "⠀⣿⣿⣿", "⠀⠛⣿⣿", "⠀⠀⣿⣿", "⠀⠀⠛⣿", "⠀⠀⠀⣿", "⠀⠀⠀⠛", "⠀⠀⠀⠀"], 75, {
    category: "dots",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "progressDots"
  }, ["progressDots"]),
  brailleLoader("typewriter", ["⠀⠀⠀⠀", "⡀⠀⠀⠀", "⣀⠀⠀⠀", "⣄⠀⠀⠀", "⣤⠀⠀⠀", "⣤⡀⠀⠀", "⣤⣀⠀⠀", "⣤⣄⠀⠀", "⣤⣤⠀⠀", "⣤⣤⡀⠀", "⣤⣤⣀⠀", "⣤⣤⣄⠀", "⣤⣤⣤⠀", "⣤⣤⣤⡀", "⣤⣤⣤⣀", "⣤⣤⣤⣄", "⣤⣤⣤⣤", "⠀⠀⠀⠀"], 65, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "typewriter"
  }),
  pulseGenerator,
  brailleLoader("pulse-soft", ["⠀⠤⠀", "⠠⠶⠄", "⠶⣿⠶", "⢾⣉⡷", "⠶⣿⠶", "⠄⠶⠠", "⠀⠤⠀"], 95, {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "pulseSoft"
  }, ["pulseSoft"]),
  brailleLoader("pulse-burst", ["⠀⠀", "⠀⠀", "⠐⠂", "⠐⠂", "⠶⠶", "⠶⠶", "⢕⢕", "⢕⢕", "⢕⢕", "⠶⠶", "⠶⠶", "⠐⠂", "⠐⠂", "⠀⠀"], 80, {
    category: "pulse",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "pulseBurst"
  }, ["pulseBurst"]),
  brailleLoader("pulse-square", ["⠀⠀", "⠀⠀", "⠐⠂", "⠐⠂", "⠶⠶", "⠶⠶", "⣿⣿", "⣿⣿", "⣿⣿", "⠶⠶", "⠶⠶", "⠐⠂", "⠐⠂", "⠀⠀"], 80, {
    category: "pulse",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "pulseSquare"
  }, ["pulseSquare"]),
  brailleLoader("pulse-orbit", ["⠀⠀", "⠀⠀", "⠠⠀", "⠠⠄", "⠠⠆", "⠰⠆", "⠲⠆", "⠖⠆", "⡖⠂", "⣖⠀", "⣆⡀", "⣄⣀", "⣀⣠", "⢀⣰", "⠀⣸", "⠀⢹", "⠈⠹", "⠉⠙", "⠉⠉", "⠉⠁"], 65, {
    category: "pulse",
    complexity: "high",
    recommendedRenderer: "svg-grid",
    sourceName: "pulseOrbit"
  }, ["pulseOrbit"]),
  brailleLoader("ripple", ["⠀⠶⠀⠀", "⠰⣿⠆⠀", "⢾⣿⡷⠄", "⣿⢾⣷⡇", "⣷⠀⣿⣿", "⢿⠀⠈⣿", "⠀⠀⠀⢸", "⠀⠀⠀⠀", "⠀⠀⠀⠁", "⠀⠀⠈⠉", "⠀⠈⠋⠋", "⠈⠋⣿⠋", "⠋⣿⣿⠋", "⣿⣿⠋⣿", "⣿⠋⠀⣿", "⠋⠀⠀⠋"], 70, {
    category: "pulse",
    complexity: "high",
    recommendedRenderer: "svg-grid",
    sourceName: "ripple"
  }),
  brailleLoader("pyramid", ["⠀⠀⠀", "⠀⠀⠀", "⣀⣀⣀", "⣀⣀⣀", "⣠⣤⣄", "⣠⣤⣄", "⣠⣶⣄", "⣠⣶⣄", "⣰⣾⣆", "⣰⣾⣆", "⣰⣿⣆", "⣰⣿⣆", "⣰⣿⣆", "⣰⣾⣆", "⣰⣾⣆", "⣠⣶⣄", "⣠⣶⣄", "⣠⣤⣄", "⣠⣤⣄", "⣀⣀⣀", "⣀⣀⣀", "⠀⠀⠀"], 70, {
    category: "novelty",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "pyramid"
  }),
  brailleLoader("tetris", ["⠀⠀", "⠀⠀", "⠉⠀", "⠉⠀", "⣉⠀", "⣉⠀", "⣉⣀", "⣉⣀", "⣉⣁", "⣉⣁", "⣉⣉", "⣉⣉", "⣉⣛", "⣉⣛", "⣛⣛", "⣛⣛", "⣟⣛", "⣟⣛", "⣿⣛", "⣿⣛", "⣿⣟", "⣿⣿", "⣿⣿", "⣶⣶", "⠶⠶", "⠐⠂", "⠀⠀"], 60, {
    category: "novelty",
    complexity: "high",
    recommendedRenderer: "svg-grid",
    sourceName: "tetris"
  }),
  textLoader("meter", ["▱▱▱▱▱", "▰▱▱▱▱", "▰▰▱▱▱", "▰▰▰▱▱", "▰▰▰▰▱", "▰▰▰▰▰", "▱▰▰▰▰", "▱▱▰▰▰", "▱▱▱▰▰", "▱▱▱▱▰"], 90, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "meter"
  }),
  textLoader("pong", ["▐⠂       ▌", "▐ ⠂      ▌", "▐  ⠂     ▌", "▐   ⠂    ▌", "▐    ⠂   ▌", "▐     ⠂  ▌", "▐      ⠂ ▌", "▐       ⠂▌"], 70, {
    category: "novelty",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "pong"
  }),
  textLoader("shark", ["▐|\\____________▌", "▐_|\\___________▌", "▐__|\\__________▌", "▐___|\\_________▌", "▐____|\\________▌"], 85, {
    category: "novelty",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "shark"
  }),
  textLoader("grenade", ["●  ", " ● ", "  ●", " ● ", "●  "], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "grenade"
  }),
  textLoader("blink", ["●", "◉", "○", "◉"], 95, {
    category: "dots",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "blink"
  }),
  textLoader("eyeblink", ["◠ ◠", "◡ ◡", "◠ ◠", "● ●"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "eyeblink"
  }),
  textLoader("heartbeat", ["▁▁▁▁▁", "▁▂▁▁▁", "▁▂▃▂▁", "▁▂█▂▁", "▁▂▃▂▁", "▁▂▁▁▁"], 90, {
    category: "pulse",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "heartbeat"
  }),
  textLoader("pulse-spiral", ["◜", "◠", "◝", "◞", "◡", "◟"], 85, {
    category: "orbit",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "pulseSpiral"
  }, ["pulseSpiral"]),
  textLoader("pulse-x", ["╲", "╳", "╱", "╳"], 80, {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "pulseX"
  }, ["pulseX"]),
  textLoader("x-sync", ["╲ ╱", " ╳ ", "╱ ╲", " ╳ "], 85, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "xSync"
  }, ["xSync"]),
  textLoader("x-sequence", ["╲   ", " ╲  ", "  ╳ ", "  ╱ ", " ╱  ", "╱   "], 75, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "xSequence"
  }, ["xSequence"]),
  textLoader("x-double", ["╲╱", "╳╳", "╱╲", "╳╳"], 80, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "xDouble"
  }, ["xDouble"]),
  textLoader("x-fill", ["□", "▣", "■", "▣"], 95, {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "xFill"
  }, ["xFill"]),
  textLoader("dot-wave", ["●    ", "●●   ", "●●●  ", " ●●● ", "  ●●●", "   ●●", "    ●"], 80, {
    category: "dots",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "dotWave"
  }, ["dotWave"]),
  textLoader("dot-sinewave", ["●     \n      ", " ●    \n      ", "  ●   \n      ", "   ●  \n      ", "    ● \n      ", "     ●\n      ", "      \n     ●", "      \n    ● "], 85, {
    category: "dots",
    complexity: "high",
    recommendedRenderer: "text",
    sourceName: "dotSinewave"
  }, ["dotSinewave"]),
  textLoader("dot-cross", ["●   ●\n  ●  \n●   ●", " ● ● \n  ●  \n ● ● ", "  ●  \n●   ●\n  ●  "], 110, {
    category: "dots",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "dotCross"
  }, ["dotCross"]),
  textLoader("dot-corners", ["●   ●\n     \n●   ●", " ● ● \n     \n ● ● ", "  ●  \n ● ● \n●   ●"], 100, {
    category: "dots",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "dotCorners"
  }, ["dotCorners"]),
  textLoader("dot-arrow", ["●    \n●●   \n●●●  ", " ●   \n ●●  \n ●●● ", "  ●  \n ●●  \n●●●  ", "   ● \n  ●● \n ●●●"], 85, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "dotArrow"
  }, ["dotArrow"]),
  textLoader("heartpulse", ["♡   ♡", "♥   ♥", "♡ ♥ ♡", " ♥♥♥ ", "♡ ♥ ♡", "♥   ♥"], 100, {
    category: "pulse",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "heartpulse"
  }),
  textLoader("line-spinner", ["-", "\\", "|", "/"], 100, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "line"
  }, ["line-text"]),
  textLoader("line-one", ["-", "–", "—", "–"], 100, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "line-1"
  }, ["line-1"]),
  textLoader("line-two", ["⠂", "⠒", "⠤", "⠒"], 90, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "line-2"
  }, ["line-2"]),
  textLoader("rolling-line", ["/", "—", "\\", "|"], 90, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "rolling-line"
  }),
  textLoader("pipe", ["┤", "┘", "┴", "└", "├", "┌", "┬", "┐"], 80, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "pipe"
  }),
  textLoader("simple-dots", [".  ", ".. ", "...", " .."], 120, {
    category: "dots",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "simple-dots"
  }),
  textLoader("scroll-dots", [".  ", " . ", "  .", " . "], 120, {
    category: "dots",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "scroll-dots"
  }),
  textLoader("star-one", ["✶", "✷", "✸", "✹", "✺"], 90, {
    category: "novelty",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "star-1"
  }, ["star-1"]),
  textLoader("star-two", ["+", "×", "+", "·"], 100, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "star-2"
  }, ["star-2"]),
  textLoader("flip", ["_", "-", "‾", "-"], 90, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "flip"
  }),
  textLoader("hamburger", ["☱", "☲", "☴", "☲"], 95, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "hamburger"
  }),
  textLoader("trigram", ["☰", "☱", "☲", "☴", "☷"], 95, {
    category: "novelty",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "trigram"
  }),
  textLoader("grow-vertical", ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█", "▇", "▆"], 85, {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "grow-vertical"
  }),
  textLoader("grow-horizontal", ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "█", "▉", "▊"], 85, {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "grow-horizontal"
  }),
  textLoader("balloon-one", [".", "o", "O", "o"], 110, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "balloon-1"
  }, ["balloon-1"]),
  textLoader("balloon-two", ["·", "•", "●", "•"], 110, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "balloon-2"
  }, ["balloon-2"]),
  textLoader("noise", ["░", "▒", "▓", "█", "▓", "▒"], 85, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "noise"
  }),
  textLoader("boxbounce-one", ["▖", "▘", "▝", "▗"], 95, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "boxbounce-1"
  }, ["boxbounce-1"]),
  textLoader("boxbounce-two", ["▌", "▀", "▐", "▄"], 95, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "boxbounce-2"
  }, ["boxbounce-2"]),
  textLoader("quadblock", ["▖", "▘", "▝", "▗", "▚", "▞", "▛", "▜", "▟", "▙"], 85, {
    category: "novelty",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "quadblock"
  }),
  textLoader("triangle", ["◢", "◣", "◤", "◥"], 95, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "triangle"
  }),
  textLoader("binary", ["010010", "101001", "010110", "001011"], 105, {
    category: "novelty",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "binary"
  }),
  textLoader("arc", ["◜", "◝", "◞", "◟"], 95, {
    category: "orbit",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "arc"
  }),
  textLoader("circle", ["◡", "⊙", "◠", "⊙"], 95, {
    category: "orbit",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "circle"
  }),
  textLoader("square-corners", ["◰", "◳", "◲", "◱"], 95, {
    category: "orbit",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "square-corners"
  }),
  textLoader("circle-quarters", ["◴", "◷", "◶", "◵"], 95, {
    category: "orbit",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "circle-quarters"
  }),
  textLoader("circle-half", ["◐", "◓", "◑", "◒"], 95, {
    category: "orbit",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "circle-half"
  }),
  textLoader("squish", ["╫", "╪", "┿", "╪"], 90, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "squish"
  }),
  textLoader("bracket-spin", ["⊏", "⊐", "⊓", "⊔"], 90, {
    category: "orbit",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "bracket-spin"
  }),
  textLoader("cross-toggle", ["×", "+", "×", "+"], 95, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "cross-toggle"
  }),
  textLoader("toggle-one", ["⊶", "⊷"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-1"
  }, ["toggle-1"]),
  textLoader("toggle-two", ["▫", "▪"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-2"
  }, ["toggle-2"]),
  textLoader("toggle-three", ["□", "■"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-3"
  }, ["toggle-3"]),
  textLoader("toggle-four", ["■", "□"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-4"
  }, ["toggle-4"]),
  textLoader("toggle-five", ["▮", "▯"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-5"
  }, ["toggle-5"]),
  textLoader("toggle-six", ["ဝ", "၀"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-6"
  }, ["toggle-6"]),
  textLoader("toggle-seven", ["⦾", "⦿"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-7"
  }, ["toggle-7"]),
  textLoader("toggle-eight", ["◍", "◎"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-8"
  }, ["toggle-8"]),
  textLoader("toggle-nine", ["◉", "○"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-9"
  }, ["toggle-9"]),
  textLoader("toggle-ten", ["㊂", "㊀"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-10"
  }, ["toggle-10"]),
  textLoader("toggle-eleven", ["⧇", "⧈"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-11"
  }, ["toggle-11"]),
  textLoader("toggle-twelve", ["☗", "☖"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-12"
  }, ["toggle-12"]),
  textLoader("toggle-thirteen", ["=", "≡"], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "toggle-13"
  }, ["toggle-13"]),
  textLoader("arrow-one", ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"], 80, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "arrow-1"
  }, ["arrow-1"]),
  textLoader("arrow-three", ["▹    ", "▹▹   ", "▹▹▹  ", "▹▹▹▹ ", "▹▹▹▹▹"], 90, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "arrow-3"
  }, ["arrow-3"]),
  textLoader("bouncing-bar", ["[=    ]", "[ =   ]", "[  =  ]", "[   = ]", "[    =]"], 90, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "bouncing-bar"
  }),
  textLoader("bouncing-ball", ["(●    )", "( ●   )", "(  ●  )", "(   ● )", "(    ●)"], 90, {
    category: "dots",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "bouncing-ball"
  }),
  textLoader("gradient-sweep", ["░░░░░░", "▒░░░░░", "▓▒░░░░", "█▓▒░░░", "░█▓▒░░", "░░█▓▒░", "░░░█▓▒", "░░░░█▓"], 85, {
    category: "novelty",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "gradient-sweep"
  }),
  textLoader("material", ["█▁▁▁▁▁▁▁", "▁█▁▁▁▁▁▁", "▁▁█▁▁▁▁▁", "▁▁▁█▁▁▁▁", "▁▁▁▁█▁▁▁", "▁▁▁▁▁█▁▁", "▁▁▁▁▁▁█▁", "▁▁▁▁▁▁▁█"], 70, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "material"
  }),
  textLoader("aesthetics", ["▰▱▱▱▱▱▱", "▰▰▱▱▱▱▱", "▰▰▰▱▱▱▱", "▰▰▰▰▱▱▱", "▰▰▰▰▰▱▱", "▰▰▰▰▰▰▱", "▰▰▰▰▰▰▰", "▱▰▰▰▰▰▰"], 80, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "aesthetics"
  })
];

registerLoaders(curatedLoaders);

export const compatibilityAliases = curatedLoaders.flatMap((loader) =>
  (loader.aliases ?? []).map((alias: string) => ({
    canonicalId: loader.id,
    alias,
    sourceName: loader.meta.sourceName ?? loader.id
  }))
);

export const portParityTable = curatedLoaders.map((loader) => ({
  sourceName: loader.meta.sourceName ?? loader.id,
  canonicalId: loader.id,
  aliases: [...(loader.aliases ?? [])]
}));
