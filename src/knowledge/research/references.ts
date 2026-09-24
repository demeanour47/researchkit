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

/** The reference with this id. Throws for an unknown id. */
export function getReference(id: string): Reference {
  const reference = REFERENCES.find((candidate) => candidate.id === id);
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
