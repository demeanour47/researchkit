import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addIndicator,
  addVariable,
  changeVariableKind,
  createVariable,
  deleteIndicator,
  deleteVariable,
  duplicateVariable,
  moveIndicator,
  renameVariable,
  updateIndicator,
  updateVariable,
} from "./variable-builder";
import type { ProjectVariable } from "./variable-types";

const base = (): ProjectVariable[] => addVariable(addVariable([], "Screen time", "independent"), "Sleep quality", "dependent");
const withIndicators = () => {
  let variables = base();
  for (const name of ["Weekday hours", "Weekend hours", "Late-night use"]) variables = addIndicator(variables, "var-screen-time", { name });
  return variables;
};

describe("createVariable and addVariable", () => {
  it("creates a variable with only a name, a type and its origin, everything else unknown", () => {
    assert.deepEqual(createVariable("  Screen   time ", "independent", new Set()), {
      id: "var-screen-time",
      name: "Screen time",
      shortName: "Screen time",
      description: "",
      variableType: "independent",
      measurementLevel: null,
      measurementScale: "",
      conceptualDefinition: "",
      operationalDefinition: "",
      possibleIndicators: [],
      questionnaireItems: [],
      notes: "",
      sources: [{ kind: "user", asKind: "independent", references: [] }],
    });
  });

  it("gives every variable a unique id", () => {
    const variables = addVariable(addVariable([], "Stress", "independent"), "stress", "dependent");
    assert.deepEqual(variables.map((variable) => variable.id), ["var-stress", "var-stress-2"]);
  });

  it("rejects an empty name and an unknown type", () => {
    assert.throws(() => addVariable([], "  ", "independent"), { name: "RangeError", message: "A variable needs a name." });
    assert.throws(() => addVariable([], "x", "latent" as never), { message: "Unknown variable type: latent" });
  });
});

describe("editing variables", () => {
  it("renames a variable, keeping its id, and updates a default short name", () => {
    const renamed = renameVariable(base(), "var-screen-time", "Daily screen time");
    assert.deepEqual([renamed[0].id, renamed[0].name, renamed[0].shortName], ["var-screen-time", "Daily screen time", "Daily screen time"]);
  });

  it("keeps a custom short name when renaming, and restores the default when it is emptied", () => {
    const custom = updateVariable(base(), "var-screen-time", { shortName: "ST" });
    assert.equal(renameVariable(custom, "var-screen-time", "Daily screen time")[0].shortName, "ST");
    assert.equal(updateVariable(custom, "var-screen-time", { shortName: " " })[0].shortName, "Screen time");
  });

  it("changes the type", () => {
    assert.equal(changeVariableKind(base(), "var-screen-time", "confounding")[0].variableType, "confounding");
    assert.throws(() => changeVariableKind(base(), "var-screen-time", "x" as never), RangeError);
  });

  it("updates definitions, measurement and items", () => {
    const [variable] = updateVariable(base(), "var-screen-time", {
      conceptualDefinition: "Time spent using devices with screens.",
      operationalDefinition: "Hours reported in a seven-day diary.",
      measurementLevel: "ratio",
      measurementScale: "Hours per day, 0 to 24",
      questionnaireItems: ["How many hours did you use a screen yesterday?"],
      notes: "Check diary compliance.",
    });
    assert.equal(variable.measurementLevel, "ratio");
    assert.deepEqual(variable.questionnaireItems, ["How many hours did you use a screen yesterday?"]);
    assert.throws(() => updateVariable(base(), "var-screen-time", { measurementLevel: "quantum" as never }), { message: "Unknown measurement level: quantum" });
  });

  it("deletes a variable", () => {
    assert.deepEqual(deleteVariable(base(), "var-screen-time").map((variable) => variable.id), ["var-sleep-quality"]);
  });

  it("rejects unknown variables", () => {
    for (const edit of [
      () => renameVariable(base(), "var-x", "x"),
      () => deleteVariable(base(), "var-x"),
      () => updateVariable(base(), "var-x", {}),
      () => duplicateVariable(base(), "var-x"),
      () => addIndicator(base(), "var-x", { name: "x" }),
    ]) {
      assert.throws(edit, { name: "RangeError", message: "Unknown variable: var-x" });
    }
  });

  it("never changes the list it is given", () => {
    const original = withIndicators();
    const copy = structuredClone(original);
    renameVariable(original, "var-screen-time", "Other");
    duplicateVariable(original, "var-screen-time");
    moveIndicator(original, "var-screen-time", "var-screen-time-ind-1", 2);
    deleteIndicator(original, "var-screen-time", "var-screen-time-ind-1");
    assert.deepEqual(original, copy);
  });
});

