export const LOADER_SCHEMA_VERSION = "1.0" as const;

export type LoaderSchemaVersion = typeof LOADER_SCHEMA_VERSION;
export type RendererType = "text" | "svg-grid";
export type LoaderKind = "braille" | "text";
export type LabelPosition = "left" | "right" | "top" | "bottom";
export type LoaderComplexity = "low" | "medium" | "high";
export type LoaderCategory =
  | "braille"
  | "dots"
  | "pulse"
  | "scan"
  | "line"
  | "orbit"
  | "novelty";
export type GridShape =
  | "circle"
  | "square"
  | "diamond"
  | "triangle"
  | "star"
  | "heart";

export type StyleValue = string | number | undefined;
export type StyleMap = Record<string, StyleValue>;

export interface FrameGeneratorContext {
  brailleToGrid(frame: string): boolean[][];
  gridToBraille(grid: boolean[][]): string;
  makeGrid(rows: number, cols: number): boolean[][];
}

export interface StaticFrameSource {
  type: "frames";
  frames: readonly string[];
}

export interface GeneratorFrameSource {
  type: "generator";
  generate(context: FrameGeneratorContext): readonly string[];
}

export type FrameSource = StaticFrameSource | GeneratorFrameSource;

export interface LoaderMeta {
  category: LoaderCategory;
  complexity: LoaderComplexity;
  recommendedRenderer: RendererType;
  sourceName?: string;
}

export interface LoaderDefinition {
  id: string;
  kind: LoaderKind;
  source: FrameSource;
  intervalMs: number;
  aliases?: readonly string[];
  tags?: readonly string[];
  meta: LoaderMeta;
}

export interface DurationConfig {
  mode: "loop" | "time";
  seconds?: number;
}

export interface LayoutConfig {
  gap?: number;
  labelPosition?: LabelPosition;
}

export interface GradientEffectConfig {
  from: string;
  to: string;
  angle?: number;
}

export interface GlowEffectConfig {
  color: string;
  blur?: number;
  intensity?: number;
  spread?: number;
}

export interface LabelEffectConfig {
  text: string;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  animateDots?: boolean;
  dotSpeedMs?: number;
}

export interface LabelShimmerEffectConfig {
  color?: string;
  speedSeconds?: number;
  direction?: "left" | "right";
  rotation?: number;
  delayMs?: number;
}

export interface FinisherEffectConfig {
  opacity?: number;
  color?: string;
  visible?: boolean;
  transition?: "ease" | "linear" | "spring" | "slow" | "snap";
}

export interface CustomSymbolMapEffectConfig {
  onChar?: string;
  offChar?: string;
  showOff?: boolean;
  offOpacity?: number;
}

export interface EffectConfigMap {
  gradient: GradientEffectConfig;
  glow: GlowEffectConfig;
  label: LabelEffectConfig;
  labelShimmer: LabelShimmerEffectConfig;
  finisher: FinisherEffectConfig;
  customSymbolMap: CustomSymbolMapEffectConfig;
}

export interface EffectInstance<Name extends string = string, Config = Record<string, unknown>> {
  name: Name;
  config?: Config;
}

export type BuiltInEffectName = keyof EffectConfigMap;

export interface LoaderConfigV1 {
  schemaVersion: LoaderSchemaVersion;
  loader: string;
  renderer?: RendererType;
  speed?: number;
  paused?: boolean;
  respectReducedMotion?: boolean;
  duration?: DurationConfig;
  layout?: LayoutConfig;
  effects?: readonly EffectInstance[];
  rendererOptions?: Record<string, unknown>;
}

export interface EngineResolvedConfig extends LoaderConfigV1 {
  renderer: RendererType;
  speed: number;
  paused: boolean;
  respectReducedMotion: boolean;
  duration: DurationConfig;
  layout: Required<LayoutConfig>;
  effects: readonly EffectInstance[];
}

export interface SvgGridRendererConfig {
  type: "svg-grid";
  cellSize?: number;
  gap?: number;
  shape?: GridShape;
  inactiveOpacity?: number;
}

export interface TextRendererConfig {
  type: "text";
}

export type RendererConfig = TextRendererConfig | SvgGridRendererConfig;

export interface LabelPresentation {
  text: string;
  position: LabelPosition;
  style: StyleMap;
}

export interface GridCell {
  row: number;
  col: number;
  active: boolean;
  opacity?: number;
}

export interface RenderModel {
  renderer: RendererType;
  text: string;
  style: StyleMap;
  containerStyle: StyleMap;
  gridStyle: StyleMap;
  cellStyle: StyleMap;
  label?: LabelPresentation;
}

export interface TextRenderOutput {
  kind: "text";
  text: string;
  style: StyleMap;
  containerStyle: StyleMap;
  label?: LabelPresentation;
}

export interface SvgGridRenderOutput {
  kind: "svg-grid";
  width: number;
  height: number;
  viewBox: string;
  shape: GridShape;
  gap: number;
  cellSize: number;
  inactiveOpacity: number;
  cells: readonly GridCell[];
  style: StyleMap;
  containerStyle: StyleMap;
  label?: LabelPresentation;
}

export type RenderOutput = TextRenderOutput | SvgGridRenderOutput;

export interface LoaderSnapshot {
  config: EngineResolvedConfig;
  definition: LoaderDefinition;
  frames: readonly string[];
  elapsedMs: number;
  frameIndex: number;
  frame: string;
  finished: boolean;
  renderModel: RenderModel;
}

export interface EffectContext {
  config: EngineResolvedConfig;
  definition: LoaderDefinition;
  frames: readonly string[];
  frameIndex: number;
  elapsedMs: number;
  finished: boolean;
}

export interface EffectPlugin<Name extends string = string, Config = Record<string, unknown>> {
  name: Name;
  order?: number;
  defaultConfig?: Config;
  beforeFrame?(context: EffectContext, config: Config): EffectContext;
  transformFrame?(frame: string, context: EffectContext, config: Config): string;
  decorateRender?(model: RenderModel, context: EffectContext, config: Config): RenderModel;
}

export interface LoaderEngine {
  config: EngineResolvedConfig;
  definition: LoaderDefinition;
  frames: readonly string[];
  getSnapshot(elapsedMs?: number): LoaderSnapshot;
}

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors?: string[];
}
