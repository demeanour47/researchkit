/**
 * All wording for the Citation Style Finder, in one place so it can move to the
 * content layer without touching logic or layout. Every map is typed against the
 * knowledge module, so a missing label or reason is a type error.
 */

import { styleTitle, type StyleId } from "@/knowledge/citation/styles";
import type {
  Confidence,
  Field,
  FirstStep,
  Reason,
  Region,
  Requirer,
  StyleRecommendation,
  WritingType,
} from "@/knowledge/citation/style-finder";

export const page = {
  title: "Citation Style Finder",
  description:
    "Answer four questions to find the citation style you most likely need, and see exactly why it was recommended.",
  intro:
    "Answer four questions to find the citation style you most likely need. Every recommendation shows its reasoning.",
  formHeading: "Your situation",
  changeHeading: "Change your answers",
  submit: "Find my citation style",
  resultHeading: "Recommendation",
  missingIntro: "To get a recommendation, answer:",
  precedence:
    "The instructions you've been given always take precedence over this recommendation.",
  reviewStatus:
    "This guidance has not yet been checked by a named reviewer.",
  relatedGuide: "Related guide",
  relatedGuides: "Related guides",
  relatedTool: "Related tool",
  relatedTools: "Related tools",
} as const;

export const questions = {
  writing: {
    legend: "What are you writing?",
    options: {
      assignment: "University assignment or essay",
      thesis: "Thesis or dissertation",
      "journal-article": "Journal article",
      book: "Book or book chapter",
      web: "Website or blog content",
    } satisfies Record<WritingType, string>,
  },
  field: {
    legend: "What subject is it in?",
    hint: "Subject conventions are the strongest clue to a style.",
    options: {
      "psychology-social-sciences": "Psychology or social sciences",
      education: "Education",
      "nursing-health": "Nursing or health sciences",
      medicine: "Medicine or biomedical sciences",
      "natural-sciences": "Natural sciences",
      "engineering-computing": "Engineering or computer science",
      "business-economics": "Business or economics",
      history: "History",
      "literature-arts": "Literature, languages or arts",
      law: "Law",
      other: "Other or not sure",
    } satisfies Record<Field, string>,
  },
  requirer: {
    legend: "Who decides the style?",
    options: {
      instructor: "My instructor or lecturer",
      university: "My university or department",
      publisher: "A journal or publisher",
      nobody: "No one: I can choose",
      unknown: "I don't know",
    } satisfies Record<Requirer, string>,
  },
  region: {
    label: "Where are you studying or publishing?",
    optional: "(optional)",
    hint: "This changes the result for law, and where regional practice differs.",
    unspecified: "Not specified",
    options: {
      us: "United States",
      canada: "Canada",
      "uk-ireland": "United Kingdom or Ireland",
      australia: "Australia",
      "new-zealand": "New Zealand",
      europe: "Elsewhere in Europe",
      asia: "Asia",
      africa: "Africa",
      "latin-america": "Latin America",
      other: "Somewhere else",
    } satisfies Record<Region, string>,
  },
} as const;

export const missingLabels = {
  writing: questions.writing.legend,
  field: questions.field.legend,
  requirer: questions.requirer.legend,
} as const;

export const confidenceLabels: Record<Confidence, string> = {
  strong: "Strong match",
  likely: "Likely, but check first",
  open: "Several styles are possible",
};

export const styleSummaries: Record<StyleId, string> = {
  apa: "An author–date style: sources are cited in the text as (Smith, 2020).",
  mla: "An author–page style: sources are cited in the text as (Smith 45).",
  chicago: "Offers footnotes with a bibliography, or an author–date system.",
  harvard: "A family of author–date styles such as (Smith 2020); punctuation varies by institution.",
  ieee: "A numbered style: sources are cited as [1] in the order they first appear.",
  vancouver: "A numbered style used in biomedicine: sources are numbered in order of citation.",
  ama: "A numbered style from the American Medical Association, usually with superscript numbers.",
  acs: "The American Chemical Society's style, with numbered or author–date citations.",
  cse: "The Council of Science Editors' style, with numbered or name–year systems.",
  bluebook: "The standard legal citation system in the United States.",
  oscola: "The standard legal citation system in the United Kingdom, using footnotes.",
  aglc: "The standard legal citation system in Australia, using footnotes.",
  mcgill: "The standard legal citation system in Canada, using footnotes.",
  nzlsg: "The standard legal citation system in New Zealand, using footnotes.",
};

