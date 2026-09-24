import Form from "next/form";
import { Button, RadioGroup, SelectField, type RadioOption } from "@/ui";
import type { Answers } from "@/knowledge/citation/style-finder";
import { page, questions } from "./copy";
import { TOOL_PATH } from "./path";

/** Options from a label map, usable by both radio groups and drop-down lists. */
const optionsOf = <T extends string>(labels: Record<T, string>): (RadioOption<T> & { label: string })[] =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));

export interface StyleFinderFormProps {
  /** Previous answers, so the form shows what the result was based on. */
  answers: Partial<Answers>;
}

/**
 * The finder's questions. Submits as a plain GET form, so it works without
 * scripts and every result has a shareable address.
 */
export function StyleFinderForm({ answers }: StyleFinderFormProps) {
  const region = questions.region;

  return (
    <Form action={TOOL_PATH} className="grid gap-8">
      <RadioGroup
        name="writing"
        legend={questions.writing.legend}
        options={optionsOf(questions.writing.options)}
        defaultValue={answers.writing}
        required
      />
      <RadioGroup
        name="field"
        legend={questions.field.legend}
        hint={questions.field.hint}
        options={optionsOf(questions.field.options)}
        defaultValue={answers.field}
        required
      />
      <RadioGroup
        name="requirer"
        legend={questions.requirer.legend}
        options={optionsOf(questions.requirer.options)}
        defaultValue={answers.requirer}
        required
      />

      <SelectField
        id="region"
        name="region"
        labelStyle="question"
        label={
          <>
            {region.label} <span className="font-normal text-text-muted">{region.optional}</span>
          </>
        }
        hint={region.hint}
        emptyOption={region.unspecified}
        options={optionsOf(region.options)}
        defaultValue={answers.region ?? ""}
      />

      <div>
        <Button type="submit">{page.submit}</Button>
      </div>
    </Form>
  );
}
