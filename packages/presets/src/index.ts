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
  brailleLoader("radar", ["⠁⠀", "⠈⠀", "⠀⠁", "⠀⠈", "⠀⠐", "⠀⠠", "⠀⢀", "⠀⡀", "⠀⠄", "⠀⠂", "⠂⠀", "⠄⠀", "⡀⠀", "⢀⠀", "⠠⠀", "⠐⠀"], 85, {
    category: "scan",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "radar"
  }),
  brailleLoader("radar-wide", ["⠀⠁⠀⠀", "⠀⠈⠁⠀", "⠀⠀⠈⠀", "⠀⠀⠐⠀", "⠀⠀⠠⠀", "⠀⠀⢀⠀", "⠀⠀⡀⠀", "⠀⠀⠄⠀", "⠀⠀⠂⠀", "⠀⠂⠀⠀", "⠀⠄⠀⠀", "⠀⡀⠀⠀", "⠀⢀⠀⠀", "⠀⠠⠀⠀", "⠀⠐⠀⠀", "⠀⠈⠀⠀"], 85, {
    category: "scan",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "radar2"
  }, ["radar2"]),
  brailleLoader("scan", ["⠀⠀⠀⠀", "⡇⠀⠀⠀", "⣿⠀⠀⠀", "⢸⡇⠀⠀", "⠀⣿⠀⠀", "⠀⢸⡇⠀", "⠀⠀⣿⠀", "⠀⠀⢸⡇", "⠀⠀⠀⣿", "⠀⠀⠀⢸"], 80, {
    category: "scan",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "scan"
  }),
  scanlineGenerator,
  lineSweepGenerator,
  brailleLoader("rain", ["⢁⠂⠔⠈", "⠂⠌⡠⠐", "⠄⡐⢀⠡", "⡈⠠⠀⢂", "⠐⢀⠁⠄", "⠠⠁⠊⡀"], 95, {
    category: "scan",
    complexity: "medium",
    recommendedRenderer: "text",
    sourceName: "rain"
  }),
  brailleLoader("sand", ["⠁", "⠂", "⠄", "⡀", "⡈", "⡐", "⡠", "⣀", "⣁", "⣂", "⣄", "⣌", "⣔", "⣤", "⣥", "⣦", "⣮", "⣶", "⣷", "⣿", "⡿", "⠿", "⢟", "⠟", "⡛", "⠛", "⠫", "⢋", "⠋", "⠍", "⡉", "⠉", "⠑", "⠡", "⢁"], 70, {
    category: "dots",
    complexity: "high",
    recommendedRenderer: "text",
    sourceName: "sand"
  }),
  brailleLoader("sparkle", ["⡡⠊⢔⠡", "⠊⡰⡡⡘", "⢔⢅⠈⢢", "⡁⢂⠆⡍", "⢔⠨⢑⢐", "⠨⡑⡠⠊"], 90, {
    category: "dots",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "sparkle"
  }),
  brailleLoader("checkerboard", ["⢕⢕⢕", "⡪⡪⡪", "⢊⠔⡡", "⡡⢊⠔"], 120, {
    category: "dots",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "checkerboard"
  }),
  brailleLoader("helix", ["⢌⣉⢎⣉", "⣉⡱⣉⡱", "⣉⢎⣉⢎", "⡱⣉⡱⣉"], 90, {
    category: "braille",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "helix"
  }),
  brailleLoader("wave-rows", ["⠖⠉⠉⠑", "⡠⠖⠉⠉", "⣠⡠⠖⠉", "⣄⣠⡠⠖", "⠢⣄⣠⡠", "⠙⠢⣄⣠", "⠉⠙⠢⣄", "⠊⠉⠙⠢"], 95, {
    category: "braille",
    complexity: "high",
    recommendedRenderer: "text",
    sourceName: "waverows"
  }, ["waverows"]),
  brailleLoader("snake", ["⣁⡀", "⣉⠀", "⡉⠁", "⠉⠉", "⠈⠙", "⠀⠛", "⠐⠚", "⠒⠒", "⠖⠂", "⠶⠀", "⠦⠄", "⠤⠤", "⠠⢤", "⠀⣤", "⢀⣠", "⣀⣀"], 80, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "snake"
  }),
  brailleLoader("orbit", ["⠃", "⠉", "⠘", "⠰", "⢠", "⣀", "⡄", "⠆"], 80, {
    category: "orbit",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "orbit"
  }),
  brailleLoader("bounce", ["⠁", "⠂", "⠄", "⠂"], 120, {
    category: "dots",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "bounce"
  }),
  brailleLoader("breathe", ["⠀", "⠂", "⠌", "⡑", "⢕", "⢝", "⣫", "⣟", "⣿", "⣟", "⣫", "⢝", "⢕", "⡑", "⠌", "⠂", "⠀"], 85, {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "breathe"
  }),
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
  brailleLoader("cascade", ["⠀⠀⠀⠀", "⠀⠀⠀⠀", "⠁⠀⠀⠀", "⠋⠀⠀⠀", "⠞⠁⠀⠀", "⡴⠋⠀⠀", "⣠⠞⠁⠀", "⢀⡴⠋⠀", "⠀⣠⠞⠁", "⠀⢀⡴⠋", "⠀⠀⣠⠞", "⠀⠀⢀⡴", "⠀⠀⠀⣠", "⠀⠀⠀⢀"], 80, {
    category: "scan",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "cascade"
  }),
  brailleLoader("columns", ["⡀⠀⠀", "⡄⠀⠀", "⡆⠀⠀", "⡇⠀⠀", "⣇⠀⠀", "⣧⠀⠀", "⣷⠀⠀", "⣿⠀⠀", "⣿⡀⠀", "⣿⡄⠀", "⣿⡆⠀", "⣿⡇⠀", "⣿⣇⠀", "⣿⣧⠀", "⣿⣷⠀", "⣿⣿⠀", "⣿⣿⡀", "⣿⣿⡄", "⣿⣿⡆", "⣿⣿⡇", "⣿⣿⣇", "⣿⣿⣧", "⣿⣿⣷", "⣿⣿⣿", "⠀⠀⠀"], 70, {
    category: "line",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "columns"
  }),
  brailleLoader("fill-sweep", ["⣀⣀", "⣤⣤", "⣶⣶", "⣿⣿", "⣿⣿", "⣿⣿", "⣶⣶", "⣤⣤", "⣀⣀", "⠀⠀", "⠀⠀"], 90, {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "fillsweep"
  }, ["fillsweep"]),
  brailleLoader("diagonal-swipe", ["⠁⠀", "⠋⠀", "⠟⠁", "⡿⠋", "⣿⠟", "⣿⡿", "⣿⣿", "⣿⣿", "⣾⣿", "⣴⣿", "⣠⣾", "⢀⣴", "⠀⣠", "⠀⢀", "⠀⠀"], 80, {
    category: "scan",
    complexity: "medium",
    recommendedRenderer: "svg-grid",
    sourceName: "diagswipe"
  }, ["diagswipe"]),
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
  brailleLoader("pulse", ["⠀⠶⠀", "⠰⣿⠆", "⢾⣉⡷", "⣏⠀⣹", "⡁⠀⢈"], 95, {
    category: "pulse",
    complexity: "low",
    recommendedRenderer: "svg-grid",
    sourceName: "pulse"
  }),
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
  textLoader("grenade", ["،  ", " ، ", "  ،", " ، ", "،  "], 120, {
    category: "novelty",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "grenade"
  }),
  textLoader("line-spinner", ["-", "\\", "|", "/"], 100, {
    category: "line",
    complexity: "low",
    recommendedRenderer: "text",
    sourceName: "line"
  }, ["line-text"])
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
