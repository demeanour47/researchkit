import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SAMPLING_QUESTIONS, consistentTechniques, narrowTechniques, validateSamplingAnswers, type SamplingQuestionId } from "./sampling-decision";
import { SAMPLING_TECHNIQUES, SAMPLING_TECHNIQUE_IDS } from "./sampling-types";

describe("SAMPLING_QUESTIONS", () => {
  it("asks the seven decision questions", () => {
    assert.deepEqual(SAMPLING_QUESTIONS.map((question) => question.id), ["probabilityPossible", "completeFrame", "hardToIdentify", "representativeness", "inference", "qualitative", "referral"]);
    for (const question of SAMPLING_QUESTIONS) assert.ok(question.question.endsWith("?"));
  });
});

describe("validateSamplingAnswers", () => {
  it("accepts yes, no and missing answers, and rejects anything else", () => {
    assert.doesNotThrow(() => validateSamplingAnswers({ inference: "yes", qualitative: "no", referral: undefined }));
    assert.throws(() => validateSamplingAnswers({ inference: "maybe" as never }), { message: "Unknown answer to inference: maybe" });
    assert.throws(() => validateSamplingAnswers({ budget: "yes" } as never), { message: "Unknown sampling question: budget" });
  });
});

/** The rule each question applies, written from the techniques' traits independently of the implementation. */
function expectedFit(id: string, question: SamplingQuestionId, answer: "yes" | "no"): boolean {
  const technique = SAMPLING_TECHNIQUES.find((candidate) => candidate.id === id)!;
  const probability = technique.category === "probability";
  const { traits } = technique;
  switch (question) {
    case "probabilityPossible":
      return answer === "yes" || !probability;
    case "completeFrame":
      return answer === "yes" || traits.frame !== "individuals";
    case "hardToIdentify":
      return answer === "no" || traits.hiddenPopulations !== "unsuited";
    case "representativeness":
      return answer === "no" || traits.representativeness === "high";
    case "inference":
      return answer === "no" || probability;
    case "qualitative":
      return answer === "yes" ? traits.qualitative !== "unusual" : traits.qualitative !== "only";
    case "referral":
      return answer === "yes" ? traits.referral !== "no" : traits.referral !== "yes";
  }
}

describe("narrowTechniques", () => {
  it("explains every technique without judging when nothing is answered", () => {
    const narrowing = narrowTechniques({});
    assert.deepEqual(narrowing.map((entry) => entry.technique), [...SAMPLING_TECHNIQUE_IDS]);
    for (const entry of narrowing) assert.deepEqual([entry.fits, entry.differs], [[], []]);
  });

  for (const technique of SAMPLING_TECHNIQUES) {
    it(`judges the ${technique.id} technique against every answer, with an explanation`, () => {
      for (const question of SAMPLING_QUESTIONS) {
        for (const answer of ["yes", "no"] as const) {
          const entry = narrowTechniques({ [question.id]: answer }).find((candidate) => candidate.technique === technique.id)!;
          assert.equal(entry.fits.length === 1, expectedFit(technique.id, question.id, answer), `${technique.id} ${question.id}=${answer}`);
          const [judgement] = [...entry.fits, ...entry.differs];
          assert.ok(judgement.explanation.startsWith(`${technique.name} sampling`), judgement.explanation);
          assert.ok(judgement.explanation.endsWith("."));
        }
      }
    });
  }

  it("explains why cluster sampling still fits without a complete list of individuals", () => {
    const cluster = narrowTechniques({ completeFrame: "no" }).find((entry) => entry.technique === "cluster")!;
    assert.equal(cluster.fits[0].explanation, "Cluster sampling needs a list of groups, such as schools or areas, rather than of every individual.");
  });
});

describe("consistentTechniques", () => {
  it("lists every technique when nothing is answered, never choosing one", () => {
    assert.deepEqual(consistentTechniques({}), [...SAMPLING_TECHNIQUE_IDS]);
  });

  it("keeps only probability techniques when inference is required", () => {
    assert.deepEqual(consistentTechniques({ inference: "yes" }), ["simple-random", "systematic", "stratified", "cluster", "multistage"]);
    assert.deepEqual(consistentTechniques({ inference: "yes", completeFrame: "no" }), ["cluster", "multistage"]);
  });

  it("keeps non-probability techniques when probability sampling isn't possible", () => {
    assert.ok(consistentTechniques({ probabilityPossible: "no" }).every((id) => SAMPLING_TECHNIQUES.find((technique) => technique.id === id)!.category === "non-probability"));
  });

  it("keeps only techniques that allow referrals and suit hidden groups when participants will recruit others in a qualitative study", () => {
    assert.deepEqual(consistentTechniques({ hardToIdentify: "yes", qualitative: "yes", referral: "yes", representativeness: "no" }), [
      "convenience",
      "purposive",
      "judgmental",
      "snowball",
      "volunteer",
      "theoretical",
    ]);
    assert.deepEqual(consistentTechniques({ referral: "no" }).includes("snowball"), false);
  });

  it("can leave no technique when answers conflict", () => {
    assert.deepEqual(consistentTechniques({ inference: "yes", probabilityPossible: "no" }), []);
  });
});
