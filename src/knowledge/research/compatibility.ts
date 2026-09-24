/**
 * Judges how well two choices from different layers typically fit, and explains why.
 *
 * - Only layers that meaningfully constrain each other are compared (COMPARED_LAYERS).
 * - The later (inner) option's fit rule decides: listed as strong, listed as possible,
 *   or otherwise "needs careful justification".
 * - No combination is ever described as impossible or forbidden.
 * - Every judgement explains itself, using each option's own description, says how
 *   firmly the literature supports it, and notes any differing view.
 */

import { alternativeViewFor, evidenceFor } from "./evidence";
import { COMPARED_LAYERS, LAYERS, findOption } from "./research-onion";
import type { Fit, Judgement, LayerId, OnionOption, OnionSelection } from "./types";
import { LAYER_ORDER } from "./types";

const capitalise = (text: string) => text.charAt(0).toLocaleUpperCase("en") + text.slice(1);
const layerIndex = (layer: LayerId) => LAYER_ORDER.indexOf(layer);

function fitOf(later: OnionOption, earlier: OnionOption): Fit {
  const rule = later.fits[earlier.layer] ?? {};
  if (rule.strong?.includes(earlier.id)) return "strong";
  if (rule.possible?.includes(earlier.id)) return "possible";
  return "careful";
}

function reasonFor(fit: Fit, later: OnionOption, earlier: OnionOption): string {
  const a = capitalise(later.subject);
  switch (fit) {
    case "strong":
      return `${a} usually ${later.essence}. This fits well with ${earlier.subject}, which generally ${earlier.essence}.`;
    case "possible":
      return `${a} usually ${later.essence}. It can also work with ${earlier.subject}, which generally ${earlier.essence}, if your design shows how the two connect.`;
    case "careful":
      return `${a} usually ${later.essence}, while ${earlier.subject} generally ${earlier.essence}.`;
  }
}

function justificationFor(fit: Fit, later: OnionOption, earlier: OnionOption): string | null {
  switch (fit) {
    case "strong":
      return null;
    case "possible":
      return `Explain how ${later.subject} will work alongside ${earlier.subject} in your study.`;
    case "careful":
      return `Explain why ${later.subject} is appropriate alongside ${earlier.subject}, and how you will address the tension between them.`;
  }
}

/** Whether choices from these two layers are compared with each other. */
export function areCompared(a: LayerId, b: LayerId): boolean {
  return COMPARED_LAYERS[a].includes(b) || COMPARED_LAYERS[b].includes(a);
}

/**
 * The judgement for a pair of options, in either order, or null when their layers
 * aren't compared. Throws for an unknown option id.
 */
export function judge(firstId: string, secondId: string): Judgement | null {
  const first = findOption(firstId);
  const second = findOption(secondId);
  if (!first) throw new RangeError(`Unknown option: ${firstId}`);
  if (!second) throw new RangeError(`Unknown option: ${secondId}`);
  if (first.layer === second.layer || !areCompared(first.layer, second.layer)) return null;

  const [earlier, later] = layerIndex(first.layer) < layerIndex(second.layer) ? [first, second] : [second, first];
  const fit = fitOf(later, earlier);
  return {
    earlier: earlier.id,
    later: later.id,
    fit,
    reason: reasonFor(fit, later, earlier),
    justify: justificationFor(fit, later, earlier),
    evidence: evidenceFor(earlier.id, later.id),
    alternativeView: alternativeViewFor(earlier.id, later.id, fit === "careful"),
  };
}

/**
 * Checks that every chosen id exists and belongs to the layer it was chosen for.
 * Throws a RangeError describing the first problem.
 */
export function validateSelection(selection: OnionSelection): void {
  for (const [layer, id] of Object.entries(selection) as [LayerId, string | undefined][]) {
    if (id === undefined) continue;
    if (!LAYERS.some((candidate) => candidate.id === layer)) throw new RangeError(`Unknown layer: ${layer}`);
    const option = findOption(id);
    if (!option) throw new RangeError(`Unknown option: ${id}`);
    if (option.layer !== layer) throw new RangeError(`${option.name} belongs to the ${option.layer} layer, not ${layer}.`);
  }
}

/** The judgements for one chosen option against the choices made in the layers it is compared with. */
export function judgementsFor(selection: OnionSelection, layer: LayerId): Judgement[] {
  validateSelection(selection);
  const id = selection[layer];
  if (!id) return [];
  return COMPARED_LAYERS[layer]
    .map((earlierLayer) => selection[earlierLayer])
    .filter((earlierId): earlierId is string => earlierId !== undefined)
    .map((earlierId) => judge(id, earlierId))
    .filter((judgement): judgement is Judgement => judgement !== null);
}

/** Every judgement across the whole selection, from the outer layers inwards. */
export function allJudgements(selection: OnionSelection): Judgement[] {
  return LAYER_ORDER.flatMap((layer) => judgementsFor(selection, layer));
}
