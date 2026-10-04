/**
 * The works the research knowledge draws on, in APA 7th edition style.
 *
 * Every entry is a genuine publication. Journal articles and books with a DOI were
 * checked against Crossref; books without a DOI were checked against library catalogue
 * records (Open Library). See each entry's comment where a detail needs a reviewer's check.
 */
import type { Reference } from "./types";

export const REFERENCES: readonly Reference[] = [
  {
    id: "saunders-2019",
    cite: "Saunders et al., 2019",
    year: 2019,
    apa: "Saunders, M. N. K., Lewis, P., & Thornhill, A. (2019). *Research methods for business students* (8th ed.). Pearson.",
  },
  {
    id: "creswell-creswell-2018",
    cite: "Creswell & Creswell, 2018",
    year: 2018,
    apa: "Creswell, J. W., & Creswell, J. D. (2018). *Research design: Qualitative, quantitative, and mixed methods approaches* (5th ed.). SAGE.",
  },
  {
    id: "creswell-plano-clark-2018",
    cite: "Creswell & Plano Clark, 2018",
    year: 2018,
    apa: "Creswell, J. W., & Plano Clark, V. L. (2018). *Designing and conducting mixed methods research* (3rd ed.). SAGE.",
  },
  {
    id: "crotty-1998",
    cite: "Crotty, 1998",
    year: 1998,
    apa: "Crotty, M. (1998). *The foundations of social research: Meaning and perspective in the research process*. SAGE.",
  },
  {
    id: "bryman-2016",
    cite: "Bryman, 2016",
    year: 2016,
    apa: "Bryman, A. (2016). *Social research methods* (5th ed.). Oxford University Press.",
  },
  {
    // Printed in late 2017 with a 2018 copyright date; APA uses the copyright year.
    id: "yin-2018",
    cite: "Yin, 2018",
    year: 2018,
    apa: "Yin, R. K. (2018). *Case study research and applications: Design and methods* (6th ed.). SAGE.",
  },
  {
    id: "stake-1995",
    cite: "Stake, 1995",
    year: 1995,
    apa: "Stake, R. E. (1995). *The art of case study research*. SAGE.",
  },
  {
    id: "maxwell-2013",
    cite: "Maxwell, 2013",
    year: 2013,
    apa: "Maxwell, J. A. (2013). *Qualitative research design: An interactive approach* (3rd ed.). SAGE.",
  },
  {
    id: "lincoln-guba-1985",
    cite: "Lincoln & Guba, 1985",
    year: 1985,
    apa: "Lincoln, Y. S., & Guba, E. G. (1985). *Naturalistic inquiry*. SAGE.",
  },
  {
    id: "guba-lincoln-1994",
    cite: "Guba & Lincoln, 1994",
    year: 1994,
    apa: "Guba, E. G., & Lincoln, Y. S. (1994). Competing paradigms in qualitative research. In N. K. Denzin & Y. S. Lincoln (Eds.), *Handbook of qualitative research* (pp. 105–117). SAGE.",
  },
  {
    id: "denzin-lincoln-2018",
    cite: "Denzin & Lincoln, 2018",
    year: 2018,
    apa: "Denzin, N. K., & Lincoln, Y. S. (Eds.). (2018). *The SAGE handbook of qualitative research* (5th ed.). SAGE.",
  },
  {
    id: "glaser-strauss-1967",
    cite: "Glaser & Strauss, 1967",
    year: 1967,
    apa: "Glaser, B. G., & Strauss, A. L. (1967). *The discovery of grounded theory: Strategies for qualitative research*. Aldine.",
  },
  {
    id: "charmaz-2014",
    cite: "Charmaz, 2014",
    year: 2014,
    apa: "Charmaz, K. (2014). *Constructing grounded theory* (2nd ed.). SAGE.",
  },
  {
    id: "sayer-2000",
    cite: "Sayer, 2000",
    year: 2000,
    apa: "Sayer, A. (2000). *Realism and social science*. SAGE.",
    doi: "10.4135/9781446218730",
  },
  {
    id: "popper-1959",
    cite: "Popper, 1959",
    year: 1959,
    apa: "Popper, K. R. (1959). *The logic of scientific discovery*. Hutchinson.",
  },
  {
    id: "timmermans-tavory-2012",
    cite: "Timmermans & Tavory, 2012",
    year: 2012,
    apa: "Timmermans, S., & Tavory, I. (2012). Theory construction in qualitative research: From grounded theory to abductive analysis. *Sociological Theory, 30*(3), 167–186.",
    doi: "10.1177/0735275112457914",
  },
  {
    id: "johnson-onwuegbuzie-2004",
    cite: "Johnson & Onwuegbuzie, 2004",
    year: 2004,
    apa: "Johnson, R. B., & Onwuegbuzie, A. J. (2004). Mixed methods research: A research paradigm whose time has come. *Educational Researcher, 33*(7), 14–26.",
    doi: "10.3102/0013189X033007014",
  },
  {
    id: "morgan-2007",
    cite: "Morgan, 2007",
    year: 2007,
    apa: "Morgan, D. L. (2007). Paradigms lost and pragmatism regained: Methodological implications of combining qualitative and quantitative methods. *Journal of Mixed Methods Research, 1*(1), 48–76.",
    doi: "10.1177/2345678906292462",
  },
  {
    id: "howe-1988",
    cite: "Howe, 1988",
    year: 1988,
    apa: "Howe, K. R. (1988). Against the quantitative-qualitative incompatibility thesis or dogmas die hard. *Educational Researcher, 17*(8), 10–16.",
    doi: "10.3102/0013189X017008010",
  },
  {
    id: "brewer-hunter-2006",
    cite: "Brewer & Hunter, 2006",
    year: 2006,
    apa: "Brewer, J., & Hunter, A. (2006). *Foundations of multimethod research: Synthesizing styles* (2nd ed.). SAGE.",
    doi: "10.4135/9781412984294",
  },
  {
    id: "shadish-2002",
    cite: "Shadish et al., 2002",
    year: 2002,
    apa: "Shadish, W. R., Cook, T. D., & Campbell, D. T. (2002). *Experimental and quasi-experimental designs for generalized causal inference*. Houghton Mifflin.",
  },
  {
    id: "fowler-2014",
    cite: "Fowler, 2014",
    year: 2014,
    apa: "Fowler, F. J., Jr. (2014). *Survey research methods* (5th ed.). SAGE.",
  },
  {
    id: "hammersley-atkinson-2019",
    cite: "Hammersley & Atkinson, 2019",
    year: 2019,
    apa: "Hammersley, M., & Atkinson, P. (2019). *Ethnography: Principles in practice* (4th ed.). Routledge.",
    doi: "10.4324/9781315146027",
  },
  {
    id: "reason-bradbury-2008",
    cite: "Reason & Bradbury, 2008",
    year: 2008,
    apa: "Reason, P., & Bradbury, H. (Eds.). (2008). *The SAGE handbook of action research: Participative inquiry and practice* (2nd ed.). SAGE.",
  },
  {
    id: "clandinin-connelly-2000",
    cite: "Clandinin & Connelly, 2000",
    year: 2000,
    apa: "Clandinin, D. J., & Connelly, F. M. (2000). *Narrative inquiry: Experience and story in qualitative research*. Jossey-Bass.",
  },
  {
    id: "smith-2009",
    cite: "Smith et al., 2009",
    year: 2009,
    apa: "Smith, J. A., Flowers, P., & Larkin, M. (2009). *Interpretative phenomenological analysis: Theory, method and research*. SAGE.",
  },
  {
    id: "van-manen-1990",
    cite: "van Manen, 1990",
    year: 1990,
    apa: "van Manen, M. (1990). *Researching lived experience: Human science for an action sensitive pedagogy*. State University of New York Press.",
  },
  {
    id: "scott-1990",
    cite: "Scott, 1990",
    year: 1990,
    apa: "Scott, J. (1990). *A matter of record: Documentary sources in social research*. Polity Press.",
  },
  {
    id: "bowen-2009",
    cite: "Bowen, 2009",
    year: 2009,
    apa: "Bowen, G. A. (2009). Document analysis as a qualitative research method. *Qualitative Research Journal, 9*(2), 27–40.",
    doi: "10.3316/QRJ0902027",
  },
  {
    // Printed in 2014 with a 2015 copyright date; APA uses the copyright year.
    id: "krueger-casey-2015",
    cite: "Krueger & Casey, 2015",
    year: 2015,
    apa: "Krueger, R. A., & Casey, M. A. (2015). *Focus groups: A practical guide for applied research* (5th ed.). SAGE.",
  },
  {
    id: "morgan-1997",
    cite: "Morgan, 1997",
    year: 1997,
    apa: "Morgan, D. L. (1997). *Focus groups as qualitative research* (2nd ed.). SAGE.",
    doi: "10.4135/9781412984287",
  },
  {
    id: "kvale-brinkmann-2009",
    cite: "Kvale & Brinkmann, 2009",
    year: 2009,
    apa: "Kvale, S., & Brinkmann, S. (2009). *InterViews: Learning the craft of qualitative research interviewing* (2nd ed.). SAGE.",
  },
  {
    // Crossref records the Wiley online edition as edition 1; the 2014 print book is the 4th edition.
    id: "dillman-2014",
    cite: "Dillman et al., 2014",
    year: 2014,
    apa: "Dillman, D. A., Smyth, J. D., & Christian, L. M. (2014). *Internet, phone, mail, and mixed-mode surveys: The tailored design method* (4th ed.). Wiley.",
    doi: "10.1002/9781394260645",
  },
  {
    id: "menard-2002",
    cite: "Menard, 2002",
    year: 2002,
    apa: "Menard, S. (2002). *Longitudinal research* (2nd ed.). SAGE.",
    doi: "10.4135/9781412984867",
  },
  {
    id: "heaton-2004",
    cite: "Heaton, 2004",
    year: 2004,
    apa: "Heaton, J. (2004). *Reworking qualitative data*. SAGE.",
    doi: "10.4135/9781849209878",
  },
  {
    id: "spradley-1980",
    cite: "Spradley, 1980",
    year: 1980,
    apa: "Spradley, J. P. (1980). *Participant observation*. Holt, Rinehart and Winston.",
  },
  {
    id: "hulley-2013",
    cite: "Hulley et al., 2013",
    year: 2013,
    apa: "Hulley, S. B., Cummings, S. R., Browner, W. S., Grady, D. G., & Newman, T. B. (2013). *Designing clinical research* (4th ed.). Lippincott Williams & Wilkins.",
  },
  {
    id: "pawson-tilley-1997",
    cite: "Pawson & Tilley, 1997",
    year: 1997,
    apa: "Pawson, R., & Tilley, N. (1997). *Realistic evaluation*. SAGE.",
  },
  {
    id: "white-2009",
    cite: "White, 2009",
    year: 2009,
    apa: "White, P. (2009). *Developing research questions: A guide for social scientists*. Palgrave Macmillan.",
  },
];

