import { applyBeforeFrame, applyDecorateRender, applyTransformFrame, resolveEffects } from "./effects/registry";
import { brailleToGrid, gridToBraille, makeGrid } from "./grid";
import { resolveLoader } from "./registry";
import type {
  EffectContext,
  EffectInstance,
  EngineResolvedConfig,
  LoaderConfigV1,
  LoaderEngine,
  LoaderSnapshot,
  RenderModel
} from "./types";
import { LOADER_SCHEMA_VERSION } from "./types";

function resolveFrames(definition: LoaderEngine["definition"]): readonly string[] {
  return definition.source.type === "frames"
    ? definition.source.frames
    : definition.source.generate({
        brailleToGrid,
        gridToBraille,
        makeGrid
      });
}

function resolveConfig(config: LoaderConfigV1): EngineResolvedConfig {
  return {
    schemaVersion: config.schemaVersion ?? LOADER_SCHEMA_VERSION,
    loader: config.loader,
    renderer: config.renderer ?? "text",
    speed: config.speed ?? 1,
    paused: config.paused ?? false,
    respectReducedMotion: config.respectReducedMotion ?? true,
    duration: config.duration ?? { mode: "loop" },
    layout: {
      gap: config.layout?.gap ?? 10,
      labelPosition: config.layout?.labelPosition ?? "right"
    },
    effects: config.effects ?? [],
    rendererOptions: config.rendererOptions ?? {}
  };
}

function buildBaseRenderModel(frame: string, context: EffectContext): RenderModel {
  return {
    renderer: context.config.renderer,
    text: frame,
    style: {
      color: "#f8fafc",
      lineHeight: 1,
      whiteSpace: frame.includes("\n") ? "pre" : "pre-wrap",
      fontFamily:
        context.config.renderer === "text" ? "\"IBM Plex Mono\", ui-monospace, monospace" : undefined,
      fontSize: 24
    },
    containerStyle: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: context.config.layout.gap
    },
    gridStyle: {
      color: "#f8fafc"
    },
    cellStyle: {
      fill: "currentColor"
    }
  };
}

function getFrameIndex(elapsedMs: number, intervalMs: number, frameCount: number, speed: number): number {
  const safeSpeed = Math.max(speed, 0.01);
  const frameDuration = intervalMs / safeSpeed;
  return Math.floor(elapsedMs / frameDuration) % frameCount;
}

function getFinished(elapsedMs: number, duration: EngineResolvedConfig["duration"]): boolean {
  if (duration.mode !== "time" || !duration.seconds) {
    return false;
  }

  return elapsedMs >= duration.seconds * 1000;
}

export function createEngine(config: LoaderConfigV1): LoaderEngine {
  const resolvedConfig = resolveConfig(config);
  const definition = resolveLoader(resolvedConfig.loader);
  const frames = resolveFrames(definition);
  const plugins = resolveEffects(resolvedConfig.effects);

  return {
    config: resolvedConfig,
    definition,
    frames,
    getSnapshot(elapsedMs = 0): LoaderSnapshot {
      const finished = getFinished(elapsedMs, resolvedConfig.duration);
      const baseFrameIndex = finished ? frames.length - 1 : getFrameIndex(elapsedMs, definition.intervalMs, frames.length, resolvedConfig.speed);
      const baseContext: EffectContext = {
        config: resolvedConfig,
        definition,
        frames,
        frameIndex: baseFrameIndex,
        elapsedMs,
        finished
      };
      const effectContext = applyBeforeFrame(baseContext, resolvedConfig.effects as EffectInstance[], plugins);
      const transformedFrame = applyTransformFrame(
        frames[effectContext.frameIndex] ?? frames[0],
        effectContext,
        resolvedConfig.effects as EffectInstance[],
        plugins
      );
      const renderModel = applyDecorateRender(
        buildBaseRenderModel(transformedFrame, effectContext),
        effectContext,
        resolvedConfig.effects as EffectInstance[],
        plugins
      );

      return {
        config: resolvedConfig,
        definition,
        frames,
        elapsedMs,
        frameIndex: effectContext.frameIndex,
        frame: transformedFrame,
        finished,
        renderModel
      };
    }
  };
}
