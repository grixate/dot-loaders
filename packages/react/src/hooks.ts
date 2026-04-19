import "@braille-loaders/presets";

import { createEngine, LOADER_SCHEMA_VERSION, type LoaderConfigV1, type LoaderSnapshot } from "@braille-loaders/core";
import { useEffect, useRef, useState } from "react";
import { useLoaderDefaults } from "./context";

export interface LoaderHookOptions extends Partial<Omit<LoaderConfigV1, "schemaVersion">> {
  loader: string;
}

function getReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function mergeOptions(defaults: Partial<Omit<LoaderConfigV1, "schemaVersion" | "loader">>, options: LoaderHookOptions): LoaderConfigV1 {
  return {
    schemaVersion: LOADER_SCHEMA_VERSION,
    loader: options.loader,
    renderer: options.renderer ?? defaults.renderer,
    speed: options.speed ?? defaults.speed,
    paused: options.paused ?? defaults.paused,
    respectReducedMotion: options.respectReducedMotion ?? defaults.respectReducedMotion,
    duration: options.duration ?? defaults.duration,
    layout: {
      ...defaults.layout,
      ...options.layout
    },
    effects: options.effects ?? defaults.effects,
    rendererOptions: {
      ...(defaults.rendererOptions ?? {}),
      ...(options.rendererOptions ?? {})
    }
  };
}

export function useLoaderFrame(options: LoaderHookOptions): LoaderSnapshot {
  const defaults = useLoaderDefaults();
  const [elapsedMs, setElapsedMs] = useState(0);
  const holdMsRef = useRef(0);
  const startedAtRef = useRef(0);
  const reducedMotion = (options.respectReducedMotion ?? defaults.respectReducedMotion ?? true) && getReducedMotion();
  const mergedConfig = mergeOptions(defaults, {
    ...options,
    paused: reducedMotion ? true : options.paused
  });
  const engine = createEngine(mergedConfig);

  useEffect(() => {
    if (typeof performance === "undefined") {
      return;
    }

    holdMsRef.current = 0;
    startedAtRef.current = performance.now();
    setElapsedMs(0);
  }, [mergedConfig.loader]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof performance === "undefined") {
      return;
    }

    if (mergedConfig.paused) {
      if (startedAtRef.current) {
        holdMsRef.current = performance.now() - startedAtRef.current;
      }
      setElapsedMs(holdMsRef.current);
      return;
    }

    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
    let cancelled = false;
    startedAtRef.current = performance.now() - holdMsRef.current;

    const tick = () => {
      if (cancelled) {
        return;
      }

      const nextElapsedMs = performance.now() - startedAtRef.current;
      holdMsRef.current = nextElapsedMs;
      setElapsedMs(nextElapsedMs);
      timeoutId = globalThis.setTimeout(tick, 33);
    };

    tick();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, [
    mergedConfig.loader,
    mergedConfig.paused,
    mergedConfig.speed,
    mergedConfig.duration?.mode,
    mergedConfig.duration?.seconds
  ]);

  return engine.getSnapshot(elapsedMs);
}

export function useLoaderFrames(options: LoaderHookOptions, trailLength = 4): LoaderSnapshot[] {
  const snapshot = useLoaderFrame(options);
  const count = Math.max(trailLength, 1);
  const frames = snapshot.frames;

  return Array.from({ length: count }, (_, index) => {
    const frameIndex =
      (snapshot.frameIndex - (count - 1 - index) + frames.length * count) % Math.max(frames.length, 1);
    return {
      ...snapshot,
      frameIndex,
      frame: frames[frameIndex] ?? frames[0]
    };
  });
}
