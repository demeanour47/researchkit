import { SelectField, TextField } from "@/ui";
import { METHODOLOGIES, findOption, optionsFor } from "@/knowledge/research";
import { form } from "./copy";

/** The raw text of every project field, exactly as typed. */
export interface ProjectInput {
  researchArea: string;
  topic: string;
  population: string;
  location: string;
  timeContext: string;
  researchAim: string;
  independentVariables: string;
  dependentVariables: string;
  methodology: string;
  philosophy: string;
  approach: string;
}

export const emptyProjectInput: ProjectInput = {
  researchArea: "",
  topic: "",
  population: "",
  location: "",
  timeContext: "",
  researchAim: "",
  independentVariables: "",
  dependentVariables: "",
  methodology: "",
  philosophy: "",
  approach: "",
};

const optionList = (ids: readonly string[]) => ids.map((id) => ({ value: id, label: findOption(id)?.name ?? id }));
const methodologyOptions = optionList(METHODOLOGIES);
const philosophyOptions = optionList(optionsFor("philosophy").map((option) => option.id));
const approachOptions = optionList(optionsFor("approach").map((option) => option.id));

/** The project details form. It collects text only; interpreting it is the knowledge layer's job. */
export function ProjectFields({ input, onChange }: { input: ProjectInput; onChange: (changes: Partial<ProjectInput>) => void }) {
  const text = (field: keyof ProjectInput, label: string, hint: string, multiline = false) =>
    multiline ? (
      <TextField
        id={`project-${field}`}
        label={label}
        hint={hint}
        multiline
        rows={3}
        value={input[field]}
        onChange={(event) => onChange({ [field]: event.target.value })}
      />
    ) : (
      <TextField
        id={`project-${field}`}
        label={label}
        hint={hint}
        value={input[field]}
        onChange={(event) => onChange({ [field]: event.target.value })}
        autoComplete="off"
      />
    );

  const select = (field: "methodology" | "philosophy" | "approach", label: string, options: { value: string; label: string }[]) => (
    <SelectField
      id={`project-${field}`}
      label={label}
      emptyOption={form.notChosen}
      options={options}
      value={input[field]}
      onChange={(event) => onChange({ [field]: event.target.value })}
    />
  );

  return (
    <div className="grid gap-8">
      <div className="grid items-start gap-6 sm:grid-cols-2">
        {text("researchArea", form.researchArea, form.researchAreaHint)}
        {text("topic", form.topic, form.topicHint)}
        {text("population", form.population, form.populationHint)}
        {text("location", form.location, form.locationHint)}
        {text("timeContext", form.timeContext, form.timeContextHint)}
      </div>
      {text("researchAim", form.researchAim, form.researchAimHint, true)}

      <fieldset className="grid gap-4" aria-describedby="variables-hint">
        <legend className="mb-1 text-subheading font-semibold">{form.variablesHeading}</legend>
        <p id="variables-hint" className="text-small text-text-muted">
          {form.variablesHint}
        </p>
        <div className="grid items-start gap-6 sm:grid-cols-2">
          {text("independentVariables", form.independentVariables, form.independentVariablesHint, true)}
          {text("dependentVariables", form.dependentVariables, form.dependentVariablesHint, true)}
        </div>
      </fieldset>

      <fieldset className="grid gap-4" aria-describedby="methodology-hint">
        <legend className="mb-1 text-subheading font-semibold">{form.methodologyHeading}</legend>
        <p id="methodology-hint" className="text-small text-text-muted">
          {form.methodologyHint}
        </p>
        <div className="grid items-start gap-6 sm:grid-cols-3">
          {select("methodology", form.methodology, methodologyOptions)}
          {select("philosophy", form.philosophy, philosophyOptions)}
          {select("approach", form.approach, approachOptions)}
        </div>
      </fieldset>
    </div>
  );
}
