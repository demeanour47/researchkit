/**
 * Common academic title patterns. A title can follow several at once, such as a
 * relationship study that also names its method (“… : A Mixed-Methods Study”).
 * Recognising the pattern shows what the title promises, and so which elements it
 * needs and which designs can keep that promise.
 */

import { normalise } from "../question-text";

export const TITLE_PATTERN_IDS = [
  "relationship",
  "correlational",
  "comparative",
  "impact",
  "effect",
  "factors",
  "descriptive",
  "exploratory",
  "phenomenological",
  "case-study",
  "experimental",
  "mixed-methods",
  "qualitative",
  "quantitative",
] as const;

export type TitlePatternId = (typeof TITLE_PATTERN_IDS)[number];

/** What a title of this pattern needs to name. */
export type TitleElement = "independent" | "dependent" | "population";

export interface TitlePattern {
  id: TitlePatternId;
  name: string;
  /** Recognising wordings, tried on the title in lower case. */
  wordings: readonly RegExp[];
  /** What the pattern says the study does. */
  explanation: string;
  /** The approach the pattern usually belongs to. */
  approach: "quantitative" | "qualitative" | "mixed" | "either";
  /** Whether the wording claims cause and effect. */
  causal: boolean;
  /** Whether the pattern names the research method itself, rather than what is studied. */
  method: boolean;
  needs: readonly TitleElement[];
  references: readonly string[];
}

const re = (source: string) => new RegExp(source, "i");

export const TITLE_PATTERNS: readonly TitlePattern[] = [
  {
    id: "relationship",
    name: "Relationship study",
    wordings: [re("\\b(?:relationships?|associations?|links?) (?:between|of)\\b"), re("\\bassociated with\\b")],
    explanation:
      "The title promises to examine how two or more variables go together. It needs to name both variables and who is studied. It makes no claim that one causes the other.",
    approach: "quantitative",
    causal: false,
    method: false,
    needs: ["independent", "dependent", "population"],
    references: ["creswell-creswell-2018", "sekaran-bougie-2013"],
  },
  {
    id: "correlational",
    name: "Correlational study",
    wordings: [re("\\bcorrelat(?:ion|ions|ional|es|ed)\\b")],
    explanation:
      "The title promises to measure how strongly variables vary together. Correlation shows association, not cause, so the title should not also claim an effect.",
    approach: "quantitative",
    causal: false,
    method: true,
    needs: ["independent", "dependent", "population"],
    references: ["creswell-creswell-2018"],
  },
  {
    id: "comparative",
    name: "Comparative study",
    wordings: [re("\\bcompar(?:ison|isons|ative|ing)\\b"), re("\\b(?:versus|vs\\.?)\\s"), re("\\bdifferences? (?:in|between)\\b")],
    explanation:
      "The title promises to compare groups, places or times on the same outcome. It needs to name what is compared and the outcome it is compared on.",
    approach: "either",
    causal: false,
    method: false,
    needs: ["independent", "dependent", "population"],
    references: ["bryman-2016"],
  },
  {
    id: "impact",
    name: "Impact study",
    wordings: [re("\\bimpacts? (?:of|on)\\b"), re("\\binfluences? of\\b")],
    explanation:
      "“Impact” and “influence” claim that one thing changes another. The title needs to name the cause and the outcome, and the design needs to be able to support a causal claim.",
    approach: "quantitative",
    causal: true,
    method: false,
    needs: ["independent", "dependent", "population"],
    references: ["saunders-2019", "creswell-creswell-2018"],
  },
  {
    id: "effect",
    name: "Effect study",
    wordings: [re("\\beffects? of\\b"), re("\\beffectiveness of\\b")],
    explanation:
      "“Effect of … on …” claims cause and effect. It suits experimental and quasi-experimental designs, which change the independent variable and measure the outcome.",
    approach: "quantitative",
    causal: true,
    method: false,
    needs: ["independent", "dependent", "population"],
    references: ["shadish-2002", "creswell-creswell-2018"],
  },
  {
    id: "factors",
    name: "Factors study",
    wordings: [re("\\b(?:factors|determinants|predictors) (?:affecting|influencing|associated|of|that|behind)\\b")],
    explanation:
      "The title promises to identify what goes with, or predicts, one outcome. It needs to name the outcome and who is studied; the factors themselves are what the study finds.",
    approach: "quantitative",
    causal: false,
    method: false,
    needs: ["dependent", "population"],
    references: ["sekaran-bougie-2013"],
  },
  {
    id: "descriptive",
    name: "Descriptive study",
    wordings: [
      re("\\b(?:prevalence|levels?|status|extent|patterns?|profile|characteristics|practices|awareness|knowledge|attitudes?) (?:of|about|towards|regarding|among)\\b"),
      re("\\bdescriptive\\b"),
      re("\\bassessment of\\b"),
    ],
    explanation:
      "The title promises to describe what something is like, such as how common or how high it is, without testing what causes it. It needs to name what is described and who.",
    approach: "either",
    causal: false,
    method: false,
    needs: ["dependent", "population"],
    references: ["kothari-2004", "saunders-2019"],
  },
  {
    id: "exploratory",
    name: "Exploratory study",
    wordings: [re("\\bexplor(?:e|es|ing|ation|atory)\\b"), re("\\bperceptions? of\\b"), re("\\bperspectives? (?:of|on)\\b"), re("\\bunderstanding\\b")],
    explanation:
      "The title promises to investigate something not yet well understood, usually in its participants' own terms. It needs to name the phenomenon and who is studied, rather than variables to test.",
    approach: "qualitative",
    causal: false,
    method: false,
    needs: ["population"],
    references: ["saunders-2019", "punch-2005"],
  },
  {
    id: "phenomenological",
    name: "Phenomenological study",
    wordings: [re("\\blived experiences?\\b"), re("\\bphenomenolog"), re("\\bexperiences? of\\b")],
    explanation:
      "The title promises to describe how participants experience something. It needs to name the experience and who has it; variables and effects don't belong in this kind of title.",
    approach: "qualitative",
    causal: false,
    method: false,
    needs: ["population"],
    references: ["van-manen-1990", "smith-2009"],
  },
  {
    id: "case-study",
    name: "Case study",
    wordings: [re("\\bcase stud(?:y|ies)\\b"), re("\\bthe case of\\b")],
    explanation:
      "The title promises an in-depth study of one or a few bounded cases, such as an organisation or a programme. It needs to name the case so readers know what it is bounded by.",
    approach: "either",
    causal: false,
    method: true,
    needs: ["population"],
    references: ["yin-2018", "stake-1995"],
  },
  {
    id: "experimental",
    name: "Experimental study",
    wordings: [re("\\b(?:experiment|experimental|quasi-experimental|randomi[sz]ed|controlled trial)\\b"), re("\\bintervention\\b")],
    explanation:
      "The title promises that the researcher will change something and measure the result. It needs to name the intervention, the outcome and the participants.",
    approach: "quantitative",
    causal: true,
    method: true,
    needs: ["independent", "dependent", "population"],
    references: ["shadish-2002"],
  },
  {
    id: "mixed-methods",
    name: "Mixed-methods study",
    wordings: [re("\\bmixed[- ]methods?\\b")],
    explanation:
      "The title promises to combine quantitative and qualitative data. Naming the method is optional, but when named, the design needs to integrate both kinds of data.",
    approach: "mixed",
    causal: false,
    method: true,
    needs: ["population"],
    references: ["creswell-plano-clark-2018"],
  },
  {
    id: "qualitative",
    name: "Qualitative study",
    wordings: [re("\\bqualitative\\b"), re("\\b(?:interviews?|focus groups?|ethnograph(?:y|ic)|grounded theory|narrative inquiry)\\b")],
    explanation:
      "The title names a qualitative approach: meanings, experiences and processes in words rather than numbers. It needs to name the phenomenon and the participants.",
    approach: "qualitative",
    causal: false,
    method: true,
    needs: ["population"],
    references: ["bryman-2016", "creswell-creswell-2018"],
  },
  {
    id: "quantitative",
    name: "Quantitative study",
    wordings: [re("\\bquantitative\\b"), re("\\bsurvey\\b"), re("\\bcross-sectional\\b"), re("\\blongitudinal\\b")],
    explanation:
      "The title names a quantitative approach: variables measured in numbers and analysed statistically. It needs to name the variables and the population.",
    approach: "quantitative",
    causal: false,
    method: true,
    needs: ["dependent", "population"],
    references: ["bryman-2016", "creswell-creswell-2018"],
  },
];

