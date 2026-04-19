import { createContext, useContext } from "react";
import type { LoaderConfigV1 } from "@braille-loaders/core";

export interface LoaderProviderDefaults extends Partial<Omit<LoaderConfigV1, "schemaVersion" | "loader">> {}

export const LoaderDefaultsContext = createContext<LoaderProviderDefaults>({});

export function useLoaderDefaults(): LoaderProviderDefaults {
  return useContext(LoaderDefaultsContext);
}