describe("duplicateVariable", () => {
  it("copies details and indicators after the original, with new ids and a copy name", () => {
    const source = updateVariable(withIndicators(), "var-screen-time", { measurementLevel: "ratio" });
    const duplicated = duplicateVariable(source, "var-screen-time");
    assert.deepEqual(duplicated.map((variable) => variable.name), ["Screen time", "Screen time (copy)", "Sleep quality"]);
    const copy = duplicated[1];
    assert.equal(copy.id, "var-screen-time-copy");
    assert.equal(copy.measurementLevel, "ratio");
    assert.deepEqual(copy.possibleIndicators.map((indicator) => indicator.id), ["var-screen-time-copy-ind-1", "var-screen-time-copy-ind-2", "var-screen-time-copy-ind-3"]);
    assert.deepEqual(copy.sources, [{ kind: "user", asKind: "independent", references: ["var-screen-time"] }]);
  });

  it("numbers further copies", () => {
    const twice = duplicateVariable(duplicateVariable(base(), "var-screen-time"), "var-screen-time");
    assert.deepEqual(twice.map((variable) => variable.name), ["Screen time", "Screen time (copy 2)", "Screen time (copy)", "Sleep quality"]);
  });
});

describe("indicators", () => {
  it("adds indicators with increasing ids and unknown details", () => {
    const [variable] = withIndicators();
    assert.deepEqual(variable.possibleIndicators.map((indicator) => [indicator.id, indicator.name, indicator.level]), [
      ["var-screen-time-ind-1", "Weekday hours", null],
      ["var-screen-time-ind-2", "Weekend hours", null],
      ["var-screen-time-ind-3", "Late-night use", null],
    ]);
  });

  it("never reuses an indicator id after a deletion", () => {
    const after = addIndicator(deleteIndicator(withIndicators(), "var-screen-time", "var-screen-time-ind-3"), "var-screen-time", { name: "Gaming hours" });
    assert.equal(after[0].possibleIndicators[2].id, "var-screen-time-ind-3");
    const middle = addIndicator(deleteIndicator(withIndicators(), "var-screen-time", "var-screen-time-ind-2"), "var-screen-time", { name: "Gaming hours" });
    assert.equal(middle[0].possibleIndicators[2].id, "var-screen-time-ind-4");
  });

  it("updates an indicator's name, measurement, scale and level", () => {
    const [variable] = updateIndicator(withIndicators(), "var-screen-time", "var-screen-time-ind-1", {
      name: " Weekday screen hours ",
      measurement: "Diary",
      scale: "0 to 24 hours",
      level: "ratio",
    });
    assert.deepEqual(variable.possibleIndicators[0], {
      id: "var-screen-time-ind-1",
      name: "Weekday screen hours",
      description: "",
      measurement: "Diary",
      scale: "0 to 24 hours",
      level: "ratio",
    });
  });

  it("rejects an indicator without a name, an unknown level or an unknown indicator", () => {
    assert.throws(() => addIndicator(base(), "var-screen-time", { name: " " }), { message: "An indicator needs a name." });
    assert.throws(() => updateIndicator(withIndicators(), "var-screen-time", "var-screen-time-ind-1", { name: "" }), { message: "An indicator needs a name." });
    assert.throws(() => addIndicator(base(), "var-screen-time", { name: "x", level: "x" as never }), RangeError);
    assert.throws(() => deleteIndicator(withIndicators(), "var-screen-time", "x"), { message: "Unknown indicator: x" });
  });

  it("reorders indicators, clamping to the list", () => {
    const order = (variables: ProjectVariable[]) => variables[0].possibleIndicators.map((indicator) => indicator.name);
    assert.deepEqual(order(moveIndicator(withIndicators(), "var-screen-time", "var-screen-time-ind-3", 0)), ["Late-night use", "Weekday hours", "Weekend hours"]);
    assert.deepEqual(order(moveIndicator(withIndicators(), "var-screen-time", "var-screen-time-ind-1", 1)), ["Weekend hours", "Weekday hours", "Late-night use"]);
    assert.deepEqual(order(moveIndicator(withIndicators(), "var-screen-time", "var-screen-time-ind-1", 99)), ["Weekend hours", "Late-night use", "Weekday hours"]);
    assert.deepEqual(order(moveIndicator(withIndicators(), "var-screen-time", "var-screen-time-ind-2", -5)), ["Weekend hours", "Weekday hours", "Late-night use"]);
  });
});
