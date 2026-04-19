import {
  LOADER_SCHEMA_VERSION,
  brailleToGrid,
  defineLoader,
  gridToBraille,
  makeGrid,
  registerLoaders,
  type EffectInstance,
  type LoaderCategory,
  type LoaderConfigV1,
  type LoaderDefinition,
  type LoaderKind
} from "@braille-loaders/core";
import { curatedLoaders, portParityTable } from "@braille-loaders/presets";
import { Loader, LoaderProvider } from "@braille-loaders/react";
import { useEffect, useMemo, useState } from "react";

const categories = Array.from(new Set(curatedLoaders.map((loader) => loader.meta.category)));
const composerCategories: LoaderCategory[] = ["braille", "dots", "pulse", "scan", "line", "orbit", "novelty"];
const composerKinds: LoaderKind[] = ["braille", "text"];
const composerStorageKey = "braille-loaders:composer-draft:v1";

interface ComposerDraft {
  name: string;
  kind: LoaderKind;
  category: LoaderCategory;
  intervalMs: number;
  frames: string[];
}

function defaultDraft(): ComposerDraft {
  return {
    name: "Signal Bloom",
    kind: "braille",
    category: "braille",
    intervalMs: 90,
    frames: ["⠁", "⠃", "⠇", "⠧", "⠷", "⠿", "⠷", "⠧", "⠇", "⠃"]
  };
}

function normalizeLoaderId(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "custom-loader"
  );
}

function toIdentifier(value: string): string {
  const normalized = normalizeLoaderId(value);
  const camel = normalized.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
  return /^[a-z]/.test(camel) ? camel : `loader${camel}`;
}

function parseComposerFrames(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.replace(/\r/g, ""))
    .filter((line) => line.trim().length > 0);
}

function serializeComposerFrames(frames: readonly string[]): string {
  return frames.join("\n");
}

function materializeFrames(definition: LoaderDefinition): string[] {
  if (definition.source.type === "frames") {
    return [...definition.source.frames];
  }

  return [...definition.source.generate({ brailleToGrid, gridToBraille, makeGrid })];
}

function readStoredDraft(): ComposerDraft {
  if (typeof window === "undefined") {
    return defaultDraft();
  }

  try {
    const raw = window.localStorage.getItem(composerStorageKey);

    if (!raw) {
      return defaultDraft();
    }

    const parsed = JSON.parse(raw) as Partial<ComposerDraft>;
    const next = defaultDraft();

    return {
      name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : next.name,
      kind: parsed.kind === "text" ? "text" : "braille",
      category: composerCategories.includes(parsed.category as LoaderCategory)
        ? (parsed.category as LoaderCategory)
        : next.category,
      intervalMs:
        typeof parsed.intervalMs === "number" && Number.isFinite(parsed.intervalMs) && parsed.intervalMs >= 16
          ? parsed.intervalMs
          : next.intervalMs,
      frames:
        Array.isArray(parsed.frames) && parsed.frames.every((frame) => typeof frame === "string") && parsed.frames.length > 0
          ? parsed.frames
          : next.frames
    };
  } catch {
    return defaultDraft();
  }
}

