import type { EffectContext, EffectInstance, EffectPlugin, RenderModel } from "../types";

const effectRegistry = new Map<string, EffectPlugin>();

export function registerEffect(plugin: EffectPlugin): void {
  effectRegistry.set(plugin.name, plugin);
}

export function clearEffects(): void {
  effectRegistry.clear();
}

export function listEffects(): EffectPlugin[] {
  return Array.from(effectRegistry.values()).sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

export function resolveEffects(instances: readonly EffectInstance[]): EffectPlugin[] {
  return instances
    .map((instance) => {
      const plugin = effectRegistry.get(instance.name);
      if (!plugin) {
        throw new Error(`Unknown effect "${instance.name}". Register the plugin before use.`);
      }
      return plugin;
    })
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

export function getEffectConfig<T>(plugin: EffectPlugin<string, T>, instance?: EffectInstance): T {
  return {
    ...(plugin.defaultConfig ?? {}),
    ...((instance?.config as T | undefined) ?? {})
  } as T;
}

export function applyBeforeFrame(
  context: EffectContext,
  instances: readonly EffectInstance[],
  plugins: readonly EffectPlugin[]
): EffectContext {
  return plugins.reduce((nextContext, plugin) => {
    const instance = instances.find((candidate) => candidate.name === plugin.name);
    const config = getEffectConfig(plugin, instance);
    return plugin.beforeFrame ? plugin.beforeFrame(nextContext, config) : nextContext;
  }, context);
}

export function applyTransformFrame(
  frame: string,
  context: EffectContext,
  instances: readonly EffectInstance[],
  plugins: readonly EffectPlugin[]
): string {
  return plugins.reduce((nextFrame, plugin) => {
    const instance = instances.find((candidate) => candidate.name === plugin.name);
    const config = getEffectConfig(plugin, instance);
    return plugin.transformFrame ? plugin.transformFrame(nextFrame, context, config) : nextFrame;
  }, frame);
}

export function applyDecorateRender(
  model: RenderModel,
  context: EffectContext,
  instances: readonly EffectInstance[],
  plugins: readonly EffectPlugin[]
): RenderModel {
  return plugins.reduce((nextModel, plugin) => {
    const instance = instances.find((candidate) => candidate.name === plugin.name);
    const config = getEffectConfig(plugin, instance);
    return plugin.decorateRender ? plugin.decorateRender(nextModel, context, config) : nextModel;
  }, model);
}
