import { LOADER_SCHEMA_VERSION } from "./types";
import type {
  BuiltInEffectName,
  EffectConfigMap,
  EffectContext,
  EffectInstance,
  EffectPlugin,
  FrameGeneratorContext,
  GridShape,
  LabelPosition,
  LoaderConfigV1,
  LoaderCategory,
  LoaderDefinition,
  LoaderEngine,
  LoaderKind,
  LoaderSnapshot,
  RenderOutput,
  RendererConfig,
  RendererType,
  SvgGridRenderOutput,
  ValidationResult
} from "./types";
import { brailleToGrid, gridToBraille, makeGrid, trimGrid } from "./grid";
import { createEngine } from "./engine";
import { defineLoader, listRegisteredLoaders, registerLoaders, resolveLoader, clearLoaderRegistry } from "./registry";
import { clearEffects, listEffects, registerEffect } from "./effects/registry";
import { registerBuiltInEffects } from "./effects/builtins";
import { renderFrame } from "./renderFrame";
import { ensureLoaderConfig, validateLoaderConfig } from "./validate";

registerBuiltInEffects();

export {
  LOADER_SCHEMA_VERSION,
  brailleToGrid,
  clearEffects,
  clearLoaderRegistry,
  createEngine,
  defineLoader,
  ensureLoaderConfig,
  gridToBraille,
  listEffects,
  listRegisteredLoaders,
  makeGrid,
  registerEffect,
  registerLoaders,
  renderFrame,
  resolveLoader,
  trimGrid,
  validateLoaderConfig
};

export type {
  BuiltInEffectName,
  EffectConfigMap,
  EffectContext,
  EffectInstance,
  EffectPlugin,
  FrameGeneratorContext,
  GridShape,
  LabelPosition,
  LoaderConfigV1,
  LoaderCategory,
  LoaderDefinition,
  LoaderEngine,
  LoaderKind,
  LoaderSnapshot,
  RenderOutput,
  RendererConfig,
  RendererType,
  SvgGridRenderOutput,
  ValidationResult
};