function persistDraft(draft: ComposerDraft): string {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(composerStorageKey, JSON.stringify(draft));
  }

  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function extractDraftFromImport(input: string): ComposerDraft {
  const parsed = JSON.parse(input) as
    | Partial<ComposerDraft>
    | { definition?: Partial<LoaderDefinition>; draft?: Partial<ComposerDraft> }
    | Partial<LoaderDefinition>;

  if ("draft" in parsed && parsed.draft) {
    const draft = parsed.draft;
    return {
      name: typeof draft.name === "string" && draft.name.trim() ? draft.name : "Imported Draft",
      kind: draft.kind === "text" ? "text" : "braille",
      category: composerCategories.includes(draft.category as LoaderCategory)
        ? (draft.category as LoaderCategory)
        : "braille",
      intervalMs:
        typeof draft.intervalMs === "number" && Number.isFinite(draft.intervalMs) && draft.intervalMs >= 16
          ? draft.intervalMs
          : 90,
      frames:
        Array.isArray(draft.frames) && draft.frames.every((frame) => typeof frame === "string") && draft.frames.length > 0
          ? draft.frames
          : defaultDraft().frames
    };
  }

  const candidate = ("definition" in parsed && parsed.definition ? parsed.definition : parsed) as Partial<LoaderDefinition>;

  if (
    typeof candidate !== "object" ||
    candidate === null ||
    !candidate.source ||
    candidate.source.type !== "frames" ||
    !Array.isArray(candidate.source.frames)
  ) {
    throw new Error("Unsupported JSON. Expected a composer draft or a frames-based loader definition.");
  }

  return {
    name: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : "Imported Loader",
    kind: candidate.kind === "text" ? "text" : "braille",
    category: composerCategories.includes(candidate.meta?.category as LoaderCategory)
      ? (candidate.meta?.category as LoaderCategory)
      : "braille",
    intervalMs:
      typeof candidate.intervalMs === "number" && Number.isFinite(candidate.intervalMs) && candidate.intervalMs >= 16
        ? candidate.intervalMs
        : 90,
    frames: candidate.source.frames.filter((frame: unknown): frame is string => typeof frame === "string")
  };
}

