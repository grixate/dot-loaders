<div align="center">

# dot-loaders

**A TypeScript toolkit for Unicode and braille-style loading animations.**
Framework-agnostic core, React bindings, curated presets, and a live composer.

```
⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏
⠉⠉ ⠈⠙ ⠀⠹ ⠀⠸ ⠀⠼ ⠀⠴ ⠀⠦ ⠀⠧ ⠀⠇ ⠈⠋
▰▱▱▱ ▰▰▱▱ ▰▰▰▱ ▰▰▰▰ ▰▰▰▱ ▰▰▱▱ ▰▱▱▱
```

[![npm](https://img.shields.io/npm/v/@dot-loaders/core?style=flat-square&color=000)](https://www.npmjs.com/package/@dot-loaders/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@dot-loaders/core?style=flat-square&color=000&label=size)](https://bundlephobia.com/package/@dot-loaders/core)
[![license](https://img.shields.io/github/license/grixate/dot-loaders?style=flat-square&color=000)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/grixate/dot-loaders/ci.yml?style=flat-square&color=000&label=build)](https://github.com/grixate/dot-loaders/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-000?style=flat-square)](https://www.typescriptlang.org/)

[Docs](./apps/docs) · [Composer](./apps/docs) · [shadcn demo](./apps/shadcn-demo) · [Changelog](./CHANGELOG.md)

</div>

---

## Why

Spinners usually ship as a single hardcoded character stream. `dot-loaders` treats them as data — a schema-driven runtime where every loader is a composable definition with frames, timing, and effects. That means you can render the same loader as an SVG grid, a terminal string, or an inline React component, swap symbol maps on the fly, and build new ones without writing imperative animation code.

Built around Unicode braille patterns (U+2800–U+28FF), but extensible to any glyph set.

## Features

- **Schema-first runtime.** Every loader is a typed definition — frames, cadence, effects, symbol map. Stable from day one.
- **Framework-agnostic core.** Zero React dependency in `@dot-loaders/core`. Plug it into anything.
- **React bindings that behave.** Hooks and components designed to drop into shadcn/ui without fighting Tailwind or Radix.
- **Effect pipeline.** Glow, gradients, labels, finishers, and custom symbol maps compose like middleware.
- **Live composer.** The docs app previews custom loaders and exports real runtime definitions — no copy-paste gymnastics.
- **Renderers.** SVG grid, inline text, and terminal output share the same source of truth.

## Install

```bash
pnpm add @dot-loaders/core @dot-loaders/react @dot-loaders/presets
```

```bash
npm install @dot-loaders/core @dot-loaders/react @dot-loaders/presets
```

Peer dependencies: `react >= 18` for the React bindings. Core has none.

## Quick start

```tsx
import { LoaderInline } from "@dot-loaders/react";
import { braille } from "@dot-loaders/presets";

export function Saving() {
  return <LoaderInline loader={braille} renderer="svg-grid" />;
}
```

That's it. The loader animates on mount, cleans up on unmount, and respects `prefers-reduced-motion` by default.

## Usage with shadcn/ui

Designed to sit inside a `Button`, `Dialog`, `Card`, or overlay without layout surprises.

```tsx
import { Button } from "@/components/ui/button";
import { LoaderInline } from "@dot-loaders/react";

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

The `className` threads through to the root element, so anything you do to style the button — including `currentColor` inheritance — just works.

## Packages

| Package | Description |
| --- | --- |
| [`@dot-loaders/core`](./packages/core) | Engine, schema, registry utilities, renderers, effect plugins |
| [`@dot-loaders/presets`](./packages/presets) | Curated loader definitions and compatibility aliases |
| [`@dot-loaders/react`](./packages/react) | React hooks and components for apps and design systems |
| [`apps/docs`](./apps/docs) | Playground, composer, migration notes, plugin authoring guide |
| [`apps/shadcn-demo`](./apps/shadcn-demo) | Reference integration: buttons, cards, overlays |

## Composing a custom loader

Every loader is a plain object. Here's a simple one:

```ts
import { defineLoader } from "@dot-loaders/core";

export const pulse = defineLoader({
  id: "pulse",
  frames: ["⠁", "⠃", "⠇", "⠧", "⠷", "⠿", "⠷", "⠧", "⠇", "⠃"],
  interval: 80,
  effects: [{ kind: "glow", intensity: 0.4 }],
});
```

Pass it anywhere a preset is accepted. Use the composer in the docs app to design new ones visually and export the runtime definition.

## Development

This is a pnpm monorepo. You'll need Node 20+ and pnpm.

```bash
pnpm install
pnpm dev              # start the docs app
pnpm dev:shadcn       # start the shadcn demo
pnpm test             # run the vitest suite
```

## Release flow

Versioning and changelogs run on [Changesets](https://github.com/changesets/changesets).

```bash
pnpm changeset        # add a changeset for your PR
pnpm release:check    # verify release state locally
```

## Contributing

Issues and PRs welcome. For anything non-trivial, open an issue first so we can align on the shape. The composer is the fastest way to prototype new presets — if you design one you like, send it over.

## License

[MIT](./LICENSE) © grixate
