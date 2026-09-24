/**
 * The geometry and state of the research onion diagram: six concentric rings, the
 * outer layer first. Kept apart from the component so it can be tested.
 */

import { LAYERS, findOption } from "../../knowledge/research";
import type { LayerId, OnionSelection } from "../../knowledge/research";

export type RingState = "current" | "chosen" | "open";

export interface Ring {
  layer: LayerId;
  number: number;
  name: string;
  /** Outer radius of the ring. */
  radius: number;
  /** Where the ring's number sits, measured down from the top of the diagram. */
  labelY: number;
  state: RingState;
  /** The option chosen for this layer, if any. */
  chosen: string | null;
}

/** The diagram's width and height, in SVG units. */
export const DIAGRAM_SIZE = 240;

/**
 * The rings for a selection. `current` is the index of the layer on screen, or a
 * number past the last layer when no layer is (such as on the summary).
 */
export function onionRings(selection: OnionSelection, current: number): Ring[] {
  const step = DIAGRAM_SIZE / 2 / LAYERS.length;
  return LAYERS.map((layer, index) => {
    const radius = DIAGRAM_SIZE / 2 - index * step;
    const id = selection[layer.id];
    const chosen = id ? (findOption(id)?.name ?? null) : null;
    return {
      layer: layer.id,
      number: layer.number,
      name: layer.name,
      radius,
      labelY: DIAGRAM_SIZE / 2 - radius + step / 2,
      state: index === current ? "current" : chosen ? "chosen" : "open",
      chosen,
    };
  });
}
