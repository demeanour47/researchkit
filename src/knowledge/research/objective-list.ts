/**
 * Pure operations on a list of specific objectives. The list is a plain array of
 * text, in the order shown to the researcher: no ids are needed, because every
 * operation works by position.
 */

/** Adds an objective at the end. Blank text is ignored. */
export function addObjective(objectives: readonly string[], text: string): string[] {
  const clean = text.trim();
  return clean ? [...objectives, clean] : [...objectives];
}

/** Replaces the objective at a position. Throws a RangeError for an out-of-range index. */
export function editObjective(objectives: readonly string[], index: number, text: string): string[] {
  at(objectives, index);
  return objectives.map((objective, position) => (position === index ? text : objective));
}

/** Removes the objective at a position. Throws a RangeError for an out-of-range index. */
export function removeObjective(objectives: readonly string[], index: number): string[] {
  at(objectives, index);
  return objectives.filter((_, position) => position !== index);
}

/** Copies the objective at a position, placed directly after it. Throws a RangeError for an out-of-range index. */
export function duplicateObjective(objectives: readonly string[], index: number): string[] {
  const objective = at(objectives, index);
  return [...objectives.slice(0, index + 1), objective, ...objectives.slice(index + 1)];
}

/** Moves the objective at a position to another position. Throws a RangeError for an out-of-range index. */
export function moveObjective(objectives: readonly string[], index: number, toIndex: number): string[] {
  const objective = at(objectives, index);
  const rest = objectives.filter((_, position) => position !== index);
  const target = Math.max(0, Math.min(rest.length, Math.round(toIndex)));
  return [...rest.slice(0, target), objective, ...rest.slice(target)];
}

function at(objectives: readonly string[], index: number): string {
  const objective = objectives[index];
  if (objective === undefined) throw new RangeError(`No objective at index ${index}`);
  return objective;
}