/**
 * Research methods textbooks first cited by the Research Title Builder. Kept beside
 * REFERENCES until its usage check (references.test.ts) lists the title module's
 * sources; getReference finds both, and title.test.ts checks their format and use.
 */
export const TEXTBOOK_REFERENCES: readonly Reference[] = [
  {
    // Checked against Open Library: Sekaran and Bougie, Wiley, 2013. The 7th edition (2016) may be preferred at review.
    id: "sekaran-bougie-2013",
    cite: "Sekaran & Bougie, 2013",
    year: 2013,
    apa: "Sekaran, U., & Bougie, R. (2013). *Research methods for business: A skill-building approach* (6th ed.). Wiley.",
  },
  {
    // Checked against Open Library: Keith F. Punch, SAGE, 2005. A 3rd edition (2014) exists and may be preferred at review.
    id: "punch-2005",
    cite: "Punch, 2005",
    year: 2005,
    apa: "Punch, K. F. (2005). *Introduction to social research: Quantitative and qualitative approaches* (2nd ed.). SAGE.",
  },
  {
    // Checked against Open Library: C. R. Kothari, New Age International, 2004.
    id: "kothari-2004",
    cite: "Kothari, 2004",
    year: 2004,
    apa: "Kothari, C. R. (2004). *Research methodology: Methods and techniques* (2nd rev. ed.). New Age International.",
  },
];