const fieldPhrases: Record<Field, string> = {
  "psychology-social-sciences": "psychology and the social sciences",
  education: "education",
  "nursing-health": "nursing and the health sciences",
  medicine: "medicine and the biomedical sciences",
  "natural-sciences": "the natural sciences",
  "engineering-computing": "engineering and computer science",
  "business-economics": "business and economics",
  history: "history",
  "literature-arts": "literature, languages and the arts",
  law: "law",
  other: "your subject",
};

const regionPhrases: Record<Region, string> = {
  us: "the United States",
  canada: "Canada",
  "uk-ireland": "the United Kingdom and Ireland",
  australia: "Australia",
  "new-zealand": "New Zealand",
  europe: "Europe",
  asia: "Asia",
  africa: "Africa",
  "latin-america": "Latin America",
  other: "your region",
};

const requirerNouns: Record<"instructor" | "university" | "publisher", string> = {
  instructor: "instructor",
  university: "university",
  publisher: "journal or publisher",
};

export function reasonText(reason: Reason): string {
  switch (reason.code) {
    case "field-standard":
      return `${styleTitle(reason.style)} is the standard style in ${fieldPhrases[reason.field]}.`;
    case "field-common":
      return `${styleTitle(reason.style)} is widely used in ${fieldPhrases[reason.field]}, though not universally.`;
    case "field-varies":
      return `Different branches of ${fieldPhrases[reason.field]} use different styles, so no single style can be recommended without knowing more.`;
    case "no-field":
      return "Without a subject area, no single style can be singled out. These are the most widely used general styles.";
    case "law-region":
      return reason.region === "uk-ireland"
        ? `${styleTitle(reason.style)} is the standard legal citation guide in the United Kingdom. Ireland also has its own adaptation, OSCOLA Ireland.`
        : `${styleTitle(reason.style)} is the standard legal citation guide in ${regionPhrases[reason.region]}.`;
    case "law-needs-region":
      return "Legal citation depends on the jurisdiction. Choose where you're studying or publishing to see its standard guide.";
    case "law-local-guide":
      return `Legal citation in ${regionPhrases[reason.region]} varies by country, so check your law school's or court's own guide.`;
    case "region-harvard":
      return `Many universities in ${regionPhrases[reason.region]} use their own version of Harvard referencing across subjects, so it's included as an alternative.`;
    case "journal-decides":
      return "Journals set their own reference style, often a variant of a standard one, in their instructions for authors.";
    case "book-publisher":
      return "Book publishers usually have a house style that decides how references look.";
    case "book-chicago":
      return "The Chicago Manual of Style is widely used in book publishing, so it's included as an alternative.";
    case "thesis-rules":
      return "Universities often publish thesis regulations that specify or restrict the reference style.";
    case "web-no-standard":
      return "Web content rarely requires a formal citation style; clear links to sources are often enough. If you want a formal style, your subject's usual style is a good choice.";
    case "requirer-decides":
      return `Your ${requirerNouns[reason.requirer]} decides the style, so their instructions come first. Subject conventions only help when those instructions don't name a style.`;
    case "free-choice":
      return "You can choose, so this is the style most readers in your subject will expect.";
    case "free-choice-consistent":
      return "You can choose. Pick the style your main sources use, and apply it consistently throughout.";
    case "requirer-unknown":
      return "Most assignments and publications specify a style, so it's worth finding out before you start.";
  }
}

export function firstStepText(step: FirstStep): string {
  switch (step.code) {
    case "check-journal":
      return "Check the journal's instructions for authors. Their reference style overrides any general recommendation.";
    case "check-publisher":
      return "Check your publisher's house style guide. It overrides any general recommendation.";
    case "check-thesis-rules":
      return "Check your university's thesis or dissertation regulations, and confirm with your supervisor.";
    case "check-requirer":
      return step.requirer === "instructor"
        ? "Check your assignment brief or course handbook, or ask your instructor."
        : "Check your university's or department's referencing guide.";
    case "find-out":
      return "Look for a named style in your assignment brief, course handbook or submission guidelines. If none is named, ask.";
  }
}

/** A one-sentence summary announced to screen readers when a result appears. */
export function statusText(recommendation: StyleRecommendation): string {
  const confidence = confidenceLabels[recommendation.confidence];
  return recommendation.primary
    ? `Recommendation: ${styleTitle(recommendation.primary)}. ${confidence}.`
    : `${resultLabels.noSingleStyle}. ${confidence}.`;
}

export const resultLabels = {
  firstStep: "Before you rely on this:",
  noSingleStyle: "No single style fits your situation",
  consider: "Styles to consider",
  alternatives: "Also possible",
  why: "Why this recommendation",
  definedBy: "Defined by:",
  styleLink: (name: string) => `More about ${name}`,
} as const;
