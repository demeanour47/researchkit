/** Workspace wording, kept together so it can move to the content layer unchanged. */

export const scopeCopy = {
  connected: "Working in your project",
  saved: "Saved to your project",
  untitled: "Untitled project",
  firstSave: (stage: string) => `${stage} saved to your workspace project. Changes you make here are saved as you go.`,
  undo: "Undo this visit's changes",
  undone: "This visit's changes were undone. The tool now shows your project as it was.",
  detach: "Use without the workspace",
  detached: "The tool now works on its own. Nothing you do here is saved to your project.",
  standalone: "Working on its own: nothing here is saved to your workspace project.",
  reconnect: "Use your project again",
  reconnected: "The tool is using your workspace project again.",
  invitation: "Want your work to follow you from tool to tool?",
  invitationLink: "Start a project in your workspace",
} as const;

export const summaryCopy = {
  heading: "From your project",
  intro: "This tool reads your workspace project, so nothing is typed twice. Change these details in their own stages.",
  notStarted: "Not started yet.",
  edit: (stage: string) => `Edit ${stage.toLowerCase()}`,
  start: (stage: string) => `Start ${stage.toLowerCase()}`,
  owned: "The details here belong to this stage, so what you change is saved to your project.",
} as const;

export const dashboardCopy = {
  noScript: {
    heading: "The workspace needs JavaScript",
    text: "Your project is kept in your browser, which needs JavaScript to read and save. Every stage below links to its tool, and each tool works on its own.",
  },
  asideLabel: "Project checks and file",
  start: {
    heading: "Start a research project",
    intro: "Give it a working title. You can change it at any time.",
    titleLabel: "Working title",
    titleHint: "Such as “Screen time and sleep quality in first-year students”.",
    action: "Start project",
    started: (title: string) => `Project “${title}” started. Its stages are listed below.`,
    storage: "Your project is saved in this browser only. It never leaves your device, and no account is needed.",
  },
  unreadable: {
    heading: "Your saved project can't be opened",
    intro: "Something stored in this browser isn't a project ResearchKit can read, so nothing has been changed.",
    action: "Delete it and start again",
  },
  unavailable: {
    heading: "This browser isn't allowing the workspace",
    text: "Saving is blocked, which some private windows and privacy settings do. Every tool still works on its own; your work just isn't kept between pages.",
  },
  overview: {
    progressLabel: "Project completion",
    complete: (completed: number, total: number) => `${completed} of ${total} stages complete`,
    review: (count: number) => (count === 1 ? "1 stage needs review" : `${count} stages need review`),
    untitled: "Untitled project",
    resume: (stage: string) => `Continue with ${stage.toLowerCase()}`,
    resumeHint: "Resume where you left off",
    allDone: "Every stage is complete. Keep your project up to date as it changes.",
    lastEdited: (when: string) => `Last edited ${when}`,
  },
  timeline: {
    heading: "Project stages",
    intro: "Work through them in order, or start wherever you are. Each stage is done in its own tool, and the next one reads what you saved.",
    open: (stage: string) => `Open ${stage.toLowerCase()}`,
    edit: (stage: string) => `Edit ${stage.toLowerCase()}`,
    stillNeeds: "Still needs",
    review: "Why review",
    notNeeded: "Not part of a qualitative project.",
    here: "Edited on this page",
  },
  checks: {
    heading: "Project checks",
    intro: "Gaps and contradictions between stages, which no single tool can see.",
    none: "No problems found between your stages.",
    problem: "Problem",
    suggestion: "Suggestion",
    fix: (stage: string) => `Go to ${stage.toLowerCase()}`,
  },
  recent: {
    heading: "Recently edited",
    none: "Nothing edited yet. Start with any stage.",
  },
  editors: {
    saved: "Saved in this browser as you type.",
    researchProblem: "Research problem",
    researchProblemHint: "What isn't working, or isn't understood, and for whom.",
    background: "Background",
    backgroundHint: "What is already known: the context the problem sits in.",
    researchGap: "Research gap",
    researchGapHint: "What earlier work hasn't done, which your project will.",
    researchAim: "General objective",
    researchAimHint: "One sentence your specific objectives work towards together, such as “To examine how screen use relates to students' sleep”.",
    researchObjectives: "Specific objectives",
    researchObjectivesHint: "One per line. Each should be something you can show you did.",
    references: "References",
    referencesHint: "One per line, in any style for now. Format them with the APA Citation Generator when you write up.",
  },
  actions: {
    heading: "Your project file",
    intro: "Your project lives in this browser. Save a copy to move it to another device or keep a backup.",
    export: "Download project file",
    exported: "Project file downloaded.",
    import: "Open a project file",
    importHint: "A .json file downloaded from a ResearchKit workspace.",
    replaceWarning: "Opening a file replaces the project in this browser. Download a copy first if you want to keep it.",
    imported: "Project opened from the file.",
    delete: "Delete project",
    confirmDelete: "Delete this project from this browser? This can't be undone.",
    confirm: "Yes, delete it",
    cancel: "Keep it",
    deleted: "Project deleted.",
  },
} as const;

/** “just now”, “5 minutes ago”, “yesterday”: how long ago a time was, in words. */
export function timeAgo(then: number, now: number): string {
  // A time a little after “now” is from the minute in progress, which the page rounds down.
  const seconds = Math.min(0, Math.round((then - now) / 1000));
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31_536_000], ["month", 2_592_000], ["week", 604_800], ["day", 86_400], ["hour", 3_600], ["minute", 60]];
  if (Math.abs(seconds) < 45) return "just now";
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  return format.format(Math.round(seconds / 60), "minute");
}
