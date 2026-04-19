import type { LoaderDefinition } from "./types";
import { brailleToGrid, gridToBraille, makeGrid } from "./grid";

const loaderRegistry = new Map<string, LoaderDefinition>();
const aliasRegistry = new Map<string, string>();

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function defineLoader(definition: LoaderDefinition): LoaderDefinition {
  const frames =
    definition.source.type === "frames"
      ? definition.source.frames
      : definition.source.generate({ brailleToGrid, gridToBraille, makeGrid });

  if (!definition.id.trim()) {
    throw new Error("Loader definitions require a non-empty id.");
  }

  if (definition.intervalMs < 16) {
    throw new Error(`Loader "${definition.id}" must use an interval of at least 16ms.`);
  }

  if (!frames.length) {
    throw new Error(`Loader "${definition.id}" must resolve at least one frame.`);
  }

  return Object.freeze({
    ...definition,
    aliases: definition.aliases ?? [],
    tags: definition.tags ?? []
  });
}

export function registerLoaders(definitions: readonly LoaderDefinition[]): void {
  definitions.forEach((definition) => {
    const canonical = defineLoader(definition);
    const normalizedId = normalizeKey(canonical.id);

    loaderRegistry.set(normalizedId, canonical);
    aliasRegistry.set(normalizedId, canonical.id);

    canonical.aliases?.forEach((alias) => {
      aliasRegistry.set(normalizeKey(alias), canonical.id);
    });
  });
}

export function clearLoaderRegistry(): void {
  loaderRegistry.clear();
  aliasRegistry.clear();
}

export function listRegisteredLoaders(): LoaderDefinition[] {
  return Array.from(loaderRegistry.values()).sort((left, right) => left.id.localeCompare(right.id));
}

export function resolveLoader(nameOrAlias: string): LoaderDefinition {
  const canonicalId = aliasRegistry.get(normalizeKey(nameOrAlias)) ?? nameOrAlias;
  const loader = loaderRegistry.get(normalizeKey(canonicalId));

  if (!loader) {
    throw new Error(`Unknown loader "${nameOrAlias}". Make sure presets are registered.`);
  }

  return loader;
}
