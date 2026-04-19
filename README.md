# Braille Loaders

An open-source TypeScript loader toolkit built around Unicode and braille-style animation patterns. It ships with a
framework-agnostic core, React bindings that drop cleanly into ShadCN UI, curated presets, and a docs app that
includes a lightweight composer for editing and creating new loaders.

## Packages

- `@braille-loaders/core`: engine, schema, registry utilities, renderers, and effect plugins
- `@braille-loaders/presets`: curated built-in loader definitions and compatibility aliases
- `@braille-loaders/react`: hooks and components for React apps and design-system integration
- `docs`: playground, composer, migration notes, and plugin authoring examples
- `shadcn-demo`: runnable integration demo for button, card, and overlay patterns

## Why this repo exists

- Extensible TS-first runtime with a stable schema from day one
- Easy to embed inside ShadCN components such as buttons, dialogs, cards, and overlays
- Built-in effect pipeline for glow, gradients, labels, finishers, and custom symbol maps
- Composer flow in the docs app that previews custom loaders and exports real runtime definitions
- Dedicated ShadCN demo app in the monorepo for referenceable integration patterns

## ShadCN Example

```tsx
import { Button } from "@/components/ui/button";
import { LoaderInline } from "@braille-loaders/react";

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button disabled={pending} className="gap-2 rounded-full px-4">
      {pending ? (
        <>
          <LoaderInline loader="braille" renderer="svg-grid" className="text-amber-200" />
          <span>Rendering</span>
        </>
      ) : (
        "Publish"
      )}
    </Button>
  );
}
```

## Development

```bash
npx pnpm install
npx pnpm dev
npx pnpm dev:shadcn
```

## Release Flow

Changesets are used for versioning and changelog generation:

```bash
npx pnpm release:check
```
