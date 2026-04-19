import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import loaderSchema from "./schema/loader.schema.json";
import type { LoaderConfigV1, ValidationResult } from "./types";
import { LOADER_SCHEMA_VERSION } from "./types";

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

addFormats(ajv);

const validator = ajv.compile<LoaderConfigV1>(loaderSchema);

export function validateLoaderConfig(value: unknown): ValidationResult<LoaderConfigV1> {
  const valid = validator(value);

  if (!valid) {
    return {
      valid: false,
      errors: validator.errors?.map((error) => `${error.instancePath || "/"} ${error.message}`) ?? []
    };
  }

  return {
    valid: true,
    data: value as LoaderConfigV1
  };
}

export function ensureLoaderConfig(value: unknown): LoaderConfigV1 {
  const result = validateLoaderConfig(value);

  if (!result.valid || !result.data) {
    throw new Error(`Invalid loader config: ${(result.errors ?? []).join("; ")}`);
  }

  return {
    ...result.data,
    schemaVersion: LOADER_SCHEMA_VERSION
  };
}
