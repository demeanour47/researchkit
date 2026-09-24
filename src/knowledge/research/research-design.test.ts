import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_DESIGN, answerQuestion, chooseDesign, cleanDesignRecord, removeDesign, setDesignNotes, setJustification, shortlistDesign } from "./research-design";

describe("editing the design record", () => {
  it("shortlists designs once each, in the order added, without choosing", () => {
    const record = shortlistDesign(shortlistDesign(shortlistDesign(EMPTY_DESIGN, "survey"), "case-study"), "survey");
    assert.deepEqual(record.shortlist, ["survey", "case-study"]);
    assert.equal(record.chosen, null, "shortlisting never chooses");
  });

  it("chooses a design only when asked, adding it to the shortlist", () => {
    const record = chooseDesign(EMPTY_DESIGN, "correlational");
    assert.deepEqual([record.chosen, record.shortlist], ["correlational", ["correlational"]]);
    assert.equal(chooseDesign(record, null).chosen, null);
  });

  it("removes a design, clearing the choice if it was chosen", () => {
    const record = chooseDesign(shortlistDesign(EMPTY_DESIGN, "survey"), "case-study");
    assert.deepEqual(removeDesign(record, "case-study"), { ...record, shortlist: ["survey"], chosen: null });
    assert.equal(removeDesign(record, "survey").chosen, "case-study");
  });

  it("records a justification, notes and answers", () => {
    let record = setDesignNotes(setJustification(EMPTY_DESIGN, "Because."), "Ask supervisor.");
    record = answerQuestion(answerQuestion(record, "causality", "yes"), "timing", "once");
    assert.deepEqual(record, { chosen: null, shortlist: [], justification: "Because.", notes: "Ask supervisor.", answers: { causality: "yes", timing: "once" } });
    assert.deepEqual(answerQuestion(record, "timing", "unsure").answers, { causality: "yes" });
    assert.deepEqual(answerQuestion(record, "causality", undefined).answers, { timing: "once" });
  });

  it("rejects unknown designs and answers", () => {
    assert.throws(() => shortlistDesign(EMPTY_DESIGN, "delphi" as never), { message: "Unknown research design: delphi" });
    assert.throws(() => chooseDesign(EMPTY_DESIGN, "delphi" as never), RangeError);
    assert.throws(() => answerQuestion(EMPTY_DESIGN, "timing", "weekly"), { message: "Unknown answer to timing: weekly" });
  });

  it("never changes the record it is given", () => {
    const record = shortlistDesign(EMPTY_DESIGN, "survey");
    const copy = structuredClone(record);
    chooseDesign(record, "survey");
    removeDesign(record, "survey");
    answerQuestion(record, "cases", "single");
    assert.deepEqual(record, copy);
  });
});

describe("cleanDesignRecord", () => {
  it("treats an empty record as nothing to store", () => {
    assert.equal(cleanDesignRecord(EMPTY_DESIGN), undefined);
    assert.equal(cleanDesignRecord({ ...EMPTY_DESIGN, justification: "   ", answers: { timing: "unsure" } }), undefined);
  });

  it("trims text, drops unsure answers and repeated designs, and adds the chosen design to the shortlist", () => {
    assert.deepEqual(
      cleanDesignRecord({ chosen: "survey", shortlist: ["case-study", "case-study"], justification: "  Fits   well. ", notes: "", answers: { timing: "unsure", cases: "multiple" } }),
      { chosen: "survey", shortlist: ["case-study", "survey"], justification: "Fits well.", notes: "", answers: { cases: "multiple" } },
    );
  });

  it("keeps line breaks in a justification", () => {
    assert.equal(cleanDesignRecord({ ...EMPTY_DESIGN, justification: "First.\nSecond." })?.justification, "First.\nSecond.");
  });

  it("rejects unknown designs", () => {
    assert.throws(() => cleanDesignRecord({ ...EMPTY_DESIGN, shortlist: ["delphi" as never] }), RangeError);
  });
});