export function getTitlePattern(id: TitlePatternId): TitlePattern {
  const pattern = TITLE_PATTERNS.find((candidate) => candidate.id === id);
  if (!pattern) throw new RangeError(`Unknown title pattern: ${id}`);
  return pattern;
}

export interface PatternMatch {
  pattern: TitlePattern;
  /** The words in the title that matched, as written. */
  wording: string;
}

/** The main title, before a subtitle introduced by a colon or a spaced dash. */
export const mainTitle = (title: string): string => normalise(title).split(/\s*:\s*|\s+[–—-]\s+/)[0];

/**
 * Two concepts joined by “and”, then who or where: “X and Y among P”. A common way to
 * title a relationship study without the word “relationship”, so it is only used when
 * no other pattern describes the study.
 */
export const IMPLICIT_RELATIONSHIP = re("^(?:the )?(.+?) and (.+?) (?:among|in|of|within|across|at|for)\\b");

/** Every pattern the title follows, in the order of the pattern list. Empty when none is recognised. */
export function classifyTitle(title: string): PatternMatch[] {
  const text = normalise(title);
  const matches = TITLE_PATTERNS.flatMap((pattern) => {
    for (const wording of pattern.wordings) {
      const match = wording.exec(text);
      if (match) return [{ pattern, wording: match[0].trim() }];
    }
    return [];
  });
  if (!matches.some((match) => !match.pattern.method)) {
    const implicit = IMPLICIT_RELATIONSHIP.exec(mainTitle(text));
    if (implicit) matches.unshift({ pattern: getTitlePattern("relationship"), wording: `${implicit[1]} and ${implicit[2]}` });
  }
  return matches;
}

/**
 * The pattern that best describes what the title studies: the first that describes the
 * study itself, or else the first that names a method.
 */
export function primaryPattern(matches: readonly PatternMatch[]): PatternMatch | null {
  return matches.find((match) => !match.pattern.method) ?? matches[0] ?? null;
}
