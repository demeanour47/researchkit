/**
 * The export engine for diagrams: one call from a diagram to the files every builder
 * offers. SVG and PDF are vector and stay sharp at any size; the PNG size is for 300
 * dots per inch. The writers are the chart builder's, shared rather than repeated.
 */

import { CHART_PNG_DPI, chartFileName, pngPixels, sceneToPdf, sceneToSvg } from "../charts/export";
import type { Scene } from "../charts/scene";
import { layoutDiagram } from "./layout";
import { diagramScene } from "./render";
import type { FlowDiagram, LayoutOptions } from "./types";

export interface RenderedDiagram {
  scene: Scene;
  svg: string;
  /** PNG pixel size at 300 DPI, for the browser to rasterise the SVG. */
  png: { width: number; height: number };
}

/** Lays out and renders a diagram. */
export function renderDiagram(diagram: FlowDiagram, options: LayoutOptions): RenderedDiagram {
  const scene = diagramScene(diagram, layoutDiagram(diagram, options), options);
  return { scene, svg: sceneToSvg(scene), png: pngPixels(scene) };
}

export const diagramPdf = (rendered: RenderedDiagram) => sceneToPdf(rendered.scene);
export const DIAGRAM_PNG_DPI = CHART_PNG_DPI;
export const diagramFileName = chartFileName;