/**
 * Statistics sources first cited by the Statistics guides and the Statistical Test
 * Finder. getReference finds them; test-finder/references.test.ts checks their format,
 * registration and citations in the guide.
 */
export const STATISTICS_REFERENCES: readonly Reference[] = [
  {
    // Checked against Open Library (ISBN 9781526419521): Andy Field, SAGE. Open Library records the 2017 printing;
    // the 5th edition carries a 2018 copyright date, which APA uses. Reviewer: confirm the copyright year.
    id: "field-2018",
    cite: "Field, 2018",
    year: 2018,
    apa: "Field, A. (2018). *Discovering statistics using IBM SPSS statistics* (5th ed.). SAGE.",
  },
  {
    // Checked against Open Library (ISBN 9781111835484): 8th edition, Wadsworth Cengage Learning, 2013.
    id: "howell-2013",
    cite: "Howell, 2013",
    year: 2013,
    apa: "Howell, D. C. (2013). *Statistical methods for psychology* (8th ed.). Wadsworth, Cengage Learning.",
  },
  {
    // Checked against Open Library (ISBN 9780805802832): 2nd edition, Lawrence Erlbaum Associates, 1988.
    id: "cohen-1988",
    cite: "Cohen, 1988",
    year: 1988,
    apa: "Cohen, J. (1988). *Statistical power analysis for the behavioral sciences* (2nd ed.). Lawrence Erlbaum Associates.",
  },
  {
    // Checked against Crossref (DOI 10.1080/00031305.2016.1154108): authors, title, volume 70, issue 2, pages 129–133.
    id: "wasserstein-lazar-2016",
    cite: "Wasserstein & Lazar, 2016",
    year: 2016,
    apa: "Wasserstein, R. L., & Lazar, N. A. (2016). The ASA statement on p-values: Context, process, and purpose. *The American Statistician, 70*(2), 129–133.",
    doi: "10.1080/00031305.2016.1154108",
  },
  {
    // Crossref DOI 10.3102/10769986006002107 confirms article metadata and pages.
    id: "hedges-1981",
    cite: "Hedges, 1981",
    year: 1981,
    apa: "Hedges, L. V. (1981). Distribution theory for Glass's estimator of effect size and related estimators. *Journal of Educational Statistics, 6*(2), 107–128.",
    doi: "10.3102/10769986006002107",
  },
  {
    // Crossref DOI 10.3389/fpsyg.2013.00863 confirms title, author and journal metadata.
    id: "lakens-2013",
    cite: "Lakens, 2013",
    year: 2013,
    apa: "Lakens, D. (2013). Calculating and reporting effect sizes to facilitate cumulative science: A practical primer for t-tests and ANOVAs. *Frontiers in Psychology, 4*, Article 863.",
    doi: "10.3389/fpsyg.2013.00863",
  },
];

