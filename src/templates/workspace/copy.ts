/** Workspace page wording, kept together so it can move to the content layer unchanged. */
export const workspacePage = {
  title: "Research Workspace",
  eyebrow: "Workspace",
  metaDescription:
    "Plan a whole research project in one place: problem, question, objectives, hypotheses, variables, framework, design, sampling, questionnaire and analysis, with progress and checks between stages. Free, private and saved only in your browser.",
  intro:
    "One project that every research tool reads from and adds to. Work through each stage, see what is complete and what needs another look, and never type the same thing twice.",
  points: [
    { icon: "lock", text: "Saved in this browser only. Nothing is sent anywhere, and no account is needed." },
    { icon: "workflow", text: "Each tool saves only its own stage, so tools never overwrite each other." },
    { icon: "shield-check", text: "Checks between stages show gaps and contradictions no single tool can see." },
  ],
} as const;
