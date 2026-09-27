/** Fictional studies for the literature tests. Not part of the product; the studies don't exist. */

import { createStudy } from "./matrix";
import type { Matrix, MatrixField } from "./types";

type Fields = Partial<Record<MatrixField, string>>;

export const study = (id: string, fields: Fields = {}) => createStudy(id, fields);

/** Six fictional studies with the patterns the tests look for: mostly cross-sectional surveys in two countries, convenience samples, regression, one repeated relationship and a repeated gap. */
export const SAMPLE_MATRIX: Matrix = [
  study("s1", { authors: "Adams, J.; Brown, K.", year: "2016", title: "Screen time and sleep in first-year students", country: "United Kingdom", design: "Cross-sectional survey", approach: "Quantitative", philosophy: "Positivism", theory: "Self-Determination Theory", sampling: "Convenience sampling", sampleSize: "212", dataCollection: "Online questionnaire", analysis: "Multiple regression; Pearson correlation", variables: "screen time; sleep quality", independent: "Screen time", dependent: "Sleep quality", findings: "More screen time predicted poorer sleep quality.", gap: "Longitudinal designs are needed to establish causality.", limitations: "Self-reported screen time.", doi: "10.1000/rk.2016.001" }),
  study("s2", { authors: "Chen, L.", year: "2018", title: "Bedtime phone use and wellbeing", country: "United Kingdom", design: "Cross-sectional", approach: "Quantitative", theory: "Self-Determination Theory", sampling: "Convenience", sampleSize: "88", dataCollection: "Questionnaire", analysis: "Hierarchical regression", variables: "phone use; wellbeing", independent: "Screen time", dependent: "Sleep quality; wellbeing", findings: "Phone use at bedtime related to lower wellbeing.", recommendations: "Future research should use longitudinal designs to establish causality.", doi: "https://doi.org/10.1000/rk.2018.002" }),
  study("s3", { authors: "Diaz, M.; Evans, R.; Fox, T.", year: "2019", title: "Social media and adolescent sleep", country: "United States", design: "Survey", approach: "Deductive", sampling: "Purposive sampling", sampleSize: "64", dataCollection: "Survey", analysis: "SEM", independent: "Social media use", dependent: "Sleep quality", mediator: "Anxiety", findings: "Anxiety mediated the link between social media use and sleep.", gap: "Few studies examine mediators; longitudinal causality remains untested." }),
  study("s4", { authors: "Garcia, P.", year: "2017", country: "United Kingdom", design: "Cross-sectional", approach: "Quantitative", sampling: "Convenience", sampleSize: "150", dataCollection: "Questionnaire", analysis: "Pearson correlation", independent: "Screen time", dependent: "Academic performance", findings: "Screen time correlated weakly with grades." }),
  study("s5", { authors: "Hughes, A.", year: "2015", title: "Night-time device use among nurses", country: "United Kingdom", design: "Cross-sectional survey", approach: "Quantitative", sampling: "Snowball", sampleSize: "45", dataCollection: "Questionnaire", analysis: "Chi-square", independent: "Device use", dependent: "Sleep quality", limitations: "Small sample and cross-sectional design." }),
  study("s6", { authors: "Ito, Y.", year: "2016", title: "Screen use and sleep: a qualitative study", country: "Japan", design: "Phenomenology", approach: "Qualitative", sampling: "Purposive", sampleSize: "12", dataCollection: "Semi-structured interviews", analysis: "Thematic analysis", variables: "screen use; sleep routines", findings: "Participants used screens to relax before sleep." }),
];
