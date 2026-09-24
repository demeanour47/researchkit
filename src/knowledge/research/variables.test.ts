import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addVariable as addBox, applyFramework, frameworkFromProject, setDescription } from "./conceptual-framework";
import { projectOfShape } from "./conceptual-test-helpers";
import { createProjectDraft } from "./research-project";
import { addIndicator, updateVariable } from "./variable-builder";
import { importVariables, mergeImported } from "./variables";
import { EMPTY_FRAMEWORK } from "./conceptual-types";

describe("importVariables", () => {
  it("imports nothing from an empty project", () => {
    assert.deepEqual(importVariables({}), []);
  });

  it("imports every listed variable with its type, remembering where it came from", () => {
    const variables = importVariables(createProjectDraft({ independentVariables: ["screen time"], dependentVariables: ["sleep quality"], controlVariables: ["age"] }));
    assert.deepEqual(
      variables.map((variable) => [variable.id, variable.variableType, variable.sources]),
      [
        ["var-screen-time", "independent", [{ kind: "list", asKind: "independent", references: [] }]],
        ["var-sleep-quality", "dependent", [{ kind: "list", asKind: "dependent", references: [] }]],
        ["var-age", "control", [{ kind: "list", asKind: "control", references: [] }]],
      ],
    );
  });

  it("never invents definitions, indicators or measurement", () => {
    for (const variable of importVariables(projectOfShape({ independent: 2, dependent: 2, mediators: 1, moderators: 1, controls: 1 }))) {
      assert.deepEqual(
        [variable.conceptualDefinition, variable.operationalDefinition, variable.possibleIndicators, variable.measurementLevel, variable.measurementScale, variable.questionnaireItems],
        ["", "", [], null, "", []],
      );
    }
  });

  it("records every hypothesis that names a variable", () => {
    const [predictor] = importVariables(projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0 }));
    assert.deepEqual(predictor.sources[1], { kind: "hypothesis", asKind: "independent", references: ["main-1-1-null", "main-1-1-alternative"] });
  });

  it("imports framework boxes, with their descriptions and short labels", () => {
    let framework = addBox(EMPTY_FRAMEWORK, { name: "Workload", type: "independent", shortLabel: "Load" });
    framework = setDescription(framework, "v-workload", "Hours of assigned work each week.");
    const [workload] = importVariables(applyFramework({}, framework));
    assert.deepEqual([workload.name, workload.shortName, workload.description, workload.sources], [
      "Workload",
      "Load",
      "Hours of assigned work each week.",
      [{ kind: "framework", asKind: "independent", references: ["v-workload"] }],
    ]);
  });

  it("keeps a variable named in several places once, taking its type from the first", () => {
    const project = createProjectDraft({ independentVariables: ["Stress"], dependentVariables: ["stress"] });
    const variables = importVariables(project);
    assert.equal(variables.length, 1);
    assert.equal(variables[0].variableType, "independent");
    assert.deepEqual(variables[0].sources.map((source) => source.asKind), ["independent", "dependent"]);
  });

  it("is deterministic", () => {
    const project = applyFramework(projectOfShape({ independent: 3, dependent: 2, mediators: 2, moderators: 1, controls: 2 }), EMPTY_FRAMEWORK);
    assert.deepEqual(importVariables(project), importVariables(project));
  });
});

describe("importVariables across project shapes", () => {
  for (let independent = 0; independent <= 3; independent++) {
    for (let dependent = 0; dependent <= 3; dependent++) {
      for (let mediators = 0; mediators <= 2; mediators++) {
        for (let moderators = 0; moderators <= 2; moderators++) {
          it(`imports ${independent} IV, ${dependent} DV, ${mediators} mediator(s), ${moderators} moderator(s) and their framework once each`, () => {
            const shape = { independent, dependent, mediators, moderators, controls: (mediators + moderators) % 2 };
            let project = projectOfShape(shape);
            project = applyFramework(project, frameworkFromProject(project));
            const variables = importVariables(project);
            const expected = independent + dependent + mediators + moderators + shape.controls;
            assert.equal(variables.length, expected, "one variable per name");
            assert.equal(new Set(variables.map((variable) => variable.id)).size, expected, "unique ids");
            const count = (kind: string) => variables.filter((variable) => variable.variableType === kind).length;
            assert.deepEqual([count("independent"), count("dependent"), count("mediator"), count("moderator"), count("control")], [independent, dependent, mediators, moderators, shape.controls]);
            for (const variable of variables) {
              assert.equal(variable.sources[0].kind, "list", `${variable.name} starts from the project list`);
              assert.ok(variable.sources.every((source) => source.asKind === variable.variableType), `${variable.name} has consistent types`);
              if (project.conceptualFramework) assert.ok(variable.sources.some((source) => source.kind === "framework"), `${variable.name} is in the framework`);
            }
          });
        }
      }
    }
  }
});

describe("mergeImported", () => {
  const project = projectOfShape({ independent: 1, dependent: 1, mediators: 0, moderators: 0 });

  it("keeps the researcher's edits and adds only new variables", () => {
    let existing = importVariables(project);
    existing = updateVariable(existing, "var-predictor-1", { conceptualDefinition: "Defined by me." });
    existing = addIndicator(existing, "var-predictor-1", { name: "My indicator" });
    const merged = mergeImported(existing, importVariables(createProjectDraft({ ...project, moderatorVariables: ["age"] })));
    assert.deepEqual(merged.map((variable) => variable.name), ["predictor 1", "outcome 1", "age"]);
    assert.equal(merged[0].conceptualDefinition, "Defined by me.");
    assert.equal(merged[0].possibleIndicators.length, 1);
  });

  it("adds new sources to existing variables without repeating them", () => {
    const existing = importVariables(createProjectDraft({ independentVariables: ["predictor 1"] }));
    const merged = mergeImported(existing, importVariables(project));
    assert.deepEqual(merged[0].sources.map((source) => source.kind), ["list", "hypothesis"]);
    assert.deepEqual(mergeImported(merged, importVariables(project)), merged, "merging again changes nothing");
  });

  it("gives an imported variable a new id when its id is already taken by another name", () => {
    const existing = importVariables(createProjectDraft({ independentVariables: ["stress"] })).map((variable) => ({ ...variable, name: "anxiety" }));
    const merged = mergeImported(existing, importVariables(createProjectDraft({ independentVariables: ["stress"] })));
    assert.deepEqual(merged.map((variable) => [variable.id, variable.name]), [["var-stress", "anxiety"], ["var-stress-2", "stress"]]);
  });
});