export function App() {
  const initialDraft = useMemo(() => readStoredDraft(), []);
  const [loader, setLoader] = useState("braille");
  const [renderer, setRenderer] = useState<"text" | "svg-grid">("svg-grid");
  const [speed, setSpeed] = useState(1);
  const [gradientEnabled, setGradientEnabled] = useState(true);
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [labelEnabled, setLabelEnabled] = useState(true);
  const [labelText, setLabelText] = useState("Loading...");
  const [customSymbols, setCustomSymbols] = useState(false);
  const [durationMode, setDurationMode] = useState<"loop" | "time">("loop");
  const [durationSeconds, setDurationSeconds] = useState(3);
  const [shape, setShape] = useState("circle");
  const [sourceMode, setSourceMode] = useState<"preset" | "custom">("preset");
  const [customName, setCustomName] = useState(initialDraft.name);
  const [customKind, setCustomKind] = useState<LoaderKind>(initialDraft.kind);
  const [customCategory, setCustomCategory] = useState<LoaderCategory>(initialDraft.category);
  const [customInterval, setCustomInterval] = useState(initialDraft.intervalMs);
  const [customFramesText, setCustomFramesText] = useState(serializeComposerFrames(initialDraft.frames));
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const composerFrames = useMemo(() => parseComposerFrames(customFramesText), [customFramesText]);
  const composerId = useMemo(() => normalizeLoaderId(customName), [customName]);
  const composerReady = composerFrames.length > 0;
  const activePresetDefinition = useMemo(
    () => curatedLoaders.find((candidate) => candidate.id === loader) ?? curatedLoaders[0],
    [loader]
  );
  const composerVariable = useMemo(() => toIdentifier(customName), [customName]);

  const customDefinition = useMemo(() => {
    if (!composerReady) {
      return null;
    }

    return defineLoader({
      id: composerId,
      kind: customKind,
      intervalMs: customInterval,
      source: {
        type: "frames",
        frames: composerFrames
      },
      aliases: [`custom:${composerId}`],
      tags: ["composer", "docs", customCategory],
      meta: {
        category: customCategory,
        complexity: composerFrames.length > 8 ? "medium" : "low",
        recommendedRenderer: customKind === "text" ? "text" : "svg-grid",
        sourceName: "docs-composer"
      }
    });
  }, [composerFrames, composerId, composerReady, customCategory, customInterval, customKind]);

  useEffect(() => {
    if (!customDefinition) {
      return;
    }

    registerLoaders([customDefinition]);
  }, [customDefinition]);

  useEffect(() => {
    const stamp = persistDraft({
      name: customName,
      kind: customKind,
      category: customCategory,
      intervalMs: customInterval,
      frames: composerFrames.length > 0 ? composerFrames : defaultDraft().frames
    });
    setDraftSavedAt(stamp);
  }, [composerFrames, customCategory, customInterval, customKind, customName]);

  const activeLoader = sourceMode === "custom" && composerReady ? composerId : loader;
  const effectiveRenderer =
    sourceMode === "custom" && composerReady && customKind === "text" ? "text" : renderer;

  const effects: EffectInstance[] = [];

  if (gradientEnabled) {
    effects.push({
      name: "gradient",
      config: {
        from: "#fde68a",
        to: "#fb7185",
        angle: 38
      }
    });
  }

  if (glowEnabled) {
    effects.push({
      name: "glow",
      config: {
        color: "#f97316",
        blur: 8,
        intensity: 18,
        spread: 32
      }
    });
  }

  if (labelEnabled) {
    effects.push({
      name: "label",
      config: {
        text: labelText,
        color: "#f8fafc",
        fontFamily: "\"IBM Plex Sans\", sans-serif",
        fontSize: 15,
        fontWeight: 600,
        animateDots: true,
        dotSpeedMs: 450
      }
    });
    effects.push({
      name: "labelShimmer",
      config: {
        color: "rgba(255,255,255,0.9)",
        speedSeconds: 1.4,
        direction: "right",
        rotation: 90
      }
    });
  }

  if (customSymbols) {
    effects.push({
      name: "customSymbolMap",
      config: {
        onChar: "✦",
        offChar: "·",
        showOff: true
      }
    });
  }

  if (durationMode === "time") {
    effects.push({
      name: "finisher",
      config: {
        opacity: 0.65,
        transition: "slow",
        visible: true
      }
    });
  }

  const config: LoaderConfigV1 = {
    schemaVersion: LOADER_SCHEMA_VERSION,
    loader: activeLoader,
    renderer: effectiveRenderer,
    speed,
    duration: durationMode === "time" ? { mode: "time", seconds: durationSeconds } : { mode: "loop" },
    layout: {
      gap: 14,
      labelPosition: "right"
    },
    effects,
    rendererOptions: effectiveRenderer === "svg-grid" ? { shape, cellSize: 15, gap: 3, inactiveOpacity: 0.08 } : {}
  };

  const configJson = JSON.stringify(config, null, 2);
  const definitionJson = JSON.stringify(
    customDefinition
      ? {
          schemaVersion: LOADER_SCHEMA_VERSION,
          draft: {
            name: customName,
            kind: customKind,
            category: customCategory,
            intervalMs: customInterval,
            frames: composerFrames
          },
          definition: {
            ...customDefinition,
            source: {
              type: "frames",
              frames: composerFrames
            }
          }
        }
      : {
          schemaVersion: LOADER_SCHEMA_VERSION,
          draft: {
            name: customName,
            kind: customKind,
            category: customCategory,
            intervalMs: customInterval,
            frames: composerFrames
          }
        },
    null,
    2
  );

  const composerSnippet = customDefinition
    ? `import { defineLoader, registerLoaders } from "@braille-loaders/core";

const ${composerVariable} = defineLoader({
  id: "${customDefinition.id}",
  kind: "${customDefinition.kind}",
  intervalMs: ${customDefinition.intervalMs},
  source: {
    type: "frames",
    frames: ${JSON.stringify(composerFrames, null, 2)}
  },
  aliases: ${JSON.stringify(customDefinition.aliases ?? [], null, 2)},
  tags: ${JSON.stringify(customDefinition.tags ?? [], null, 2)},
  meta: {
    category: "${customDefinition.meta.category}",
    complexity: "${customDefinition.meta.complexity}",
    recommendedRenderer: "${customDefinition.meta.recommendedRenderer}",
    sourceName: "docs-composer"
  }
});

registerLoaders([${composerVariable}]);`
    : "// Add at least one frame to generate a loader definition.";

  const shadcnSnippet = `import { Button } from "@/components/ui/button";
import { LoaderInline } from "@braille-loaders/react";

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button disabled={pending} className="gap-2 rounded-full px-4">
      {pending ? (
        <>
          <LoaderInline
            loader="${activeLoader}"
            renderer="${effectiveRenderer}"
            speed={0.95}
            effects={[
              {
                name: "glow",
                config: { color: "#f97316", blur: 6, intensity: 12, spread: 18 }
              }
            ]}
            className="text-amber-200"
          />
          <span>Rendering</span>
        </>
      ) : (
        "Publish"
      )}
    </Button>
  );
}`;

  function applyDraft(draft: ComposerDraft) {
    setCustomName(draft.name);
    setCustomKind(draft.kind);
    setCustomCategory(draft.category);
    setCustomInterval(draft.intervalMs);
    setCustomFramesText(serializeComposerFrames(draft.frames));
    setSourceMode("custom");
  }

  function seedFromPreset() {
    const presetFrames = materializeFrames(activePresetDefinition);

    applyDraft({
      name: `${activePresetDefinition.id} remix`,
      kind: activePresetDefinition.kind,
      category: activePresetDefinition.meta.category,
      intervalMs: activePresetDefinition.intervalMs,
      frames: presetFrames
    });
    setImportMessage(`Seeded composer from preset "${activePresetDefinition.id}".`);
  }

  function resetDraft() {
    applyDraft(defaultDraft());
    setImportMessage("Composer reset to the default draft.");
  }

  function saveDraftNow() {
    const stamp = persistDraft({
      name: customName,
      kind: customKind,
      category: customCategory,
      intervalMs: customInterval,
      frames: composerFrames.length > 0 ? composerFrames : defaultDraft().frames
    });
    setDraftSavedAt(stamp);
    setImportMessage(`Draft saved locally at ${stamp}.`);
  }

  async function copyConfig() {
    await navigator.clipboard.writeText(configJson);
  }

  async function copyDefinitionJson() {
    await navigator.clipboard.writeText(definitionJson);
    setImportMessage("Composer JSON copied to clipboard.");
  }

  function importComposerJson() {
    try {
      const imported = extractDraftFromImport(importText);
      applyDraft(imported);
      setImportMessage(`Imported loader draft "${imported.name}".`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Unable to import that JSON.");
    }
  }

  return (
    <LoaderProvider defaults={{ renderer: "svg-grid", layout: { gap: 14, labelPosition: "right" } }}>
      <div className="page-shell">
        <header className="hero">
          <p className="eyebrow">OPEN SOURCE UNICODE LAB</p>
          <div className="hero-grid">
            <div className="hero-copy">
              <h1>Braille Loaders</h1>
              <p className="lede">
                An extensible TypeScript loader system with preset packs, runtime effects, ShadCN-friendly React
                primitives, and a lightweight composer for building your own motion glyphs without leaving the same
                schema.
              </p>
              <div className="hero-actions">
                <button className="primary-button" onClick={copyConfig}>
                  Copy JSON Config
                </button>
                <button className="secondary-button" onClick={copyDefinitionJson}>
                  Copy Composer JSON
                </button>
                <div className="capsule">
                  <span>{curatedLoaders.length} curated presets</span>
                  <span>schema {LOADER_SCHEMA_VERSION}</span>
                </div>
              </div>
            </div>

            <div className="preview-card">
              <div className="preview-orbit preview-orbit-a" />
              <div className="preview-orbit preview-orbit-b" />
              <Loader
                loader={activeLoader}
                renderer={effectiveRenderer}
                speed={speed}
                duration={config.duration}
                effects={effects}
                layout={config.layout}
                rendererOptions={config.rendererOptions}
              />
            </div>
          </div>
        </header>

        <main className="content-grid">
          <section className="panel controls-panel">
            <div className="panel-header">
              <p className="eyebrow">Playground</p>
              <h2>Shape the loader</h2>
            </div>

            <div className="mode-switch" role="tablist" aria-label="Loader source">
              <button
                type="button"
                className={sourceMode === "preset" ? "mode-chip is-active" : "mode-chip"}
                onClick={() => setSourceMode("preset")}
              >
                Preset source
              </button>
              <button
                type="button"
                className={sourceMode === "custom" ? "mode-chip is-active" : "mode-chip"}
                onClick={() => setSourceMode("custom")}
              >
                Composer source
              </button>
            </div>

            <label className="field">
              <span>Loader preset</span>
              <select value={loader} onChange={(event) => setLoader(event.target.value)}>
                {categories.map((category) => (
                  <optgroup key={category} label={category}>
                    {curatedLoaders
                      .filter((candidate) => candidate.meta.category === category)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.id}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="field-row">
              <label className="field">
                <span>Renderer</span>
                <select value={renderer} onChange={(event) => setRenderer(event.target.value as "text" | "svg-grid")}>
                  <option value="svg-grid">svg-grid</option>
                  <option value="text">text</option>
                </select>
              </label>

              <label className="field">
                <span>Shape</span>
                <select value={shape} onChange={(event) => setShape(event.target.value)}>
                  <option value="circle">circle</option>
                  <option value="square">square</option>
                  <option value="diamond">diamond</option>
                  <option value="triangle">triangle</option>
                  <option value="star">star</option>
                  <option value="heart">heart</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Speed {speed.toFixed(1)}x</span>
              <input
                type="range"
                min="0.4"
                max="2.4"
                step="0.1"
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value))}
              />
            </label>

            <div className="field-row">
              <label className="toggle">
                <input type="checkbox" checked={gradientEnabled} onChange={(event) => setGradientEnabled(event.target.checked)} />
                <span>Gradient</span>
              </label>
              <label className="toggle">
                <input type="checkbox" checked={glowEnabled} onChange={(event) => setGlowEnabled(event.target.checked)} />
                <span>Glow</span>
              </label>
              <label className="toggle">
                <input type="checkbox" checked={customSymbols} onChange={(event) => setCustomSymbols(event.target.checked)} />
                <span>Custom symbols</span>
              </label>
            </div>

            <div className="field-row">
              <label className="toggle">
                <input type="checkbox" checked={labelEnabled} onChange={(event) => setLabelEnabled(event.target.checked)} />
                <span>Label</span>
              </label>
              <label className="field">
                <span>Duration mode</span>
                <select value={durationMode} onChange={(event) => setDurationMode(event.target.value as "loop" | "time")}>
                  <option value="loop">loop</option>
                  <option value="time">time</option>
                </select>
              </label>
              <label className="field">
                <span>Seconds</span>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={durationSeconds}
                  onChange={(event) => setDurationSeconds(Number(event.target.value))}
                  disabled={durationMode !== "time"}
                />
              </label>
            </div>

            <label className="field">
              <span>Label text</span>
              <input value={labelText} onChange={(event) => setLabelText(event.target.value)} />
            </label>
          </section>

          <section className="panel composer-panel">
            <div className="panel-header">
              <p className="eyebrow">Composer</p>
              <h2>Author a custom loader</h2>
            </div>

            <p className="composer-brief">
              Build a new loader from raw frames, preview it instantly, save drafts in local storage, and round-trip the
              definition as JSON without inventing a second format.
            </p>

            <div className="action-row">
              <button className="secondary-button" onClick={seedFromPreset}>
                Seed from preset
              </button>
              <button className="secondary-button" onClick={saveDraftNow}>
                Save draft
              </button>
              <button className="secondary-button" onClick={resetDraft}>
                Reset draft
              </button>
            </div>

            <div className="field-row composer-meta">
              <label className="field">
                <span>Name</span>
                <input value={customName} onChange={(event) => setCustomName(event.target.value)} />
              </label>
              <label className="field">
                <span>Kind</span>
                <select value={customKind} onChange={(event) => setCustomKind(event.target.value as LoaderKind)}>
                  {composerKinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Category</span>
                <select value={customCategory} onChange={(event) => setCustomCategory(event.target.value as LoaderCategory)}>
                  {composerCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field-row composer-meta">
              <label className="field">
                <span>Interval ms</span>
                <input
                  type="number"
                  min="16"
                  step="1"
                  value={customInterval}
                  onChange={(event) => setCustomInterval(Math.max(16, Number(event.target.value) || 16))}
                />
              </label>
              <div className="composer-badge">
                <span className="mini-label">Generated id</span>
                <strong>{composerId}</strong>
              </div>
              <div className="composer-badge">
                <span className="mini-label">Draft saved</span>
                <strong>{draftSavedAt ?? "just now"}</strong>
              </div>
            </div>

            <label className="field">
              <span>Frames, one per line</span>
              <textarea
                rows={10}
                value={customFramesText}
                onChange={(event) => setCustomFramesText(event.target.value)}
                placeholder={"⠁\n⠃\n⠇\n⠧"}
              />
            </label>

            <div className="composer-preview">
              <div>
                <span className="mini-label">Live preview</span>
                <Loader
                  loader={composerReady ? composerId : loader}
                  renderer={customKind === "text" ? "text" : renderer}
                  speed={speed}
                  duration={{ mode: "loop" }}
                  effects={effects}
                  layout={config.layout}
                  rendererOptions={customKind === "text" ? {} : config.rendererOptions}
                />
              </div>
              <p>
                Switch the main playground to <strong>Composer source</strong> to test this draft with the same effects,
                timing, and renderer controls.
              </p>
            </div>

            <label className="field">
              <span>Import composer JSON</span>
              <textarea
                rows={8}
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder='{"definition":{"id":"my-loader","kind":"braille","intervalMs":90,"source":{"type":"frames","frames":["⠁","⠃"]},"meta":{"category":"braille","complexity":"low","recommendedRenderer":"text"}}}'
              />
            </label>

            <div className="action-row">
              <button className="secondary-button" onClick={importComposerJson}>
                Import JSON
              </button>
              {importMessage ? <span className="status-note">{importMessage}</span> : null}
            </div>
          </section>

          <section className="panel schema-panel">
            <div className="panel-header">
              <p className="eyebrow">Config</p>
              <h2>Stable runtime output</h2>
            </div>
            <pre>{configJson}</pre>
          </section>

          <section className="panel prose-panel">
            <div className="panel-header">
              <p className="eyebrow">Composer Export</p>
              <h2>Register the current draft</h2>
            </div>
            <pre>{composerSnippet}</pre>
            <p>
              The exported definition is frames-based on purpose, which makes it easy to edit, review, import later,
              and keep compatible with a future visual composer.
            </p>
          </section>

          <section className="panel prose-panel">
            <div className="panel-header">
              <p className="eyebrow">Plugin Guide</p>
              <h2>Effect authoring contract</h2>
            </div>
            <pre>{`import { registerEffect } from "@braille-loaders/core";

registerEffect({
  name: "halo",
  order: 35,
  transformFrame(frame) {
    return frame;
  },
  decorateRender(model) {
    return {
      ...model,
      style: {
        ...model.style,
        filter: "drop-shadow(0 0 12px #67e8f9)"
      }
    };
  }
});`}</pre>
            <p>
              Effects are ordered, deterministic, and work across renderers. The composer already emits the same loader
              definition shape and JSON config you would ship in an app or package.
            </p>
          </section>

          <section className="panel prose-panel">
            <div className="panel-header">
              <p className="eyebrow">ShadCN</p>
              <h2>Drop into UI primitives</h2>
            </div>
            <pre>{shadcnSnippet}</pre>
            <p>
              A runnable integration demo now lives in `apps/shadcn-demo`, showing button, card, and overlay patterns
              that mirror the kinds of surfaces we usually build with ShadCN.
            </p>
          </section>

          <section className="panel prose-panel">
            <div className="panel-header">
              <p className="eyebrow">Draft JSON</p>
              <h2>Portable composer bundle</h2>
            </div>
            <pre>{definitionJson}</pre>
          </section>

          <section className="panel migration-panel">
            <div className="panel-header">
              <p className="eyebrow">Migration</p>
              <h2>Alias parity table</h2>
            </div>
            <div className="table">
              <div className="table-head">
                <span>Source</span>
                <span>Canonical</span>
                <span>Aliases</span>
              </div>
              {portParityTable.slice(0, 16).map((row) => (
                <div key={`${row.sourceName}-${row.canonicalId}`} className="table-row">
                  <span>{row.sourceName}</span>
                  <span>{row.canonicalId}</span>
                  <span>{row.aliases.join(", ") || "—"}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </LoaderProvider>
  );
}
