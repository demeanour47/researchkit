/**
 * Checks a diagram's structure before it is laid out: unique ids, boxes inside the grid
 * and not overlapping, arrows between boxes that exist, bands over real rows, and
 * nothing unreachable. Builders run these on the diagrams they describe.
 */

import type { FlowDiagram } from "./types";

export interface DiagramProblem {
  message: string;
}

export function diagramProblems(diagram: FlowDiagram): DiagramProblem[] {
  const problems: DiagramProblem[] = [];
  const add = (message: string) => problems.push({ message });
  if (diagram.columns < 1 || diagram.rows < 1) add("A diagram needs at least one row and one column.");
  const ids = new Set<string>();
  const occupied = new Map<string, string>();
  for (const node of diagram.nodes) {
    if (ids.has(node.id)) add(`Two boxes share the id “${node.id}”.`);
    ids.add(node.id);
    const span = node.span ?? 1;
    if (span < 1 || !Number.isInteger(span)) add(`Box “${node.id}” has an invalid span of ${span}.`);
    if (node.column < 0 || node.row < 0 || node.column + span > diagram.columns || node.row >= diagram.rows) {
      add(`Box “${node.id}” lies outside the ${diagram.columns} × ${diagram.rows} grid.`);
      continue;
    }
    for (let column = node.column; column < node.column + span; column++) {
      const cell = `${column},${node.row}`;
      const other = occupied.get(cell);
      if (other) add(`Boxes “${other}” and “${node.id}” overlap in row ${node.row + 1}, column ${column + 1}.`);
      else occupied.set(cell, node.id);
    }
    if (node.paragraphs.every((paragraph) => !paragraph.text.trim())) add(`Box “${node.id}” has no text.`);
  }
  const edgeIds = new Set<string>();
  for (const edge of diagram.edges) {
    if (edgeIds.has(edge.id)) add(`Two arrows share the id “${edge.id}”.`);
    edgeIds.add(edge.id);
    if (!ids.has(edge.from) || !ids.has(edge.to)) add(`Arrow “${edge.id}” joins a box that doesn't exist.`);
    if (edge.from === edge.to) add(`Arrow “${edge.id}” points from a box to itself.`);
  }
  for (const band of diagram.bands) if (band.fromRow < 0 || band.toRow >= diagram.rows || band.fromRow > band.toRow) add(`Band “${band.label}” covers rows that don't exist.`);
  if (diagram.columnWeights && (diagram.columnWeights.length !== diagram.columns || diagram.columnWeights.some((weight) => !(weight > 0)))) add("Column widths must be given for every column, each above zero.");
  return problems;
}
