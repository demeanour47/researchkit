/**
 * The part of a research project that the shared draft does not hold: what kind of
 * document it is for, the student's own notes for stages without a tool, which stages
 * they have confirmed, and the text of each document section. Pure data and rules; where
 * it is kept is the workspace's concern. Nothing here is ever sent anywhere.
 */

export const PROJECT_TYPES = ["proposal", "paper", "thesis"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const CITATION_STYLE_IDS = ["apa", "mla", "chicago", "harvard", "ieee"] as const;
export type CitationStyleId = (typeof CITATION_STYLE_IDS)[number];

export const STAGE_IDS = [
  "interest", "topic", "keywords", "literature", "gap", "problem", "questions", "objectives", "hypothesis", "approach", "design",
  "framework", "variables", "measurement", "data-collection", "population", "sampling", "sample-size", "analysis", "ethics",
  "structure", "writing", "references", "final-review", "final-output",
] as const;
export type JourneyStageId = (typeof STAGE_IDS)[number];

/** Stages whose artifact is a note the student writes in the journey itself. */
export const NOTE_STAGES = ["keywords", "literature", "data-collection", "ethics"] as const satisfies readonly JourneyStageId[];
export type NoteStageId = (typeof NOTE_STAGES)[number];

/** Stages the student confirms themselves, because no tool field can show they are done. */
export const CONFIRM_STAGES = ["structure", "final-review"] as const satisfies readonly JourneyStageId[];
export type ConfirmStageId = (typeof CONFIRM_STAGES)[number];

export const SECTION_STATUSES = ["not-started", "in-progress", "draft-complete", "needs-review", "complete"] as const;
export type SectionStatus = (typeof SECTION_STATUSES)[number];

export const SECTION_STATUS_LABELS: Readonly<Record<SectionStatus, string>> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  "draft-complete": "Draft complete",
  "needs-review": "Needs review",
  complete: "Complete",
};

export const LIMITS = { short: 300, note: 5000, section: 60_000, sections: 40 } as const;

export interface ProjectProfile {
  type: ProjectType;
  /** What the student is interested in, before there is a topic. */
  interest?: string;
  level?: string;
  discipline?: string;
  /** Requirements the institution has set, in the student's words. */
  institution?: string;
  citationStyle?: CitationStyleId;
}

export interface SectionState {
  status: SectionStatus;
  text: string;
}

export interface ProjectState {
  profile: ProjectProfile;
  notes: Partial<Record<NoteStageId, string>>;
  confirmed: ConfirmStageId[];
  sections: Record<string, SectionState>;
}

export const isProjectType = (value: unknown): value is ProjectType => PROJECT_TYPES.includes(value as ProjectType);
export const isStageId = (value: unknown): value is JourneyStageId => STAGE_IDS.includes(value as JourneyStageId);
export const isNoteStage = (value: unknown): value is NoteStageId => NOTE_STAGES.includes(value as NoteStageId);
export const isConfirmStage = (value: unknown): value is ConfirmStageId => CONFIRM_STAGES.includes(value as ConfirmStageId);

const cleanLine = (value: string, max: number = LIMITS.short) => value.replace(/\s+/g, " ").trim().slice(0, max);

export function createProjectState(type: ProjectType, details: Partial<Omit<ProjectProfile, "type">> = {}): ProjectState {
  return { profile: cleanProfile({ type, ...details }), notes: {}, confirmed: [], sections: {} };
}

function cleanProfile(profile: ProjectProfile): ProjectProfile {
  const clean: ProjectProfile = { type: profile.type };
  for (const field of ["interest", "level", "discipline", "institution"] as const) {
    const value = profile[field];
    if (typeof value === "string" && cleanLine(value, field === "institution" ? LIMITS.note : LIMITS.short)) {
      clean[field] = cleanLine(value, field === "institution" ? LIMITS.note : LIMITS.short);
    }
  }
  if (profile.citationStyle && CITATION_STYLE_IDS.includes(profile.citationStyle)) clean.citationStyle = profile.citationStyle;
  return clean;
}

