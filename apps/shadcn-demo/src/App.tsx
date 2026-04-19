import { Loader, LoaderInline, LoaderOverlay, LoaderProvider } from "@braille-loaders/react";
import { useMemo, useState } from "react";

function Button({
  children,
  disabled,
  variant = "primary",
  onClick
}: {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  onClick?: () => void;
}) {
  return (
    <button className={variant === "ghost" ? "button ghost" : "button"} disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function Card({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>{description}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export function App() {
  const [pendingPublish, setPendingPublish] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeShape, setActiveShape] = useState<"circle" | "diamond" | "star">("diamond");
  const loaderEffects = useMemo(
    () => [
      {
        name: "glow" as const,
        config: { color: "#f59e0b", blur: 7, intensity: 15, spread: 20 }
      }
    ],
    []
  );

  function pulseAction(action: "publish" | "sync") {
    if (action === "publish") {
      setPendingPublish(true);
      window.setTimeout(() => setPendingPublish(false), 2200);
      return;
    }

    setSyncing(true);
    window.setTimeout(() => setSyncing(false), 2600);
  }

  return (
    <LoaderProvider defaults={{ layout: { gap: 12, labelPosition: "right" }, renderer: "svg-grid" }}>
      <div className="demo-shell">
        <header className="hero">
          <div>
            <p className="eyebrow">SHADCN INTEGRATION DEMO</p>
            <h1>Unicode motion inside familiar UI surfaces</h1>
            <p className="lede">
              This app keeps the visual language close to ShadCN patterns while letting loaders take over buttons,
              overlay states, and compact status rows without becoming their own design system.
            </p>
          </div>
          <div className="hero-preview">
            <Loader loader="pulse-orbit" renderer="svg-grid" effects={loaderEffects} rendererOptions={{ shape: activeShape }} />
          </div>
        </header>

        <main className="demo-grid">
          <Card title="Loading buttons" description="Drop `LoaderInline` into action controls">
            <div className="stack">
              <Button disabled={pendingPublish} onClick={() => pulseAction("publish")}>
                {pendingPublish ? (
                  <LoaderInline
                    loader="braille"
                    renderer="text"
                    speed={1.15}
                    effects={loaderEffects}
                    className="inline-loader"
                  >
                    <span>Publishing</span>
                  </LoaderInline>
                ) : (
                  "Publish release"
                )}
              </Button>

              <Button variant="ghost" disabled={syncing} onClick={() => pulseAction("sync")}>
                {syncing ? (
                  <LoaderInline
                    loader="wave-two"
                    renderer="svg-grid"
                    rendererOptions={{ shape: "circle", cellSize: 10, gap: 2 }}
                    effects={loaderEffects}
                    className="inline-loader"
                  >
                    <span>Syncing data</span>
                  </LoaderInline>
                ) : (
                  "Sync now"
                )}
              </Button>
            </div>
          </Card>

          <Card title="Overlay state" description="Use `LoaderOverlay` for pending cards or dialogs">
            <LoaderOverlay
              active={syncing}
              loader="scanline-grid"
              effects={[
                {
                  name: "label",
                  config: { text: "Re-indexing workspace", animateDots: true, color: "#f8fafc" }
                },
                ...loaderEffects
              ]}
              rendererOptions={{ shape: "square", cellSize: 13, gap: 3 }}
              containerStyle={{ borderRadius: 24 }}
            >
              <div className="metric-card">
                <span className="metric-label">Background tasks</span>
                <strong>12 jobs ready</strong>
                <p>LoaderOverlay keeps the content mounted while showing a polished pending layer on top.</p>
              </div>
            </LoaderOverlay>
          </Card>

          <Card title="Surface tokens" description="Swap loader shapes without changing your components">
            <div className="chip-row">
              {(["circle", "diamond", "star"] as const).map((shape) => (
                <button
                  key={shape}
                  className={shape === activeShape ? "chip is-active" : "chip"}
                  type="button"
                  onClick={() => setActiveShape(shape)}
                >
                  {shape}
                </button>
              ))}
            </div>
            <div className="preview-row">
              <Loader
                loader="progress-dots"
                renderer="svg-grid"
                effects={loaderEffects}
                rendererOptions={{ shape: activeShape, cellSize: 12, gap: 3 }}
              />
              <Loader
                loader="typewriter"
                renderer="svg-grid"
                effects={[
                  {
                    name: "gradient",
                    config: { from: "#fde68a", to: "#fb7185", angle: 24 }
                  }
                ]}
                rendererOptions={{ shape: activeShape, cellSize: 12, gap: 3 }}
              />
            </div>
          </Card>
        </main>
      </div>
    </LoaderProvider>
  );
}
