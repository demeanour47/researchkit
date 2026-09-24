import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_SAMPLE_SIZE_PLAN, calculateSampleSize, chooseMethod, parseNumber, updateInputs } from "../../knowledge/research";
import { announcements, numberError, resultSentence } from "./announcements";

describe("announcements", () => {
  it("names the method chosen and whether it is calculated", () => {
    assert.equal(announcements.methodChosen("Cochran formula", true), "Method chosen: Cochran formula. The working has been recalculated.");
    assert.equal(announcements.methodChosen("Power analysis", false), "Method chosen: Power analysis. It isn't calculated here; the result section explains why.");
    assert.equal(announcements.populationType(true), "Known population size. Enter the number of people in your population.");
    assert.equal(announcements.rateUsed("65"), "Response rate set to 65% from your sampling plan.");
    assert.equal(announcements.copied("Sample size report"), "Sample size report copied.");
  });
});

describe("numberError", () => {
  it("accepts numbers as people type them, and empty optional fields", () => {
    assert.equal(numberError("1,200", parseNumber, true), null);
    assert.equal(numberError("70%", parseNumber, false), null);
    assert.equal(numberError("", parseNumber, false), null);
  });

  it("asks for a number when a required field is empty or unreadable", () => {
    assert.equal(numberError("", parseNumber, true), "Enter a number.");
    assert.equal(numberError("   ", parseNumber, true), "Enter a number.");
    assert.equal(numberError("about 50", parseNumber, false), "Enter a number.");
  });
});

describe("resultSentence", () => {
  it("states the result as following from the assumptions", () => {
    const plan = updateInputs(DEFAULT_SAMPLE_SIZE_PLAN, { responseRate: 50 });
    assert.equal(resultSentence(calculateSampleSize(plan)), "With these assumptions, the sample size is 385. Invite 770 to expect about 385 responses.");
    assert.equal(resultSentence(calculateSampleSize(DEFAULT_SAMPLE_SIZE_PLAN)), "With these assumptions, the sample size is 385.");
  });

  it("says nothing was calculated for power analysis", () => {
    assert.equal(resultSentence(calculateSampleSize(chooseMethod(DEFAULT_SAMPLE_SIZE_PLAN, "power-analysis"))), "No sample size calculated.");
  });
});
