/**
 * One example per style: a short list in the style, written as ResearchKit's
 * generator for that style formats it, with one deliberate problem in the list and
 * one citation that has no entry, so the example shows what the checker reports.
 * Tests check that each example produces exactly those findings.
 */

// Type-only imports, so the test runner can load this module (see TESTING.md).
import type { CheckerStyleId } from "../../knowledge/citation/checker";

export interface CheckerExample {
  references: string;
  citations: string;
}

export const examples: Record<CheckerStyleId, CheckerExample> = {
  apa: {
    references: [
      "Binder, A. J., & Kidder, J. L. (2022). The channels of student activism. University of Chicago Press.",
      "Thaker, J., Smith, N., & Leiserowitz, A. (2020). Global warming risk perceptions in India. Risk Analysis, 40(12), 2481–2497. https://doi.org/10.1111/risa.13574",
      "World Health Organization. (2023, May 4). Climate change and health. https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health",
      "Yu, C. (2020). Interior Chinatown. Pantheon Books. doi:not-a-doi",
    ].join("\n\n"),
    citations: "Campus activism is organized differently on the left and right (Binder & Kidder, 2022, p. 117). Thaker et al. (2020) found that risk perceptions vary by region, a pattern the World Health Organization (2023) also reports. Earlier surveys disagreed (Brown, 2018).",
  },
  mla: {
    references: [
      "Burns, Shauntee. “Finding Wonder Women at the Library: Online Biographies and Encyclopedias.” New York Public Library, 2 Mar. 2016, www.nypl.org/blog/2016/03/02/biographies-women-history.",
      "Dorris, Michael, and Erdrich, Louise. The Crown of Columbus. HarperCollins, 1991.",
      "LeCun, Yann, et al. “Deep Learning.” Nature, vol. 521, no. 7553, 2015, pp. 436–44, https://doi.org/10.1038/nature14539.",
    ].join("\n\n"),
    citations: "Deep learning changed machine vision (LeCun et al. 437). Library guides point readers to biographies (Burns). The novel rewrites a familiar voyage (Dorris and Erdrich 12), as others have argued (Morrison 22).",
  },
  "chicago-author-date": {
    references: [
      "Binder, Amy J., and Jeffrey L. Kidder. 2022. The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today. University of Chicago Press.",
      "Dittmar, Emily L., and Douglas W. Schemske. 2023. “Temporal Variation in Selection Influences Microgeographic Local Adaptation.” American Naturalist 202(4), 471–485. https://doi.org/10.1086/725865.",
      "Yu, Charles. 2020. Interior Chinatown. Pantheon Books.",
    ].join("\n\n"),
    citations: "Students organize through different channels (Binder and Kidder 2022, 117–18). Selection varies over time (Dittmar and Schemske 2023, 480), and Yu (2020, 45) satirizes typecasting. Others disagree (Lee 2019).",
  },
  "chicago-notes-bibliography": {
    references: [
      "Binder, Amy J., and Jeffrey L. Kidder. The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today. University of Chicago Press, 2022.",
      "Borel, Brooke. The Chicago Guide to Fact-Checking. 2nd ed. University of Chicago Press, 2023.",
      "Yu, Charles. Interior Chinatown. Pantheon Books, 2020.",
      "Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45.",
    ].join("\n\n"),
    citations: [
      "1. Charles Yu, Interior Chinatown (Pantheon Books, 2020), 45.",
      "2. Amy J. Binder and Jeffrey L. Kidder, The Channels of Student Activism: How the Left and Right Are Winning (and Losing) in Campus Politics Today (University of Chicago Press, 2022), 117–18.",
      "3. Yu, Interior Chinatown, 48.",
      "4. Morrison, Beloved, 12.",
    ].join("\n"),
  },
  ieee: {
    references: [
      "[1] B. Klaus and P. Horn, Robot Vision. Cambridge, MA, USA: MIT Press, 1986.",
      "[2] M. M. Chiampi and L. L. Zilberti, “Induction of electric field in human bodies moving near MRI: An efficient BEM computational procedure,” IEEE Trans. Biomed. Eng., vol. 58, no. 10, pp. 2787–2793, Oct. 2011, doi: 10.1109/TBME.2011.2158315.",
      "[2] J. Smith. “Obama inaugurated as President.” CNN.com. Accessed: Feb. 1, 2009. [Online]. Available: http://www.cnn.com/POLITICS/01/21/obama_inaugurated/index.html",
    ].join("\n"),
    citations: "Machine vision builds on early work [1, p. 24]. Field exposure near scanners has been modelled [2], and later studies extend it [1]–[2], [5].",
  },
  harvard: {
    references: [
      "Cool Antarctica (no date) Antarctica and global warming. Available at: https://coolantarctica.com/ (Accessed: 23 July 2020).",
      "Cottrell, S. (2019). The study skills handbook. 5th edn. Red Globe Press.",
      "Thaker, J., Smith, N. and Leiserowitz, A. (2020) ‘Global warming risk perceptions in India’, Risk Analysis, 40(12), pp. 2481–2497. Available at: https://doi.org/10.1111/risa.13574",
    ].join("\n\n"),
    citations: "Study skills can be taught (Cottrell, 2019, p. 23). Thaker, Smith and Leiserowitz (2020, p. 2485) found that risk perceptions vary (Cool Antarctica, no date). Others disagree (Ahmed, 2021).",
  },
};
