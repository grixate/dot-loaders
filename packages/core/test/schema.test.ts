import { ensureLoaderConfig, validateLoaderConfig } from "@braille-loaders/core";
import { describe, expect, it } from "vitest";

describe("loader schema", () => {
  it("accepts valid v1 configs", () => {
    const result = validateLoaderConfig({
      schemaVersion: "1.0",
      loader: "braille",
      renderer: "svg-grid",
      duration: {
        mode: "time",
        seconds: 3
      },
      effects: [
        {
          name: "glow",
          config: {
            color: "#fff"
          }
        }
      ]
    });

    expect(result.valid).toBe(true);
    expect(result.data?.loader).toBe("braille");
  });

  it("rejects malformed configs", () => {
    const result = validateLoaderConfig({
      schemaVersion: "1.0",
      loader: "",
      duration: {
        mode: "time"
      }
    });

    expect(result.valid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("throws on invalid config via ensureLoaderConfig", () => {
    expect(() =>
      ensureLoaderConfig({
        schemaVersion: "1.0",
        loader: "braille",
        duration: {
          mode: "time"
        }
      })
    ).toThrowError(/Invalid loader config/);
  });
});
