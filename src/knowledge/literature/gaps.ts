/**
 * Research gaps, in two kinds.
 * - Stated gaps: what the studies themselves name as gaps, limitations or future work.
 *   Statements from different studies that share their key words are grouped, so a
 *   gap several authors name stands out.
 * - Potential gaps: what the matrix as a whole suggests is missing, such as designs,
 *   settings or variables no study covers. These are prompts to check against the wider
 *   literature, never conclusions; each gives its evidence and reasoning.
 */

import { listItems, studyLabel } from "./matrix";
import { coveredVariables, isEmptyLens, mentions, type ProjectLens } from "./project";
import { detectPatterns, MIN_STUDIES_FOR_PATTERNS, type PatternGroup } from "./patterns";
import { fold, leadingNumber } from "./query";
import { isProbabilitySampling, matchConcepts } from "./vocab";
import type { Matrix, MatrixField, Study } from "./types";

// Stated gaps.

const STOPWORDS = new Set(
  "a about above after again all also an and any are as at be because been being between both but by can could did do does doing during each few for from further had has have having how however if in into is it its itself may might more most must no nor not of on once only or other our out over own same should so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who why will with would future research researchers study studies studied finding findings result results limitation limitations recommend recommended recommendation recommendations need needed needs suggest suggests suggested further gap gaps authors author paper work use used using one two three new also well".split(
    " ",
  ),
);

/** The content words of a statement: folded, without common words, plurals reduced. */
export function contentWords(text: string): Set<string> {
  const words = fold(text)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .map((word) => (word.length > 4 && word.endsWith("s") && !/(ss|is|us)$/.test(word) ? word.slice(0, -1) : word));
  return new Set(words);
}

/** Statements split at sentence ends, semicolons and line breaks. */
export const statements = (text: string) =>
  text
    .replace(/([.!?])\s+/g, "$1\n")
    .split(/[;\n]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

const GAP_FIELDS: readonly MatrixField[] = ["gap", "limitations", "recommendations"];

export interface StatedGap {
  /** The key words the grouped statements share, most common first. */
  words: string[];
  /** Each study's statement, with the column it came from. */
  statements: { studyId: string; field: MatrixField; text: string }[];
  studies: string[];
  explanation: string;
}

/** Two statements say much the same when they share two key words and at least half of the shorter's key words. */
export function similarStatements(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  const shared = [...a].filter((word) => b.has(word)).length;
  return shared >= 2 && shared / Math.min(a.size, b.size) >= 0.5;
}

/** Gaps, limitations and recommendations that two or more studies name in similar words. */
export function statedGaps(matrix: Matrix): StatedGap[] {
  const entries = matrix.flatMap((study) => GAP_FIELDS.flatMap((field) => statements(study.fields[field]).map((text) => ({ studyId: study.id, field, text, words: contentWords(text) })))).filter((entry) => entry.words.size >= 2);
  // Group statements from different studies by linking every similar pair (union–find).
  const parent = entries.map((_, index) => index);
  const root = (index: number): number => (parent[index] === index ? index : (parent[index] = root(parent[index])));
  entries.forEach((a, i) =>
    entries.forEach((b, j) => {
      if (j > i && a.studyId !== b.studyId && similarStatements(a.words, b.words)) parent[root(j)] = root(i);
    }),
  );
  const groups = new Map<number, typeof entries>();
  entries.forEach((entry, index) => groups.set(root(index), [...(groups.get(root(index)) ?? []), entry]));
  return [...groups.values()]
    .map((members) => {
      const studies = [...new Set(members.map((member) => member.studyId))];
      const counts = new Map<string, Set<string>>();
      for (const member of members) for (const word of member.words) counts.set(word, (counts.get(word) ?? new Set()).add(member.studyId));
      const words = [...counts.entries()]
        .filter(([, ids]) => ids.size >= 2)
        .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))
        .slice(0, 4)
        .map(([word]) => word);
      return {
        words,
        statements: members.map(({ studyId, field, text }) => ({ studyId, field, text })),
        studies,
        explanation: `${studies.length} studies name this in similar words. A gap or limitation that recurs across studies usually reflects a constraint of the field's usual methods or settings, not of one study, so addressing it is a recognised contribution.`,
      };
    })
    .filter((gap) => gap.studies.length >= 2)
    .sort((a, b) => b.studies.length - a.studies.length);
}

