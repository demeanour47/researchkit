/**
 * The guide registry: the one place that knows which guides exist and where
 * their content comes from. Replacing files with a CMS changes only this module.
 */

import { howToChooseACitationStyle } from "../../../content/guides/how-to-choose-a-citation-style";
import { apa7CitationsAndReferences } from "../../../content/guides/apa-7-citations-and-references";
import { mla9CitationsAndWorksCited } from "../../../content/guides/mla-9-citations-and-works-cited";
import { chicagoAuthorDateCitations } from "../../../content/guides/chicago-author-date-citations";
import { chicagoNotesBibliography } from "../../../content/guides/chicago-notes-bibliography";
import { ieeeCitationsAndReferences } from "../../../content/guides/ieee-citations-and-references";
import { harvardCitationsAndReferences } from "../../../content/guides/harvard-citations-and-references";
import { referenceCheckerGuide } from "../../../content/guides/reference-checker";
import { paragraphStructureAndCounting } from "../../../content/guides/paragraph-structure-and-counting";
import { sentenceStructureAndCounting } from "../../../content/guides/sentence-structure-and-counting";
import { readabilityInAcademicWriting } from "../../../content/guides/readability-in-academic-writing";
import { powerAnalysisGuide } from "../../../content/guides/power-analysis";
import { confidenceIntervalsGuide } from "../../../content/guides/confidence-intervals";
import { howToChooseAStatisticalTest } from "../../../content/guides/how-to-choose-a-statistical-test";
import { spssFromDataPreparationToReporting } from "../../../content/guides/spss-from-data-preparation-to-reporting";
import { howToCountCharactersInAcademicWriting } from "../../../content/guides/how-to-count-characters-in-academic-writing";
import { howToWriteAGoodResearchTitle } from "../../../content/guides/how-to-write-a-good-research-title";
import { howToWriteResearchObjectives } from "../../../content/guides/how-to-write-research-objectives";
import { howToCiteAWebsite } from "../../../content/guides/how-to-cite-a-website";
import { referenceListOrBibliography } from "../../../content/guides/reference-list-or-bibliography";
import { howToAvoidPlagiarism } from "../../../content/guides/how-to-avoid-plagiarism";
import { howToParaphrase } from "../../../content/guides/how-to-paraphrase";
import { howToWriteAResearchQuestion } from "../../../content/guides/how-to-write-a-research-question";
import { qualitativeOrQuantitativeResearch } from "../../../content/guides/qualitative-or-quantitative-research";
import { howToWriteALiteratureReview } from "../../../content/guides/how-to-write-a-literature-review";
import { whatAPValueTellsYou } from "../../../content/guides/what-a-p-value-tells-you";
import { howToReportStatisticsInApa } from "../../../content/guides/how-to-report-statistics-in-apa";
import { howToWriteAnAbstract } from "../../../content/guides/how-to-write-an-abstract";
import { howToMeetAWordLimit } from "../../../content/guides/how-to-meet-a-word-limit";
import { howToStructureAnAcademicEssay } from "../../../content/guides/how-to-structure-an-academic-essay";
import { howToReadAResearchPaper } from "../../../content/guides/how-to-read-a-research-paper";
import { howToManageYourReferences } from "../../../content/guides/how-to-manage-your-references";
import { howToPlanADissertation } from "../../../content/guides/how-to-plan-a-dissertation";
import type { Guide } from "./guide";

const GUIDES: readonly Guide[] = [howToChooseACitationStyle, apa7CitationsAndReferences, mla9CitationsAndWorksCited, chicagoAuthorDateCitations, chicagoNotesBibliography, ieeeCitationsAndReferences, harvardCitationsAndReferences, referenceCheckerGuide, howToWriteAGoodResearchTitle, howToCountCharactersInAcademicWriting, paragraphStructureAndCounting, sentenceStructureAndCounting, readabilityInAcademicWriting, howToWriteResearchObjectives, howToChooseAStatisticalTest, spssFromDataPreparationToReporting, powerAnalysisGuide, confidenceIntervalsGuide, howToCiteAWebsite, referenceListOrBibliography, howToAvoidPlagiarism, howToParaphrase, howToWriteAResearchQuestion, qualitativeOrQuantitativeResearch, howToWriteALiteratureReview, whatAPValueTellsYou, howToReportStatisticsInApa, howToWriteAnAbstract, howToMeetAWordLimit, howToStructureAnAcademicEssay, howToReadAResearchPaper, howToManageYourReferences, howToPlanADissertation];

/** A guide's address. Provisional until the URL strategy (ADR-0005) is accepted. */
export const guidePath = (slug: string) => `/learn/${slug}`;

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function guideSlugs(): string[] {
  return GUIDES.map((guide) => guide.slug);
}
