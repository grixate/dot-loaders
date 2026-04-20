import { curatedLoaders } from "@braille-loaders/presets";
import { createEngine, brailleToGrid } from "@braille-loaders/core";
import { Loader, LoaderProvider } from "@braille-loaders/react";
import { useEffect, useMemo, useState } from "react";

function useFaviconLoader(loaderId: string) {
  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const engine = createEngine({ loader: loaderId });
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    const start = performance.now();
    let rafId = 0;
    let intervalId: number | null = null;

    function draw(elapsedMs: number) {
      const snapshot = engine.getSnapshot(elapsedMs);
      const grid = brailleToGrid(snapshot.frame);
      const rows = 4;
      const cols = Math.max(grid[0]?.length ?? 2, 2);
      const cellSize = Math.floor(size / Math.max(rows, cols));
      const gridW = cols * cellSize;
      const gridH = rows * cellSize;
      const offsetX = Math.floor((size - gridW) / 2);
      const offsetY = Math.floor((size - gridH) / 2);
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#fafafa";
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (grid[r]?.[c]) {
            const cx = offsetX + c * cellSize + cellSize / 2;
            const cy = offsetY + r * cellSize + cellSize / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, cellSize * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      link!.href = canvas.toDataURL("image/png");
    }

    if (reducedMotion) {
      draw(0);
    } else {
      const tick = () => {
        draw(performance.now() - start);
      };
      tick();
      intervalId = window.setInterval(tick, 120);
    }

    return () => {
      if (intervalId !== null) window.clearInterval(intervalId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [loaderId]);
}

function BrailleMark({ size = 14 }: { size?: number }) {
  const dots = [
    [true, true],
    [true, false],
    [true, true],
    [false, true]
  ];
  const cell = size / 4;
  const radius = cell * 0.32;
  return (
    <svg width={size} height={size * 2} viewBox={`0 0 ${size} ${size * 2}`} aria-hidden="true">
      {dots.map((row, r) =>
        row.map((active, c) => (
          <circle
            key={`${r}-${c}`}
            cx={c * cell * 2 + cell}
            cy={r * cell * 2 + cell}
            r={radius}
            fill="currentColor"
            opacity={active ? 1 : 0.18}
          />
        ))
      )}
    </svg>
  );
}

const installSnippet = `npm install @braille-loaders/react`;

const usageSnippet = `import { Loader } from "@braille-loaders/react";

<Loader loader="braille" renderer="text" />`;

const shadcnSnippet = `import { Button } from "@/components/ui/button";
import { Loader } from "@braille-loaders/react";

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button disabled={pending}>
      {pending && <Loader loader="braille" renderer="text" />}
      Continue
    </Button>
  );
}`;

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button type="button" className="copy-btn" onClick={handleCopy}>
      {copied ? "Copied" : label}
    </button>
  );
}

function LoaderTile({ id, renderer }: { id: string; renderer: "text" | "svg-grid" }) {
  return (
    <div className="tile-preview">
      <Loader
        loader={id}
        renderer={renderer}
        speed={0.95}
        rendererOptions={
          renderer === "svg-grid"
            ? { shape: "circle", cellSize: 10, gap: 2, inactiveOpacity: 0.08 }
            : {}
        }
      />
    </div>
  );
}

