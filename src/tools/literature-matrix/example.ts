import type { MatrixField } from "../../knowledge/literature";
import type { TypedProject } from "../../knowledge/research";

/** Fictional example studies, for trying the builder. None of these studies exists. */
export const exampleStudies: Partial<Record<MatrixField, string>>[] = [
  { authors: "Adams, J.; Brown, K.", year: "2016", title: "Screen time and sleep in first-year students (fictional)", journal: "Example Journal of Sleep", country: "United Kingdom", context: "First-year university students", design: "Cross-sectional survey", approach: "Quantitative", philosophy: "Positivism", theory: "Self-Determination Theory", sampling: "Convenience sampling", sampleSize: "212", dataCollection: "Online questionnaire", analysis: "Multiple regression; Pearson correlation", independent: "Screen time", dependent: "Sleep quality", findings: "More evening screen time predicted poorer sleep quality.", gap: "Longitudinal designs are needed to establish causality.", limitations: "Self-reported screen time; one university.", contribution: "Links evening screen use to sleep in a student sample.", reflection: "Clear measures, but a single site limits generalisation." },
  { authors: "Chen, L.", year: "2018", title: "Bedtime phone use and wellbeing (fictional)", journal: "Example Journal of Adolescence", country: "United Kingdom", design: "Cross-sectional", approach: "Quantitative", theory: "Self-Determination Theory", sampling: "Convenience", sampleSize: "88", dataCollection: "Questionnaire", analysis: "Hierarchical regression", independent: "Screen time", dependent: "Sleep quality; wellbeing", findings: "Bedtime phone use related to lower wellbeing, partly through poorer sleep.", recommendations: "Future research should use longitudinal designs to establish causality." },
  { authors: "Diaz, M.; Evans, R.; Fox, T.", year: "2019", title: "Social media, anxiety and adolescent sleep (fictional)", country: "United States", design: "Survey", approach: "Deductive", theory: "Stress and Coping Theory", sampling: "Purposive sampling", sampleSize: "64", dataCollection: "Survey", analysis: "PLS-SEM", independent: "Social media use", dependent: "Sleep quality", mediator: "Anxiety", findings: "Anxiety mediated the link between social media use and sleep.", gap: "Few studies examine mediators; longitudinal causality remains untested." },
  { authors: "Garcia, P.", year: "2017", title: "Screen time and grades (fictional)", country: "United Kingdom", design: "Cross-sectional", approach: "Quantitative", sampling: "Convenience", sampleSize: "150", dataCollection: "Questionnaire", analysis: "Pearson correlation", independent: "Screen time", dependent: "Academic performance", findings: "Screen time correlated weakly with grades." },
  { authors: "Ito, Y.", year: "2016", title: "Screens and bedtime routines: a qualitative study (fictional)", country: "Japan", design: "Phenomenology", approach: "Qualitative", philosophy: "Interpretivism", sampling: "Purposive", sampleSize: "12", dataCollection: "Semi-structured interviews", analysis: "Thematic analysis", variables: "screen use; bedtime routines", findings: "Participants used screens to relax, which delayed sleep.", limitations: "Small sample from one city." },
];

/** A fictional example project, for trying the builder with a project. */
export const exampleProject: TypedProject = {
  researchQuestion: "How is screen time before bed related to sleep quality among undergraduate students?",
  researchObjectives: "To examine the relationship between screen time and sleep quality\nTo explore whether anxiety explains the relationship",
  independent: "screen time",
  dependent: "sleep quality",
  moderator: "",
  mediator: "anxiety",
  control: "",
  philosophy: "positivism",
  approach: "deductive",
  choice: "quantitative",
  timeHorizon: "cross-sectional",
  design: "correlational",
  technique: "",
  margin: "",
  hypotheses: "relationship",
};
export const exampleTopic = "Screen use and sleep among university students";
export const exampleLevels = { "var-screen-time": "ratio", "var-sleep-quality": "likert", "var-anxiety": "likert" } as const;
