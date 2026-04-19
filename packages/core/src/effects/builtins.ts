import { brailleToGrid, trimGrid } from "../grid";
import type {
  CustomSymbolMapEffectConfig,
  EffectPlugin,
  FinisherEffectConfig,
  GlowEffectConfig,
  GradientEffectConfig,
  LabelEffectConfig,
  LabelShimmerEffectConfig,
  RenderModel
} from "../types";
import { registerEffect } from "./registry";

const transitionMap: Record<NonNullable<FinisherEffectConfig["transition"]>, string> = {
  ease: "all 0.3s ease",
  linear: "all 0.3s linear",
  spring: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  slow: "all 0.6s ease-in-out",
  snap: "all 0.15s ease-out"
};

function mergeStyle(model: RenderModel, patch: Partial<RenderModel>): RenderModel {
  return {
    ...model,
    ...patch,
    style: { ...model.style, ...(patch.style ?? {}) },
    containerStyle: { ...model.containerStyle, ...(patch.containerStyle ?? {}) },
    gridStyle: { ...model.gridStyle, ...(patch.gridStyle ?? {}) },
    cellStyle: { ...model.cellStyle, ...(patch.cellStyle ?? {}) }
  };
}

export const gradientEffect: EffectPlugin<"gradient", GradientEffectConfig> = {
  name: "gradient",
  order: 20,
  defaultConfig: {
    from: "#faf5ff",
    to: "#f97316",
    angle: 45
  },
  decorateRender(model, _context, config) {
    const gradient = `linear-gradient(${config.angle ?? 45}deg, ${config.from}, ${config.to})`;
    return mergeStyle(model, {
      style: {
        backgroundImage: gradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent"
      },
      gridStyle: {
        backgroundImage: gradient,
        color: "transparent"
      }
    });
  }
};

export const glowEffect: EffectPlugin<"glow", GlowEffectConfig> = {
  name: "glow",
  order: 30,
  defaultConfig: {
    color: "#fef08a",
    blur: 8,
    intensity: 12,
    spread: 24
  },
  decorateRender(model, _context, config) {
    const shadow = [
      `0 0 ${config.blur ?? 8}px ${config.color}`,
      `0 0 ${config.intensity ?? 12}px ${config.color}`,
      `0 0 ${config.spread ?? 24}px ${config.color}`
    ].join(", ");

    return mergeStyle(model, {
      style: {
        textShadow: shadow,
        filter: `drop-shadow(0 0 ${Math.max((config.blur ?? 8) / 2, 2)}px ${config.color})`
      },
      cellStyle: {
        filter: `drop-shadow(0 0 ${Math.max((config.blur ?? 8) / 2, 2)}px ${config.color})`
      }
    });
  }
};

export const customSymbolMapEffect: EffectPlugin<"customSymbolMap", CustomSymbolMapEffectConfig> = {
  name: "customSymbolMap",
  order: 10,
  defaultConfig: {
    onChar: "●",
    offChar: "·",
    showOff: false,
    offOpacity: 0.15
  },
  transformFrame(frame, context, config) {
    if (context.definition.kind !== "braille") {
      return frame;
    }

    const grid = trimGrid(brailleToGrid(frame));
    const onChar = config.onChar || "●";
    const offChar = config.offChar || onChar;

    return grid
      .map((row) =>
        row
          .map((active) => {
            if (active) return onChar;
            return config.showOff ? offChar : " ";
          })
          .join("")
      )
      .join("\n");
  }
};

export const labelEffect: EffectPlugin<"label", LabelEffectConfig> = {
  name: "label",
  order: 40,
  defaultConfig: {
    text: "Loading...",
    color: "#f8fafc",
    fontFamily: "\"IBM Plex Mono\", monospace",
    fontSize: 15,
    fontWeight: 500,
    animateDots: false,
    dotSpeedMs: 500
  },
  decorateRender(model, context, config) {
    let text = config.text;

    if (config.animateDots && text.endsWith("...")) {
      const dotCount = Math.floor(context.elapsedMs / Math.max(config.dotSpeedMs ?? 500, 100)) % 4;
      text = `${text.slice(0, -3)}${".".repeat(dotCount)}${"\u00a0".repeat(3 - dotCount)}`;
    }

    return {
      ...model,
      label: {
        text,
        position: context.config.layout.labelPosition,
        style: {
          color: config.color,
          fontFamily: config.fontFamily,
          fontSize: config.fontSize ?? 15,
          fontWeight: config.fontWeight ?? 500,
          letterSpacing: "0.04em"
        }
      }
    };
  }
};

export const labelShimmerEffect: EffectPlugin<"labelShimmer", LabelShimmerEffectConfig> = {
  name: "labelShimmer",
  order: 50,
  defaultConfig: {
    color: "rgba(255,255,255,0.8)",
    speedSeconds: 1.8,
    direction: "right",
    rotation: 90,
    delayMs: 0
  },
  decorateRender(model, _context, config) {
    if (!model.label) {
      return model;
    }

    const direction = config.direction === "left" ? "reverse" : "normal";
    return {
      ...model,
      label: {
        ...model.label,
        style: {
          ...model.label.style,
          backgroundImage: `linear-gradient(${config.rotation ?? 90}deg, transparent 20%, ${config.color} 50%, transparent 80%)`,
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          animation: `braille-loaders-shimmer ${config.speedSeconds ?? 1.8}s linear ${(config.delayMs ?? 0) / 1000}s infinite ${direction}`
        }
      }
    };
  }
};

export const finisherEffect: EffectPlugin<"finisher", FinisherEffectConfig> = {
  name: "finisher",
  order: 60,
  defaultConfig: {
    opacity: 1,
    color: "",
    visible: true,
    transition: "ease"
  },
  decorateRender(model, context, config) {
    if (!context.finished) {
      return model;
    }

    return mergeStyle(model, {
      containerStyle: {
        opacity: config.visible === false ? 0 : config.opacity ?? 1,
        transition: transitionMap[config.transition ?? "ease"]
      },
      style: config.color ? { color: config.color } : undefined
    });
  }
};

export function registerBuiltInEffects(): void {
  [
    customSymbolMapEffect,
    gradientEffect,
    glowEffect,
    labelEffect,
    labelShimmerEffect,
    finisherEffect
  ].forEach((plugin) => registerEffect(plugin as EffectPlugin));
}