// Potential gaps.

export const GAP_KINDS = ["methodological", "contextual", "sampling", "theoretical", "variable", "temporal"] as const;
export type GapKind = (typeof GAP_KINDS)[number];
export const GAP_KIND_LABELS: Readonly<Record<GapKind, string>> = {
  methodological: "Methodological gap",
  contextual: "Contextual gap",
  sampling: "Sampling gap",
  theoretical: "Theoretical gap",
  variable: "Variable gap",
  temporal: "Recency gap",
};

export interface PotentialGap {
  kind: GapKind;
  title: string;
  /** The numbers behind it. */
  evidence: string;
  /** Why this may be a gap, and what would address it. */
  explanation: string;
  studies: string[];
}

/** Thresholds for potential gaps. They are judgement calls, stated so the reasoning can be checked. */
export const GAP_THRESHOLDS = {
  /** A design, setting or technique used by this share of studies dominates. */
  dominant: 0.6,
  /** A median sample below this is small for most statistical analyses. */
  smallSample: 100,
  /** No study within this many years suggests the evidence may be dated. */
  recentYears: 5,
  /** Mechanisms are rarely tested when fewer than this share of studies test a mediator or moderator. */
  mechanisms: 0.2,
} as const;

const percent = (share: number) => `${Math.round(share * 100)}%`;
const groupOf = (groups: readonly PatternGroup[], id: PatternGroup["id"]) => groups.find((group) => group.id === id)!;
const QUALITATIVE = /qualitativ|interview|phenomenolog|ethnograph|grounded theory|thematic|narrative|case stud/;

const DESIGN_ALTERNATIVES: Readonly<Record<string, string>> = {
  "cross-sectional": "longitudinal or experimental designs, which can show change over time and cause and effect",
  survey: "experimental, longitudinal or qualitative designs",
  correlational: "experimental or longitudinal designs, which can support causal claims",
  experimental: "field or longitudinal studies, which test whether effects hold outside controlled settings",
  "case-study": "larger comparative or quantitative studies, which test how far findings generalise",
};

