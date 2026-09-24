import { SelectField, TextField } from "@/ui";
import { METHODOLOGIES, findOption, optionsFor } from "@/knowledge/research";
import { steps } from "./copy";

/** The raw text of each project field this page reads, exactly as typed. */
export interface HypothesisInput {
  researchQuestion: string;
  researchAim: string;
  researchObjectives: string;
  independentVariables: string;
  dependentVariables: string;
  moderatorVariables: string;
  mediatorVariables: string;
  controlVariables: string;
  population: string;
  location: string;
  timeContext: string;
  methodology: string;
  philosophy: string;
  approach: string;
}

export const emptyInput: HypothesisInput = {
  researchQuestion: "",
  researchAim: "",
  researchObjectives: "",
  independentVariables: "",
  dependentVariables: "",
  moderatorVariables: "",
  mediatorVariables: "",
  controlVariables: "",
  population: "",
  location: "",
  timeContext: "",
  methodology: "",
  philosophy: "",
  approach: "",
};

type Change = (changes: Partial<HypothesisInput>) => void;

export function Field({
  field,
  label,
  hint,
  input,
  onChange,
  multiline = false,
}: {
  field: keyof HypothesisInput;
  label: string;
  hint: string;
  input: HypothesisInput;
  onChange: Change;
  multiline?: boolean;
}) {
  const common = { id: `hypothesis-${field}`, label, hint, value: input[field] };
  return multiline ? (
    <TextField {...common} multiline rows={3} onChange={(event) => onChange({ [field]: event.target.value })} />
  ) : (
    <TextField {...common} autoComplete="off" onChange={(event) => onChange({ [field]: event.target.value })} />
  );
}

const optionList = (ids: readonly string[]) => ids.map((id) => ({ value: id, label: findOption(id)?.name ?? id }));

/** Variables, population, context and methodology. */
export function VariableInputs({ input, onChange }: { input: HypothesisInput; onChange: Change }) {
  const field = (name: keyof HypothesisInput, label: string, hint: string, multiline = false) => (
    <Field field={name} label={label} hint={hint} input={input} onChange={onChange} multiline={multiline} />
  );
  const select = (name: "methodology" | "philosophy" | "approach", label: string, options: { value: string; label: string }[]) => (
    <SelectField
      id={`hypothesis-${name}`}
      label={label}
      emptyOption={steps.notChosen}
      options={options}
      value={input[name]}
      onChange={(event) => onChange({ [name]: event.target.value })}
    />
  );
  return (
    <div className="grid gap-8">
      <div className="grid items-start gap-6 sm:grid-cols-2">
        {field("independentVariables", steps.independent, steps.independentHint, true)}
        {field("dependentVariables", steps.dependent, steps.dependentHint, true)}
        {field("moderatorVariables", steps.moderator, steps.moderatorHint, true)}
        {field("mediatorVariables", steps.mediator, steps.mediatorHint, true)}
        {field("controlVariables", steps.control, steps.controlHint, true)}
      </div>
      <fieldset className="grid gap-4">
        <legend className="mb-1 text-subheading font-semibold">{steps.scopeHeading}</legend>
        <div className="grid items-start gap-6 sm:grid-cols-3">
          {field("population", steps.population, steps.populationHint)}
          {field("location", steps.location, steps.locationHint)}
          {field("timeContext", steps.timeContext, steps.timeContextHint)}
        </div>
      </fieldset>
      <fieldset className="grid gap-4" aria-describedby="hypothesis-methodology-hint">
        <legend className="mb-1 text-subheading font-semibold">{steps.methodologyHeading}</legend>
        <p id="hypothesis-methodology-hint" className="text-small text-text-muted">
          {steps.methodologyHint}
        </p>
        <div className="grid items-start gap-6 sm:grid-cols-3">
          {select("methodology", steps.methodology, optionList(METHODOLOGIES))}
          {select("philosophy", steps.philosophy, optionList(optionsFor("philosophy").map((option) => option.id)))}
          {select("approach", steps.approach, optionList(optionsFor("approach").map((option) => option.id)))}
        </div>
      </fieldset>
    </div>
  );
}
