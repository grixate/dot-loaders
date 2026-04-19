import type { LoaderSnapshot, RenderOutput, RendererConfig } from "./types";
import { renderText } from "./renderers/text";
import { renderSvgGrid } from "./renderers/svgGrid";

export function renderFrame(snapshot: LoaderSnapshot, rendererConfig?: RendererConfig): RenderOutput {
  const resolvedRenderer = rendererConfig?.type ?? snapshot.config.renderer;

  if (resolvedRenderer === "svg-grid") {
    return renderSvgGrid(
      snapshot.renderModel,
      rendererConfig?.type === "svg-grid" ? rendererConfig : undefined
    );
  }

  return renderText(snapshot.renderModel);
}