export function potentialGaps(matrix: Matrix, lens: ProjectLens | null, currentYear: number): PotentialGap[] {
  if (matrix.length < MIN_STUDIES_FOR_PATTERNS) return [];
  const gaps: PotentialGap[] = [];
  const { groups } = detectPatterns(matrix);
  const add = (gap: PotentialGap) => gaps.push(gap);

  // Designs: one design dominating.
  const designs = groupOf(groups, "designs");
  const topDesign = designs.items[0];
  if (designs.reported >= MIN_STUDIES_FOR_PATTERNS && topDesign && topDesign.share >= GAP_THRESHOLDS.dominant) {
    const id = topDesign.key.replace(/^design:/, "");
    add({
      kind: "methodological",
      title: `Most studies use a ${topDesign.label.toLowerCase()} design`,
      evidence: `${topDesign.count} of ${designs.reported} studies that report a design (${percent(topDesign.share)}).`,
      explanation: `When one design dominates, what it can't show is left untested. Consider ${DESIGN_ALTERNATIVES[id] ?? "designs the reviewed studies haven't used"}.`,
      studies: topDesign.studies,
    });
  }

  // Approach: all quantitative, or all qualitative.
  const approaches = groupOf(groups, "approaches");
  const quantitative = approaches.items.filter((item) => /quantitative|deductive/.test(item.key)).flatMap((item) => item.studies);
  const qualitative = approaches.items.filter((item) => /qualitative|inductive/.test(item.key)).flatMap((item) => item.studies);
  if (approaches.reported >= MIN_STUDIES_FOR_PATTERNS && new Set(qualitative).size === 0 && new Set(quantitative).size / approaches.reported >= GAP_THRESHOLDS.dominant)
    add({
      kind: "methodological",
      title: "Few qualitative or mixed-methods studies",
      evidence: `${new Set(quantitative).size} of ${approaches.reported} studies that state an approach are quantitative or deductive; none is qualitative.`,
      explanation: "Quantitative studies show how much and how often; qualitative studies explain how and why. A qualitative or mixed-methods study could explain the mechanisms behind the relationships these studies measure.",
      studies: [...new Set(quantitative)],
    });
  else if (approaches.reported >= MIN_STUDIES_FOR_PATTERNS && new Set(quantitative).size === 0 && new Set(qualitative).size / approaches.reported >= GAP_THRESHOLDS.dominant)
    add({
      kind: "methodological",
      title: "Few quantitative studies",
      evidence: `${new Set(qualitative).size} of ${approaches.reported} studies that state an approach are qualitative or inductive; none is quantitative.`,
      explanation: "Qualitative studies build understanding in depth; a quantitative study could test how far their insights hold in a larger sample.",
      studies: [...new Set(qualitative)],
    });

  // Sampling: mostly non-probability.
  const sampling = groupOf(groups, "sampling");
  if (sampling.reported >= MIN_STUDIES_FOR_PATTERNS) {
    const nonProbability = new Set(sampling.items.filter((item) => item.key.startsWith("sampling:") && !isProbabilitySampling(item.key.slice("sampling:".length)) && !/random|probabilit/.test(item.key)).flatMap((item) => item.studies));
    const share = nonProbability.size / sampling.reported;
    if (share >= GAP_THRESHOLDS.dominant)
      add({
        kind: "sampling",
        title: "Mostly non-probability samples",
        evidence: `${nonProbability.size} of ${sampling.reported} studies that report sampling (${percent(share)}) use a non-probability technique.`,
        explanation: "Non-probability samples are practical but limit how far findings generalise to a population. A study with a probability sample could test whether the findings hold more widely.",
        studies: [...nonProbability],
      });
  }

  // Sample sizes: small, for quantitative studies.
  const sized = matrix
    .filter((study) => !QUALITATIVE.test(fold([study.fields.approach, study.fields.design, study.fields.analysis].join(" "))))
    .map((study) => ({ study, size: leadingNumber(study.fields.sampleSize) }))
    .filter((entry): entry is { study: Study; size: number } => entry.size !== null);
  if (sized.length >= MIN_STUDIES_FOR_PATTERNS) {
    const sorted = sized.map((entry) => entry.size).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    if (median < GAP_THRESHOLDS.smallSample)
      add({
        kind: "sampling",
        title: "Small samples",
        evidence: `The median sample of the ${sized.length} quantitative studies with a sample size is ${median}.`,
        explanation: "Small samples have little power to detect modest effects, so non-significant results may be inconclusive. A larger sample could test the relationships more precisely.",
        studies: sized.filter((entry) => entry.size < GAP_THRESHOLDS.smallSample).map((entry) => entry.study.id),
      });
  }

  // Settings: concentrated in one or two countries.
  const countries = groupOf(groups, "countries");
  const topCountry = countries.items[0];
  if (countries.reported >= MIN_STUDIES_FOR_PATTERNS && topCountry && (topCountry.share >= GAP_THRESHOLDS.dominant || countries.items.length <= 2))
    add({
      kind: "contextual",
      title: countries.items.length <= 2 ? `Studies come from ${countries.items.length === 1 ? "one country" : "two countries"}` : `Studies concentrate in ${topCountry.label}`,
      evidence: `${topCountry.count} of ${countries.reported} studies that name a setting are from ${topCountry.label}${countries.items.length > 1 ? `; ${countries.items.length} countries in all` : ""}.`,
      explanation: "Culture, institutions and policy can change how variables relate. A study in an under-represented setting could test whether the findings transfer.",
      studies: topCountry.studies,
    });

  // Recency: nothing recent.
  const years = matrix.map((study) => leadingNumber(study.fields.year)).filter((year): year is number => year !== null);
  if (years.length >= MIN_STUDIES_FOR_PATTERNS) {
    const newest = Math.max(...years);
    if (currentYear - newest >= GAP_THRESHOLDS.recentYears)
      add({
        kind: "temporal",
        title: `No study since ${newest}`,
        evidence: `The newest study in the matrix is from ${newest}, ${currentYear - newest} years ago.`,
        explanation: "Technology, policy and behaviour change; findings may need updating. Search for recent studies before concluding that this is a gap.",
        studies: matrix.filter((study) => leadingNumber(study.fields.year) === newest).map((study) => study.id),
      });
  }

  // Theory: rarely named, or one theory dominating.
  const theories = groupOf(groups, "theories");
  if (matrix.length >= MIN_STUDIES_FOR_PATTERNS && theories.reported / matrix.length < 0.5)
    add({
      kind: "theoretical",
      title: "Little theoretical grounding",
      evidence: `${theories.reported} of ${matrix.length} studies name a theory or framework.`,
      explanation: "Without theory, findings are hard to explain or build on. Grounding a study in theory, and testing what it predicts, would strengthen its contribution.",
      studies: matrix.filter((study) => !theories.items.some((item) => item.studies.includes(study.id))).map((study) => study.id),
    });
  else if (theories.items[0] && theories.reported >= MIN_STUDIES_FOR_PATTERNS && theories.items[0].share >= 0.7)
    add({
      kind: "theoretical",
      title: `One theory dominates: ${theories.items[0].label}`,
      evidence: `${theories.items[0].count} of ${theories.reported} studies that name a theory use it.`,
      explanation: "A single lens can leave other explanations untested. An alternative or complementary theory might explain what this one doesn't.",
      studies: theories.items[0].studies,
    });

  // Mechanisms: mediators and moderators rarely tested.
  const relational = matrix.filter((study) => study.fields.independent && study.fields.dependent);
  if (relational.length >= MIN_STUDIES_FOR_PATTERNS) {
    const tested = relational.filter((study) => study.fields.mediator || study.fields.moderator);
    if (tested.length / relational.length < GAP_THRESHOLDS.mechanisms)
      add({
        kind: "variable",
        title: "Mediators and moderators are rarely tested",
        evidence: `${tested.length} of ${relational.length} studies that test relationships include a mediator or moderator.`,
        explanation: "Direct relationships show that variables are linked, not how or when. Testing a mediator (how) or moderator (for whom, when) would explain the relationships these studies report.",
        studies: relational.filter((study) => !tested.includes(study)).map((study) => study.id),
      });
  }

  // The project's own variables.
  if (lens && !isEmptyLens(lens)) {
    for (const variable of lens.variables)
      if (!matrix.some((study) => mentions(study, variable.name)))
        add({
          kind: "variable",
          title: `No study examines ${variable.name}`,
          evidence: `None of the ${matrix.length} studies names ${variable.name}, one of your project's variables.`,
          explanation: "Either the matrix doesn't yet include the studies that do, or this is a genuine gap your project addresses. Search for it specifically before claiming the gap.",
          studies: [],
        });
    const causes = lens.variables.filter((variable) => variable.kind === "independent");
    const effects = lens.variables.filter((variable) => variable.kind === "dependent");
    for (const cause of causes)
      for (const effect of effects) {
        const together = matrix.filter((study) => mentions(study, cause.name) && mentions(study, effect.name));
        const eachAlone = matrix.some((study) => mentions(study, cause.name)) && matrix.some((study) => mentions(study, effect.name));
        if (together.length === 0 && eachAlone)
          add({
            kind: "variable",
            title: `No study links ${cause.name} with ${effect.name}`,
            evidence: `Both variables appear in the matrix, but never in the same study.`,
            explanation: "Your project's relationship hasn't been tested in the studies reviewed so far. If a wider search confirms it, this is the gap your study fills.",
            studies: [],
          });
      }
  }
  return gaps;
}

/** How each study relates to the project's variables, for the matrix view. */
export const projectCoverage = (matrix: Matrix, lens: ProjectLens) => matrix.map((study) => ({ studyId: study.id, label: studyLabel(study), variables: coveredVariables(study, lens) }));

/** Items of a list column across the matrix, for tests and summaries. */
export const allItems = (matrix: Matrix, field: MatrixField) => matrix.flatMap((study) => listItems(study.fields[field]));

/** Every design each study names, matched to the catalogue. */
export const designsOf = (study: Study) => listItems(study.fields.design).flatMap((item) => matchConcepts("design", item).map((concept) => concept.id));
