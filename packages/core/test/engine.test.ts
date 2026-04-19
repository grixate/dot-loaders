import "@braille-loaders/presets";

import { createEngine, renderFrame, resolveLoader } from "@braille-loaders/core";
import { describe, expect, it } from "vitest";

describe("core engine", () => {
  it("resolves aliases to canonical loaders", () => {
    expect(resolveLoader("braillewave").id).toBe("braille-wave");
    expect(resolveLoader("pulseSquare").id).toBe("pulse-square");
  });

  it("produces deterministic frame progression", () => {
    const engine = createEngine({
      schemaVersion: "1.0",
      loader: "braille",
      speed: 1
    });

    expect(engine.getSnapshot(0).frame).toBe("⠋");
    expect(engine.getSnapshot(100).frame).toBe("⠙");
    expect(engine.getSnapshot(200).frame).toBe("⠹");
  });

  it("supports generator-backed loaders", () => {
    const engine = createEngine({
      schemaVersion: "1.0",
      loader: "scanline-grid",
      renderer: "svg-grid"
    });

    expect(engine.frames.length).toBeGreaterThan(4);
    expect(engine.getSnapshot(0).frame).not.toBe(engine.getSnapshot(440).frame);
  });

  it("composes built-in effects", () => {
    const engine = createEngine({
      schemaVersion: "1.0",
      loader: "braille",
      duration: {
        mode: "time",
        seconds: 0.5
      },
      effects: [
        {
          name: "customSymbolMap",
          config: {
            onChar: "✦",
            offChar: "·",
            showOff: true
          }
        },
        {
          name: "glow",
          config: {
            color: "#f97316"
          }
        },
        {
          name: "finisher",
          config: {
            opacity: 0.5
          }
        }
      ]
    });

    const finishedSnapshot = engine.getSnapshot(1000);
    expect(finishedSnapshot.finished).toBe(true);
    expect(finishedSnapshot.frame.includes("✦")).toBe(true);
    expect(finishedSnapshot.renderModel.containerStyle.opacity).toBe(0.5);
  });

  it("renders svg-grid output with cell metadata", () => {
    const engine = createEngine({
      schemaVersion: "1.0",
      loader: "pulse",
      renderer: "svg-grid"
    });

    const output = renderFrame(engine.getSnapshot(0), {
      type: "svg-grid",
      shape: "diamond",
      cellSize: 12,
      gap: 2
    });

    expect(output.kind).toBe("svg-grid");
    if (output.kind === "svg-grid") {
      expect(output.shape).toBe("diamond");
      expect(output.cells.length).toBeGreaterThan(0);
      expect(output.width).toBeGreaterThan(0);
    }
  });
});
