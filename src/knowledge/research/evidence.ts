/**
 * How firmly the literature supports each fit judgement, and where researchers
 * disagree. Keys are "earlierId/laterId". A judgement not listed here is an
 * interpretive judgement: ResearchKit's reading of the general principles.
 *
 * Levels are assigned conservatively: "textbook" only where several major methods
 * textbooks present the combination the same way.
 */

import type { AlternativeView, Evidence } from "./types";

const textbook = (...sources: string[]): Evidence => ({ level: "textbook", sources });
const guidance = (...sources: string[]): Evidence => ({ level: "guidance", sources });

export const INTERPRETIVE: Evidence = { level: "interpretive", sources: [] };

export const EVIDENCE: Readonly<Record<string, Evidence>> = {
  // Philosophy, approach and methodological choice: the classic alignments.
  "positivism/deductive": textbook("saunders-2019", "bryman-2016"),
  "interpretivism/inductive": textbook("saunders-2019", "bryman-2016"),
  "interpretivism/deductive": guidance("saunders-2019"),
  "pragmatism/abductive": guidance("morgan-2007", "saunders-2019"),
  "realism/abductive": guidance("saunders-2019", "sayer-2000"),
  "positivism/quantitative": textbook("saunders-2019", "bryman-2016", "creswell-creswell-2018"),
  "interpretivism/qualitative": textbook("saunders-2019", "bryman-2016", "creswell-creswell-2018"),
  "positivism/qualitative": textbook("bryman-2016", "creswell-creswell-2018"),
  "interpretivism/quantitative": textbook("bryman-2016", "creswell-creswell-2018"),
  "deductive/quantitative": textbook("bryman-2016", "creswell-creswell-2018"),
  "inductive/qualitative": textbook("bryman-2016", "creswell-creswell-2018"),
  "pragmatism/mixed-methods": textbook("creswell-creswell-2018", "johnson-onwuegbuzie-2004", "morgan-2007"),
  "abductive/mixed-methods": guidance("morgan-2007"),
  "pragmatism/multi-method": guidance("saunders-2019"),

  // Strategies.
  "positivism/experiment": textbook("saunders-2019", "bryman-2016"),
  "deductive/experiment": textbook("saunders-2019", "bryman-2016"),
  "quantitative/experiment": textbook("bryman-2016", "creswell-creswell-2018", "shadish-2002"),
  "positivism/survey": guidance("saunders-2019"),
  "deductive/survey": guidance("saunders-2019"),
  "quantitative/survey": textbook("bryman-2016", "creswell-creswell-2018", "fowler-2014"),
  "positivism/case-study": guidance("yin-2018"),
  "interpretivism/case-study": guidance("stake-1995"),
  "qualitative/case-study": textbook("creswell-creswell-2018", "yin-2018"),
  "mixed-methods/case-study": guidance("yin-2018"),
  "interpretivism/ethnography": guidance("hammersley-atkinson-2019"),
  "inductive/ethnography": guidance("hammersley-atkinson-2019"),
  "qualitative/ethnography": textbook("creswell-creswell-2018", "bryman-2016"),
  "interpretivism/grounded-theory": guidance("charmaz-2014"),
  "inductive/grounded-theory": textbook("glaser-strauss-1967", "charmaz-2014", "bryman-2016"),
  "qualitative/grounded-theory": textbook("creswell-creswell-2018", "charmaz-2014"),
  "qualitative/action-research": guidance("reason-bradbury-2008"),
  "interpretivism/narrative-inquiry": guidance("clandinin-connelly-2000"),
  "qualitative/narrative-inquiry": textbook("creswell-creswell-2018", "clandinin-connelly-2000"),
  "interpretivism/phenomenology": guidance("smith-2009", "van-manen-1990"),
  "inductive/phenomenology": guidance("smith-2009"),
  "qualitative/phenomenology": textbook("creswell-creswell-2018", "smith-2009"),

  // Time horizons.
  "survey/cross-sectional": textbook("bryman-2016", "saunders-2019"),
  "ethnography/longitudinal": guidance("hammersley-atkinson-2019"),
  "survey/longitudinal": guidance("menard-2002"),
  "experiment/longitudinal": guidance("menard-2002"),

  // Techniques.
  "quantitative/questionnaire": textbook("bryman-2016", "creswell-creswell-2018"),
  "survey/questionnaire": textbook("fowler-2014", "dillman-2014", "saunders-2019"),
  "qualitative/interview": textbook("bryman-2016", "kvale-brinkmann-2009"),
  "case-study/interview": textbook("yin-2018", "stake-1995"),
  "grounded-theory/interview": guidance("charmaz-2014"),
  "narrative-inquiry/interview": guidance("clandinin-connelly-2000"),
  "phenomenology/interview": guidance("smith-2009"),
  "qualitative/observation": guidance("spradley-1980", "bryman-2016"),
  "ethnography/observation": textbook("hammersley-atkinson-2019", "spradley-1980"),
  "case-study/observation": guidance("yin-2018"),
  "qualitative/focus-group": guidance("krueger-casey-2015", "morgan-1997"),
  "qualitative/document-analysis": guidance("bowen-2009"),
  "case-study/document-analysis": textbook("yin-2018", "bowen-2009"),
  "archival-research/document-analysis": guidance("scott-1990", "saunders-2019"),
  "quantitative/secondary-data": guidance("bryman-2016"),
  "archival-research/secondary-data": guidance("saunders-2019"),
  "qualitative/secondary-data": guidance("heaton-2004"),
};

