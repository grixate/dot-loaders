import {
  renderFrame,
  type GridShape,
  type LabelPosition,
  type SvgGridRenderOutput
} from "@braille-loaders/core";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { createElement, useEffect } from "react";
import { LoaderDefaultsContext, type LoaderProviderDefaults } from "./context";
import { type LoaderHookOptions, useLoaderFrame } from "./hooks";

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0
};

function ensureGlobalLoaderStyles() {
  if (typeof document === "undefined") {
    return;
  }

  const existing = document.getElementById("braille-loaders-styles");
  if (existing) {
    return;
  }

  const style = document.createElement("style");
  style.id = "braille-loaders-styles";
  style.textContent = `
    @keyframes braille-loaders-shimmer {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

function resolveDirection(position: LabelPosition) {
  switch (position) {
    case "left":
      return "row-reverse";
    case "top":
      return "column-reverse";
    case "bottom":
      return "column";
    default:
      return "row";
  }
}

function shapeElement(shape: GridShape, x: number, y: number, size: number, active: boolean, opacity: number) {
  const half = size / 2;
  const key = `${shape}-${x}-${y}`;
  const shared = {
    key,
    opacity
  };

  if (shape === "square") {
    return createElement("rect", { ...shared, x, y, width: size, height: size, rx: 2 });
  }

  if (shape === "diamond") {
    return createElement("polygon", {
      ...shared,
      points: `${x + half},${y} ${x + size},${y + half} ${x + half},${y + size} ${x},${y + half}`
    });
  }

  if (shape === "triangle") {
    return createElement("polygon", {
      ...shared,
      points: `${x + half},${y} ${x + size},${y + size} ${x},${y + size}`
    });
  }

  if (shape === "star") {
    const cx = x + half;
    const cy = y + half;
    const outer = half;
    const inner = half * 0.45;
    const points = Array.from({ length: 10 }, (_, index) => {
      const angle = (Math.PI / 5) * index - Math.PI / 2;
      const radius = index % 2 === 0 ? outer : inner;
      return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
    }).join(" ");
    return createElement("polygon", { ...shared, points });
  }

  if (shape === "heart") {
    const path = `M ${x + half} ${y + size} C ${x - half * 0.2} ${y + size * 0.55}, ${x} ${y + size * 0.15}, ${x + half} ${y + size * 0.35} C ${x + size} ${y + size * 0.15}, ${x + size * 1.2} ${y + size * 0.55}, ${x + half} ${y + size}`;
    return createElement("path", { ...shared, d: path });
  }

  return createElement("circle", {
    ...shared,
    cx: x + half,
    cy: y + half,
    r: active ? half * 0.48 : half * 0.42
  });
}

function renderSvgGrid(output: SvgGridRenderOutput) {
  return createElement(
    "svg",
    {
      "aria-hidden": "true",
      width: output.width,
      height: output.height,
      viewBox: output.viewBox,
      style: {
        display: "block",
        overflow: "visible",
        ...output.style
      }
    },
    output.cells.map((cell: SvgGridRenderOutput["cells"][number]) => {
      const x = cell.col * (output.cellSize + output.gap);
      const y = cell.row * (output.cellSize + output.gap);
      return shapeElement(output.shape, x, y, output.cellSize, cell.active, cell.opacity ?? 1);
    })
  );
}

export interface LoaderProps extends LoaderHookOptions, Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  fallbackLabel?: string;
}

export function Loader({ fallbackLabel = "Loading", className, style, ...options }: LoaderProps) {
  useEffect(() => {
    ensureGlobalLoaderStyles();
  }, []);

  const snapshot = useLoaderFrame(options);
  const output =
    options.renderer === "svg-grid"
      ? renderFrame(snapshot, { type: "svg-grid", ...(options.rendererOptions ?? {}) })
      : renderFrame(snapshot);
  const direction = resolveDirection(snapshot.renderModel.label?.position ?? snapshot.config.layout.labelPosition);

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: direction,
        gap: snapshot.config.layout.gap,
        position: "relative",
        ...output.containerStyle,
        ...style
      }}
    >
      {output.kind === "svg-grid" ? (
        renderSvgGrid(output)
      ) : (
        <span aria-hidden="true" style={output.style}>
          {output.text}
        </span>
      )}
      {output.label ? <span style={output.label.style}>{output.label.text}</span> : null}
      <span role="status" aria-live="polite" style={srOnly}>
        {output.label?.text ?? fallbackLabel}
      </span>
    </span>
  );
}

export interface LoaderInlineProps extends LoaderProps {
  children?: ReactNode;
  gap?: number;
}

export function LoaderInline({ children, gap = 12, style, ...props }: LoaderInlineProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap, ...style }}>
      <Loader {...props} />
      {children ? <span>{children}</span> : null}
    </span>
  );
}

export interface LoaderOverlayProps extends LoaderProps {
  active?: boolean;
  children?: ReactNode;
  backdrop?: string;
  containerStyle?: CSSProperties;
}

export function LoaderOverlay({
  active = true,
  children,
  backdrop = "rgba(6, 8, 14, 0.74)",
  containerStyle,
  ...props
}: LoaderOverlayProps) {
  return (
    <div style={{ position: "relative", display: "block", ...containerStyle }} aria-busy={active}>
      <div inert={active || undefined}>{children}</div>
      {active ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: backdrop,
            borderRadius: "inherit",
            backdropFilter: "blur(12px)"
          }}
        >
          <Loader {...props} />
        </div>
      ) : null}
    </div>
  );
}

export interface LoaderProviderProps {
  defaults?: LoaderProviderDefaults;
  children: ReactNode;
}

export function LoaderProvider({ defaults = {}, children }: LoaderProviderProps) {
  return <LoaderDefaultsContext.Provider value={defaults}>{children}</LoaderDefaultsContext.Provider>;
}