/**
 * Works by an organisation rather than people. They are kept apart because their
 * in-text citation is the organisation's name, not a list of surnames.
 */
export const GROUP_REFERENCES: readonly Reference[] = [
  {
    // Checked against Crossref (DOI 10.1037/0000165-000): title, publisher and 2020 issue date.
    id: "apa-2020",
    cite: "American Psychological Association, 2020",
    year: 2020,
    apa: "American Psychological Association. (2020). *Publication manual of the American Psychological Association* (7th ed.).",
    doi: "10.1037/0000165-000",
  },
];

/**
 * Style manuals cited by the citation guides, as the authority for the rules a
 * guide teaches. The guides' tests check each one is used.
 */
export const STYLE_MANUAL_REFERENCES: readonly Reference[] = [
  {
    // Checked against Open Library (ISBN 9781603293518): published April 2021 by the MLA. The MLA's
    // own citation of the Handbook (style.mla.org/citing-mla-handbook-ninth-edition/) gives the
    // publisher as the Modern Language Association of America; as author and publisher it isn't repeated.
    id: "mla-2021",
    cite: "Modern Language Association of America, 2021",
    year: 2021,
    apa: "Modern Language Association of America. (2021). *MLA handbook* (9th ed.).",
  },
  {
    // Checked against Open Library (ISBN 9780226817972): the 18th edition, published 2024 by the
    // University of Chicago Press, whose editorial staff is its author; as author and publisher it isn't repeated.
    id: "chicago-2024",
    cite: "University of Chicago Press, 2024",
    year: 2024,
    apa: "University of Chicago Press. (2024). *The Chicago manual of style* (18th ed.).",
  },
  {
    // Checked against the guide itself, linked from the IEEE Author Center (journals.ieeeauthorcenter.ieee.org):
    // "Reference Guide, IEEE Publication Operations", version 3.28.2025, © 2025 IEEE.
    id: "ieee-2025",
    cite: "IEEE Publication Operations, 2025",
    year: 2025,
    apa: "IEEE Publication Operations. (2025). *IEEE reference guide* (Version 3.28.2025).",
  },
  {
    // Checked against the publisher's listings (Blackwell's, ISBN 9781350477261; VitalSource): the 13th
    // edition, published 2025 by Bloomsbury Academic, by Richard Pears and Graham Shields. The basis of
    // ResearchKit's Harvard profile (ADR-0008). Unlike the other manuals, its authors are people.
    id: "cite-them-right-2025",
    cite: "Pears & Shields, 2025",
    year: 2025,
    apa: "Pears, R., & Shields, G. (2025). *Cite them right: The essential referencing guide* (13th ed.). Bloomsbury Academic.",
  },
];