/** The general debate about combining choices that rest on different assumptions. */
export const GENERAL_VIEW: AlternativeView = {
  text: "Some researchers argue that choices resting on different assumptions about knowledge shouldn't be combined, a position sometimes called the incompatibility thesis. Others argue that such combinations are acceptable when the research question calls for them and the researcher explains how the parts fit together.",
  sources: ["guba-lincoln-1994", "howe-1988"],
};

/** Specific debates about particular combinations. */
export const ALTERNATIVE_VIEWS: Readonly<Record<string, AlternativeView>> = {
  "positivism/qualitative": {
    text: "Some researchers argue that qualitative data can be collected and analysed within a positivist or postpositivist framework, for example by coding interviews systematically against predefined categories. Others argue that qualitative research is rooted in interpretation, so a positivist framing loses much of its purpose.",
    sources: ["bryman-2016", "creswell-creswell-2018"],
  },
  "interpretivism/quantitative": {
    text: "Some researchers use numerical data within an interpretive study, for example to describe a setting before exploring meanings in depth. Others argue that measurement imposes the researcher's categories on participants, which conflicts with understanding their own meanings.",
    sources: ["bryman-2016", "creswell-creswell-2018"],
  },
  "positivism/inductive": {
    text: "Some researchers point out that earlier forms of positivism relied on induction, generalising from repeated observations. Others follow Popper's argument that science should proceed by testing theories rather than by generalising from observations.",
    sources: ["popper-1959", "crotty-1998"],
  },
  "deductive/qualitative": {
    text: "Some researchers use qualitative data deductively, for example by coding interviews against a framework drawn from existing theory. Others argue that qualitative research is at its strongest when categories emerge from the data rather than being fixed in advance.",
    sources: ["bryman-2016", "maxwell-2013"],
  },
  "positivism/grounded-theory": {
    text: "Some researchers note that Glaser and Strauss's original grounded theory kept assumptions close to positivism, such as treating theory as something discovered in the data. Others, following Charmaz's constructivist grounded theory, reject those assumptions. Which version you follow changes how this combination is judged.",
    sources: ["glaser-strauss-1967", "charmaz-2014"],
  },
  "positivism/case-study": {
    text: "Case study research is described in different ways: Yin's approach is often read as close to postpositivism, with an emphasis on design and replication, while Stake's approach is interpretive, emphasising the particular case. Both are widely used.",
    sources: ["yin-2018", "stake-1995"],
  },
  "interpretivism/case-study": {
    text: "Case study research is described in different ways: Stake's approach is interpretive, emphasising the particular case, while Yin's approach is often read as close to postpositivism. Both are widely used.",
    sources: ["stake-1995", "yin-2018"],
  },
  "positivism/mixed-methods": {
    text: "Some researchers argue that mixed methods research needs its own paradigm, most often pragmatism. Others argue that it can be carried out from several paradigms, including postpositivism, provided the researcher explains how the qualitative part is treated.",
    sources: ["johnson-onwuegbuzie-2004", "creswell-plano-clark-2018"],
  },
  "interpretivism/mixed-methods": {
    text: "Some researchers argue that mixed methods research needs its own paradigm, most often pragmatism. Others argue that it can be carried out from several paradigms, including interpretive ones, provided the researcher explains how the quantitative part is treated.",
    sources: ["johnson-onwuegbuzie-2004", "creswell-plano-clark-2018"],
  },
  "interpretivism/experiment": {
    text: "Some researchers combine experiments with interpretive elements, such as interviews exploring how participants experienced an intervention. Others argue that controlling variables conflicts with studying meaning in its natural context.",
    sources: ["creswell-plano-clark-2018"],
  },
  "positivism/multi-method": {
    text: "Some researchers see several techniques from one tradition as a way to cross-check findings, a strategy often called triangulation. Others note that techniques from the same tradition may share the same blind spots.",
    sources: ["brewer-hunter-2006"],
  },
};

const key = (earlier: string, later: string) => `${earlier}/${later}`;

/** The evidence behind a pair's judgement. */
export function evidenceFor(earlier: string, later: string): Evidence {
  return EVIDENCE[key(earlier, later)] ?? INTERPRETIVE;
}

/**
 * A differing view for a pair: the specific debate where there is one, otherwise the
 * general debate for combinations that need careful justification, otherwise none.
 */
export function alternativeViewFor(earlier: string, later: string, careful: boolean): AlternativeView | null {
  return ALTERNATIVE_VIEWS[key(earlier, later)] ?? (careful ? GENERAL_VIEW : null);
}
