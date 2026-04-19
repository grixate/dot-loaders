import type { RenderModel, TextRenderOutput } from "../types";

export function renderText(model: RenderModel): TextRenderOutput {
  return {
    kind: "text",
    text: model.text,
    style: model.style,
    containerStyle: model.containerStyle,
    label: model.label
  };
}