/**
 * The sources of the readability formulas, cited by the readability guide. Each was
 * read in the original or an authoritative reprint: Flesch (1948) in DuBay (2007);
 * Kincaid et al. (1975) from the report itself (DTIC ADA006655); McLaughlin (1969)
 * from the paper and his own formula statement; Gunning (1952) as described by
 * DuBay (2004), since the book itself wasn't available.
 */
export const READABILITY_REFERENCES: readonly Reference[] = [
  {
    // Checked against Crossref (DOI 10.1037/h0057532): title, journal, volume 32, issue 3, pages 221–233.
    id: "flesch-1948",
    cite: "Flesch, 1948",
    year: 1948,
    apa: "Flesch, R. (1948). A new readability yardstick. *Journal of Applied Psychology, 32*(3), 221–233.",
    doi: "10.1037/h0057532",
  },
  {
    // Checked against the report's cover and title page: Naval Technical Training Command, Research Branch Report 8-75, February 1975.
    id: "kincaid-1975",
    cite: "Kincaid et al., 1975",
    year: 1975,
    apa: "Kincaid, J. P., Fishburne, R. P., Jr., Rogers, R. L., & Chissom, B. S. (1975). *Derivation of new readability formulas (Automated Readability Index, Fog Count and Flesch Reading Ease formula) for Navy enlisted personnel* (Research Branch Report 8-75). Naval Technical Training Command.",
  },
  {
    // Checked against the paper's first page: Journal of Reading, May 1969, pages 639–646.
    id: "mclaughlin-1969",
    cite: "McLaughlin, 1969",
    year: 1969,
    apa: "McLaughlin, G. H. (1969). SMOG grading: A new readability formula. *Journal of Reading, 12*(8), 639–646.",
  },
  {
    // As listed in DuBay (2004), which describes the Fog Index; the book wasn't available to check.
    id: "gunning-1952",
    cite: "Gunning, 1952",
    year: 1952,
    apa: "Gunning, R. (1952). *The technique of clear writing*. McGraw-Hill.",
  },
  {
    // Checked against the document's copyright page (© 2004 William H. DuBay; ERIC ED490073).
    id: "dubay-2004",
    cite: "DuBay, 2004",
    year: 2004,
    apa: "DuBay, W. H. (2004). *The principles of readability*. Impact Information.",
  },
  {
    // Checked against ERIC ED506404 (publication year 2007) and the title page: William H. DuBay, editor; Impact Information.
    id: "dubay-2007",
    cite: "DuBay, 2007",
    year: 2007,
    apa: "DuBay, W. H. (Ed.). (2007). *The classic readability studies*. Impact Information.",
  },
];

/** The reference with this id. Throws for an unknown id. */
export function getReference(id: string): Reference {
  const reference = [...REFERENCES, ...TEXTBOOK_REFERENCES, ...STATISTICS_REFERENCES, ...GROUP_REFERENCES, ...STYLE_MANUAL_REFERENCES, ...READABILITY_REFERENCES].find((candidate) => candidate.id === id);
  if (!reference) throw new RangeError(`Unknown reference: ${id}`);
  return reference;
}

export const doiUrl = (doi: string) => `https://doi.org/${doi}`;

/** A reference as text runs, so the italic part can be shown in italics. The DOI is not included. */
export function referenceRuns(reference: Reference): { text: string; italic: boolean }[] {
  return reference.apa
    .split("*")
    .map((text, index) => ({ text, italic: index % 2 === 1 }))
    .filter((run) => run.text.length > 0);
}

/** The full reference in plain text, with its DOI as a link. */
export function referenceText(reference: Reference): string {
  const text = reference.apa.replaceAll("*", "");
  return reference.doi ? `${text} ${doiUrl(reference.doi)}` : text;
}

/** The full reference in Markdown, with the italic part in asterisks and its DOI as a link. */
export function referenceMarkdown(reference: Reference): string {
  return reference.doi ? `${reference.apa} ${doiUrl(reference.doi)}` : reference.apa;
}