export function updateProfile(state: ProjectState, changes: Partial<ProjectProfile>): ProjectState {
  return { ...state, profile: cleanProfile({ ...state.profile, ...changes }) };
}

export function setNote(state: ProjectState, stage: NoteStageId, text: string): ProjectState {
  const value = text.trim().slice(0, LIMITS.note);
  const notes = { ...state.notes };
  if (value) notes[stage] = value;
  else delete notes[stage];
  return { ...state, notes };
}

export function setConfirmed(state: ProjectState, stage: ConfirmStageId, confirmed: boolean): ProjectState {
  const rest = state.confirmed.filter((id) => id !== stage);
  return { ...state, confirmed: confirmed ? [...rest, stage] : rest };
}

const SECTION_ID = /^[a-z0-9-]{1,40}$/;

/** Changes one section. Typing text into a section that hasn't been started marks it in progress. */
export function setSection(state: ProjectState, id: string, changes: Partial<SectionState>): ProjectState {
  if (!SECTION_ID.test(id)) throw new RangeError("That isn't a section id.");
  const before = state.sections[id] ?? { status: "not-started" as SectionStatus, text: "" };
  if (!(id in state.sections) && Object.keys(state.sections).length >= LIMITS.sections) throw new RangeError("There are too many sections.");
  const text = changes.text === undefined ? before.text : changes.text.slice(0, LIMITS.section);
  let status = changes.status && SECTION_STATUSES.includes(changes.status) ? changes.status : before.status;
  if (changes.status === undefined && before.status === "not-started" && text.trim()) status = "in-progress";
  return { ...state, sections: { ...state.sections, [id]: { status, text } } };
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** Reads project state from untrusted data. Unknown keys are dropped; wrong shapes are refused with a reason. */
export function parseProjectState(value: unknown): { ok: true; state: ProjectState } | { ok: false; reason: string } {
  const bad = (reason: string) => ({ ok: false as const, reason: `The research journey can't be read: ${reason}` });
  if (!isRecord(value) || !isRecord(value.profile)) return bad("it has no profile.");
  if (!isProjectType(value.profile.type)) return bad("the project type isn't recognised.");
  const raw = value.profile;
  for (const field of ["interest", "level", "discipline", "institution"]) if (field in raw && typeof raw[field] !== "string") return bad(`${field} should be text.`);
  if ("citationStyle" in raw && !CITATION_STYLE_IDS.includes(raw.citationStyle as CitationStyleId)) return bad("the citation style isn't recognised.");

  let state = createProjectState(raw.type as ProjectType, raw as Partial<ProjectProfile>);
  if ("notes" in value) {
    if (!isRecord(value.notes)) return bad("the notes should be a record.");
    for (const [stage, text] of Object.entries(value.notes)) {
      if (!isNoteStage(stage) || typeof text !== "string") return bad("a note is not recognised.");
      state = setNote(state, stage, text);
    }
  }
  if ("confirmed" in value) {
    if (!Array.isArray(value.confirmed) || !value.confirmed.every(isConfirmStage)) return bad("a confirmed stage is not recognised.");
    for (const stage of value.confirmed) state = setConfirmed(state, stage, true);
  }
  if ("sections" in value) {
    if (!isRecord(value.sections)) return bad("the sections should be a record.");
    for (const [id, section] of Object.entries(value.sections)) {
      if (!isRecord(section) || typeof section.text !== "string" || !SECTION_STATUSES.includes(section.status as SectionStatus)) return bad(`section ${id} can't be read.`);
      try {
        state = setSection(state, id, { status: section.status as SectionStatus, text: section.text });
      } catch (error) {
        return bad(error instanceof Error ? error.message : "a section is invalid.");
      }
    }
  }
  return { ok: true, state };
}
