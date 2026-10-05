import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { howToAvoidPlagiarism } from "../../../content/guides/how-to-avoid-plagiarism";
import { howToParaphrase } from "../../../content/guides/how-to-paraphrase";
import { howToWriteALiteratureReview } from "../../../content/guides/how-to-write-a-literature-review";
import { howToStructureAnAcademicEssay } from "../../../content/guides/how-to-structure-an-academic-essay";
import { howToReadAResearchPaper } from "../../../content/guides/how-to-read-a-research-paper";
import { howToManageYourReferences } from "../../../content/guides/how-to-manage-your-references";
import { howToPlanADissertation } from "../../../content/guides/how-to-plan-a-dissertation";
import { LEARN_REFERENCES, STYLE_MANUAL_REFERENCES, GROUP_REFERENCES } from "../../knowledge/research/references";
import { citationProblems, proseOf, tableOf } from "./guide-checks";

// The Learn guides added in Sprint 55 that don't depend on a tool's output. Guides
// that show a tool's output are tested beside that tool.
const KNOWN = [...LEARN_REFERENCES, ...STYLE_MANUAL_REFERENCES, ...GROUP_REFERENCES].map((reference) => reference.id);

describe("How to avoid plagiarism", () => {
  it("cites every source it lists, and lists every source it cites", () => {
    assert.deepEqual(citationProblems(howToAvoidPlagiarism, KNOWN), []);
  });

  it("labels its example source as invented", () => {
    assert.match(proseOf(howToAvoidPlagiarism), /invented for this example, attributed to an invented author, Thapa \(2022\)\. It isn't a real finding/);
  });

  it("treats a similarity score as evidence to read, not a verdict", () => {
    assert.match(proseOf(howToAvoidPlagiarism), /doesn't decide whether plagiarism happened/);
  });
});

describe("How to paraphrase correctly", () => {
  it("cites every source it lists, and lists every source it cites", () => {
    assert.deepEqual(citationProblems(howToParaphrase, KNOWN), []);
  });

  it("labels its example sources as invented", () => {
    const prose = proseOf(howToParaphrase);
    assert.match(prose, /invented for this example, attributed to an invented author, Gurung \(2021\), and isn't a real finding/);
    assert.match(prose, /with three invented studies/);
  });

  it("orders citations to several works alphabetically, as APA does", () => {
    for (const [, group] of proseOf(howToParaphrase).matchAll(/\(((?:[A-Z][a-z]+, \d{4}; )+[A-Z][a-z]+, \d{4})\)/g)) {
      const authors = group.split("; ").map((citation) => citation.split(",")[0]);
      assert.deepEqual(authors, [...authors].sort(), group);
    }
  });
});

describe("How to write a literature review", () => {
  it("cites every source it lists, and lists every source it cites", () => {
    assert.deepEqual(citationProblems(howToWriteALiteratureReview, KNOWN), []);
  });

  it("labels its example studies as invented", () => {
    assert.match(proseOf(howToWriteALiteratureReview), /The studies in this example are invented for illustration; they aren't real research/);
  });

  it("describes PRISMA as a reporting guideline, and the matrix's gaps as prompts", () => {
    const prose = proseOf(howToWriteALiteratureReview);
    assert.match(prose, /PRISMA 2020 is a reporting guideline/);
    assert.match(prose, /It describes how to report a review, not how to conduct one/);
    assert.match(prose, /treat them as prompts to check against a wider search, not as findings/);
  });
});

describe("How to structure an academic essay", () => {
  it("cites every source it lists, and lists every source it cites", () => {
    assert.deepEqual(citationProblems(howToStructureAnAcademicEssay, KNOWN), []);
  });

  it("plans the example essay to its word limit", () => {
    const total = tableOf(howToStructureAnAcademicEssay, "A plan for a 2,000-word essay").rows.reduce((sum, [, , words]) => sum + Number.parseInt(words.replace(",", ""), 10), 0);
    assert.equal(total, 2000);
  });

  it("presents its example thesis and plan as hypothetical, and allocations as one option", () => {
    const prose = proseOf(howToStructureAnAcademicEssay);
    assert.match(prose, /hypothetical example of the form; an essay would need evidence/);
    assert.match(prose, /one reasonable way to divide 2,000 words, not a rule/);
  });
});

describe("How to read a research paper", () => {
  it("cites every source it lists, and lists every source it cites", () => {
    assert.deepEqual(citationProblems(howToReadAResearchPaper, KNOWN), []);
  });

  it("gives Keshav's three passes with his published timings", () => {
    const rows = tableOf(howToReadAResearchPaper, "Keshav's three passes").rows;
    assert.deepEqual(rows.map(([pass, time]) => [pass, time]), [
      ["First", "About five to ten minutes"],
      ["Second", "Up to an hour"],
      ["Third", "About four or five hours for a beginner; about an hour for an experienced reader"],
    ]);
    assert.match(proseOf(howToReadAResearchPaper), /Category \(what type of paper is it\?\), Context .* Correctness .* Contributions .* Clarity/);
  });
});

describe("How to manage your references", () => {
  it("cites nothing it doesn't list", () => {
    assert.deepEqual(citationProblems(howToManageYourReferences, KNOWN), []);
  });

  it("names reference managers without recommending one, and says where workspace data is kept", () => {
    const prose = proseOf(howToManageYourReferences);
    assert.match(prose, /ResearchKit doesn't recommend a particular one/);
    assert.match(prose, /saved only in your browser/);
  });
});

describe("How to plan a dissertation", () => {
  it("cites every source it lists, and lists every source it cites", () => {
    assert.deepEqual(citationProblems(howToPlanADissertation, KNOWN), []);
  });

  it("defers to the programme's regulations and labels its timeline as an example", () => {
    const prose = proseOf(howToPlanADissertation);
    assert.match(prose, /When this guide and your regulations differ, your regulations apply/);
    assert.match(prose, /It is one way to divide the time, not a rule/);
  });
});