export function App() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  useFaviconLoader("breathe");

  async function copyLoader(id: string) {
    await navigator.clipboard.writeText(`<Loader loader="${id}" />`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  }

  const presetCount = curatedLoaders.length;

  const featuredLoaders = useMemo(
    () => ({
      submit: "wave-rows",
      sync: "scanline-grid",
      deploy: "progress-dots",
      typing: "bounce",
      upload: "columns",
      refresh: "breathe",
      search: "line-sweep",
      pulse: "pulse-soft"
    }),
    []
  );

  return (
    <LoaderProvider defaults={{ renderer: "svg-grid", layout: { gap: 12, labelPosition: "right" } }}>
      <div className="shell">
        <nav className="nav">
          <span className="brand">
            <BrailleMark size={10} />
            <span>braille-loaders</span>
          </span>
          <div className="nav-links">
            <a href="#gallery">Gallery</a>
            <a href="#blocks">Blocks</a>
            <a href="#install">Install</a>
            <a href="https://github.com" className="nav-ghost">GitHub</a>
          </div>
        </nav>

        <section className="hero">
          <h1>Unicode loaders for ShadCN.</h1>
          <p className="sub">
            A tiny TypeScript library of {presetCount} animated loaders. Drops into buttons, cards,
            dialogs, and toasts without a new design system.
          </p>
          <div className="hero-actions">
            <code className="cli">
              <span>$ npm i @braille-loaders/react</span>
              <CopyButton value={installSnippet} />
            </code>
            <a className="btn-ghost" href="#blocks">View examples →</a>
          </div>
        </section>

        <section id="gallery" className="section">
          <header className="section-head">
            <div>
              <h2>Gallery</h2>
              <p>Click any loader to copy its snippet.</p>
            </div>
            <span className="count">{presetCount} loaders</span>
          </header>

          <div className="grid-gallery">
            {curatedLoaders.map((preset) => (
              <button
                type="button"
                key={preset.id}
                className="tile"
                onClick={() => copyLoader(preset.id)}
              >
                <LoaderTile id={preset.id} renderer={preset.meta.recommendedRenderer} />
                <div className="tile-meta">
                  <span className="tile-name">{preset.id}</span>
                  <span className="tile-tag">
                    {copiedId === preset.id ? "copied" : preset.meta.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section id="blocks" className="section">
          <header className="section-head">
            <div>
              <h2>Blocks</h2>
              <p>Real ShadCN patterns with loaders wired in.</p>
            </div>
          </header>

          <div className="grid-blocks">
            <article className="block block-span-2">
              <div className="block-body">
                <div className="block-form">
                  <p className="kicker">Create an account</p>
                  <h3 className="block-title">Welcome back</h3>
                  <p className="block-desc">Enter your email to sign in to your account.</p>
                  <div className="field-stack">
                    <input className="input" placeholder="name@example.com" defaultValue="alex@acme.dev" />
                    <button type="button" className="btn-primary btn-full">
                      <Loader
                        loader={featuredLoaders.submit}
                        renderer="svg-grid"
                        rendererOptions={{ shape: "circle", cellSize: 5, gap: 1, inactiveOpacity: 0 }}
                      />
                      <span>Signing in</span>
                    </button>
                    <div className="divider"><span>or continue with</span></div>
                    <button type="button" className="btn-secondary btn-full">GitHub</button>
                  </div>
                </div>
              </div>
              <footer className="block-foot">
                <span>login-01</span>
                <span className="mono">loader="{featuredLoaders.submit}"</span>
              </footer>
            </article>

            <article className="block">
              <div className="block-body">
                <div className="stat-card">
                  <div className="stat-head">
                    <span className="kicker">Total revenue</span>
                    <Loader loader={featuredLoaders.refresh} renderer="svg-grid" rendererOptions={{ shape: "circle", cellSize: 6, gap: 2 }} />
                  </div>
                  <div className="stat-value">$45,231.89</div>
                  <div className="stat-meta">
                    <span className="pill-up">+20.1%</span>
                    <span className="muted">from last month</span>
                  </div>
                  <div className="sparkline" aria-hidden="true">
                    <svg viewBox="0 0 120 36" preserveAspectRatio="none">
                      <path d="M0 28 L15 22 L30 26 L45 14 L60 18 L75 10 L90 16 L105 6 L120 12" />
                    </svg>
                  </div>
                </div>
              </div>
              <footer className="block-foot">
                <span>dashboard-01</span>
                <span className="mono">Refreshing</span>
              </footer>
            </article>

            <article className="block">
              <div className="block-body">
                <div className="upload-card">
                  <div className="upload-head">
                    <span className="file-icon">ZIP</span>
                    <div>
                      <div className="file-name">release-build.zip</div>
                      <div className="muted small">46.2 MB of 128 MB</div>
                    </div>
                    <Loader loader={featuredLoaders.upload} renderer="svg-grid" rendererOptions={{ shape: "square", cellSize: 5, gap: 2 }} />
                  </div>
                  <div className="progress"><div className="progress-bar" style={{ width: "36%" }} /></div>
                  <div className="upload-foot">
                    <span className="muted small">2.4 MB/s · 34s remaining</span>
                    <button className="btn-link">Cancel</button>
                  </div>
                </div>
              </div>
              <footer className="block-foot">
                <span>upload-01</span>
                <span className="mono">Uploading</span>
              </footer>
            </article>

            <article className="block block-span-2">
              <div className="block-body block-table">
                <div className="table-head-row">
                  <span>Status</span>
                  <span>Deployment</span>
                  <span>Environment</span>
                  <span className="text-right">Duration</span>
                </div>
                <div className="table-row">
                  <span className="status-chip status-active">
                    <Loader loader={featuredLoaders.deploy} renderer="svg-grid" rendererOptions={{ shape: "square", cellSize: 4, gap: 1 }} />
                    Building
                  </span>
                  <span className="mono">feat/auth-refresh</span>
                  <span className="muted">production</span>
                  <span className="text-right mono">12s</span>
                </div>
                <div className="table-row">
                  <span className="status-chip status-queued">Queued</span>
                  <span className="mono">fix/router-edge</span>
                  <span className="muted">preview</span>
                  <span className="text-right mono">—</span>
                </div>
                <div className="table-row">
                  <span className="status-chip status-done">Ready</span>
                  <span className="mono">main@4c8a4a6</span>
                  <span className="muted">production</span>
                  <span className="text-right mono">48s</span>
                </div>
                <div className="table-row">
                  <span className="status-chip status-done">Ready</span>
                  <span className="mono">chore/deps</span>
                  <span className="muted">preview</span>
                  <span className="text-right mono">41s</span>
                </div>
              </div>
              <footer className="block-foot">
                <span>table-01</span>
                <span className="mono">loader="{featuredLoaders.deploy}"</span>
              </footer>
            </article>

            <article className="block">
              <div className="block-body">
                <div className="chat">
                  <div className="chat-bubble chat-user">How is the migration going?</div>
                  <div className="chat-bubble chat-bot chat-typing">
                    <Loader loader={featuredLoaders.typing} renderer="text" />
                  </div>
                </div>
              </div>
              <footer className="block-foot">
                <span>chat-01</span>
                <span className="mono">Typing</span>
              </footer>
            </article>

            <article className="block">
              <div className="block-body">
                <div className="cmdk">
                  <div className="cmdk-input">
                    <Loader loader={featuredLoaders.search} renderer="svg-grid" rendererOptions={{ shape: "circle", cellSize: 5, gap: 1 }} />
                    <input className="cmdk-field" placeholder="Search" defaultValue="invoice" />
                    <kbd>⌘K</kbd>
                  </div>
                  <div className="cmdk-list">
                    <div className="cmdk-group">Results</div>
                    <div className="cmdk-item">
                      <span>Invoice #2483</span>
                      <span className="muted small">Billing</span>
                    </div>
                    <div className="cmdk-item">
                      <span>Invoice template</span>
                      <span className="muted small">Settings</span>
                    </div>
                    <div className="cmdk-item cmdk-muted">
                      <Loader loader="progress-dots" renderer="text" />
                      <span>Searching…</span>
                    </div>
                  </div>
                </div>
              </div>
              <footer className="block-foot">
                <span>command-01</span>
                <span className="mono">Search</span>
              </footer>
            </article>

            <article className="block">
              <div className="block-body">
                <div className="toast">
                  <Loader loader={featuredLoaders.sync} renderer="svg-grid" rendererOptions={{ shape: "square", cellSize: 6, gap: 1 }} />
                  <div className="toast-copy">
                    <strong>Syncing workspace</strong>
                    <span className="muted small">12 records queued</span>
                  </div>
                  <button className="btn-link">Dismiss</button>
                </div>
                <div className="toast toast-muted">
                  <span className="dot dot-ok" />
                  <div className="toast-copy">
                    <strong>Deploy complete</strong>
                    <span className="muted small">main · 48s</span>
                  </div>
                </div>
              </div>
              <footer className="block-foot">
                <span>toast-01</span>
                <span className="mono">loader="{featuredLoaders.sync}"</span>
              </footer>
            </article>

            <article className="block">
              <div className="block-body">
                <div className="pricing">
                  <div className="pricing-head">
                    <span className="kicker">Pro</span>
                    <span className="badge">Popular</span>
                  </div>
                  <div className="pricing-price">$20<span className="muted small">/mo</span></div>
                  <ul className="pricing-list">
                    <li>Unlimited projects</li>
                    <li>Priority support</li>
                    <li>Custom domains</li>
                  </ul>
                  <button type="button" className="btn-primary btn-full">
                    <Loader
                      loader={featuredLoaders.pulse}
                      renderer="svg-grid"
                      rendererOptions={{ shape: "circle", cellSize: 4, gap: 1, inactiveOpacity: 0 }}
                    />
                    <span>Processing payment</span>
                  </button>
                </div>
              </div>
              <footer className="block-foot">
                <span>pricing-01</span>
                <span className="mono">Checkout</span>
              </footer>
            </article>
          </div>
        </section>

        <section id="install" className="section install-section">
          <header className="section-head">
            <div>
              <h2>Install</h2>
              <p>Two lines. No config.</p>
            </div>
          </header>

          <div className="install-grid">
            <div className="code-block">
              <div className="code-head">
                <span className="mono small">terminal</span>
                <CopyButton value={installSnippet} />
              </div>
              <pre>{installSnippet}</pre>
            </div>

            <div className="code-block">
              <div className="code-head">
                <span className="mono small">app.tsx</span>
                <CopyButton value={usageSnippet} />
              </div>
              <pre>{usageSnippet}</pre>
            </div>

            <div className="code-block code-block-wide">
              <div className="code-head">
                <span className="mono small">submit-button.tsx</span>
                <CopyButton value={shadcnSnippet} />
              </div>
              <pre>{shadcnSnippet}</pre>
            </div>
          </div>
        </section>

        <footer className="foot">
          <span>Open source · MIT</span>
          <span className="mono small">{presetCount} loaders</span>
        </footer>
      </div>
    </LoaderProvider>
  );
}
