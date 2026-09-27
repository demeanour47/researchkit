/**
 * Writing one stage's work into the project. A stage changes only the fields it owns,
 * so saving from one tool can never overwrite another tool's work.
 */

import { METHODOLOGIES, updateProjectDraft, type MethodologyId, type ProjectField, type ResearchProjectChanges, type ResearchProjectDraft } from "../research/research-project";
import type { VariableKind } from "../research/variable-types";
import { getModule, type ModuleId } from "./modules";

/** The named lists; extraneous and confounding variables have none. */
const LIST_FOR_KIND: Readonly<Partial<Record<VariableKind, ProjectField>>> = {
  independent: "independentVariables",
  dependent: "dependentVariables",
  moderator: "moderatorVariables",
  mediator: "mediatorVariables",
  control: "controlVariables",
};

/**
 * Keeps the named variable lists in step with the defined variables, so tools that
 * read the lists, such as the Hypothesis Builder, see every variable by its kind.
 */
export function syncVariableLists(draft: ResearchProjectDraft): ResearchProjectDraft {
  if (!draft.variables) return draft;
  const changes: ResearchProjectChanges = {};
  for (const [kind, field] of Object.entries(LIST_FOR_KIND) as [VariableKind, ProjectField][]) {
    (changes as Record<string, readonly string[]>)[field] = draft.variables.filter((variable) => variable.variableType === kind).map((variable) => variable.name);
  }
  return updateProjectDraft(draft, changes);
}

/** The methodology is the research onion's methodological choice, when it is one of the four the tools know. */
function syncMethodology(draft: ResearchProjectDraft): ResearchProjectDraft {
  const choice = draft.researchOnionSelection?.choice;
  const methodology = choice && (METHODOLOGIES as readonly string[]).includes(choice) ? (choice as MethodologyId) : null;
  return updateProjectDraft(draft, { methodology });
}

/** Only the fields a stage owns, from a project a tool has worked on. Fields the tool left empty clear. */
export function ownedChanges(id: ModuleId, source: ResearchProjectDraft): ResearchProjectChanges {
  return Object.fromEntries(getModule(id).owns.map((field) => [field, source[field] ?? null])) as ResearchProjectChanges;
}

/**
 * The project with one stage's fields taken from `source`, a draft a tool has worked
 * on. Every other field is left exactly as it was. Throws a RangeError if the source
 * holds a value the project model rejects.
 */
export function commitModule(draft: ResearchProjectDraft, id: ModuleId, source: ResearchProjectDraft): ResearchProjectDraft {
  let next = updateProjectDraft(draft, ownedChanges(id, source));
  if (id === "variables") next = syncVariableLists(next);
  if (id === "onion") next = syncMethodology(next);
  return next;
}

/** The fields whose values differ between two drafts, among those given. */
export function changedFields(before: ResearchProjectDraft, after: ResearchProjectDraft, fields: readonly ProjectField[]): ProjectField[] {
  return fields.filter((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]));
}
