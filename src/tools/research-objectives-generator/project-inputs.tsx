import { TextField } from "@/ui";
import { form } from "./copy";

/** The raw text of each project field this page reads, exactly as typed. */
export interface ObjectivesInput {
  researchQuestion: string;
  topic: string;
  population: string;
  location: string;
  timeContext: string;
  independentVariables: string;
  dependentVariables: string;
}

export const emptyInput: ObjectivesInput = {
  researchQuestion: "",
  topic: "",
  population: "",
  location: "",
  timeContext: "",
  independentVariables: "",
  dependentVariables: "",
};

type Change = (changes: Partial<ObjectivesInput>) => void;

function Field({
  field,
  label,
  hint,
  input,
  onChange,
  multiline = false,
}: {
  field: keyof ObjectivesInput;
  label: string;
  hint: string;
  input: ObjectivesInput;
  onChange: Change;
  multiline?: boolean;
}) {
  const common = { id: `objectives-${field}`, label, hint, value: input[field] };
  return multiline ? (
    <TextField {...common} multiline rows={3} onChange={(event) => onChange({ [field]: event.target.value })} />
  ) : (
    <TextField {...common} autoComplete="off" onChange={(event) => onChange({ [field]: event.target.value })} />
  );
}

/** Topic, population, context and variables: everything the draft objective is built from besides the verb. */
export function ProjectDetailInputs({ input, onChange }: { input: ObjectivesInput; onChange: Change }) {
  const field = (name: keyof ObjectivesInput, label: string, hint: string, multiline = false) => (
    <Field field={name} label={label} hint={hint} input={input} onChange={onChange} multiline={multiline} />
  );
  return (
    <div className="grid gap-6">
      <div className="grid items-start gap-6 sm:grid-cols-2">
        {field("topic", form.topic, form.topicHint)}
        {field("population", form.population, form.populationHint)}
        {field("location", form.location, form.locationHint)}
        {field("timeContext", form.timeContext, form.timeContextHint)}
      </div>
      <div className="grid items-start gap-6 sm:grid-cols-2">
        {field("independentVariables", form.independentVariables, form.independentVariablesHint, true)}
        {field("dependentVariables", form.dependentVariables, form.dependentVariablesHint, true)}
      </div>
    </div>
  );
}
