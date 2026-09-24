import Form from "next/form";
import { Button } from "@/ui";
import type { Answers } from "@/knowledge/citation/style-finder";
import { page, questions } from "./copy";
import { TOOL_PATH } from "./path";

interface ChoiceQuestionProps<T extends string> {
  name: string;
  legend: string;
  hint?: string;
  options: Record<T, string>;
  value?: T;
}

/** One required question as a group of radio buttons. */
function ChoiceQuestion<T extends string>({ name, legend, hint, options, value }: ChoiceQuestionProps<T>) {
  const hintId = `${name}-hint`;

  return (
    <fieldset aria-describedby={hint ? hintId : undefined} className="grid gap-3">
      <legend className="mb-3 text-subheading font-semibold">{legend}</legend>
      {hint && (
        <p id={hintId} className="-mt-3 text-small text-text-muted">
          {hint}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.entries(options) as [T, string][]).map(([optionValue, label]) => (
          <label
            key={optionValue}
            className="flex min-h-control cursor-pointer items-center gap-3 rounded-control border border-border bg-surface px-3 py-2 has-[:checked]:border-action has-[:checked]:font-medium"
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              defaultChecked={value === optionValue}
              required
              className="size-4 shrink-0 accent-action focus-ring"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

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
      <ChoiceQuestion name="writing" legend={questions.writing.legend} options={questions.writing.options} value={answers.writing} />
      <ChoiceQuestion
        name="field"
        legend={questions.field.legend}
        hint={questions.field.hint}
        options={questions.field.options}
        value={answers.field}
      />
      <ChoiceQuestion name="requirer" legend={questions.requirer.legend} options={questions.requirer.options} value={answers.requirer} />

      <div className="grid gap-2">
        <label htmlFor="region" className="text-subheading font-semibold">
          {region.label} <span className="font-normal text-text-muted">{region.optional}</span>
        </label>
        <p id="region-hint" className="text-small text-text-muted">
          {region.hint}
        </p>
        <select
          id="region"
          name="region"
          defaultValue={answers.region ?? ""}
          aria-describedby="region-hint"
          className="min-h-control w-full rounded-control border border-border-control bg-surface px-3 focus-ring sm:w-auto"
        >
          <option value="">{region.unspecified}</option>
          {Object.entries(region.options).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Button type="submit">{page.submit}</Button>
      </div>
    </Form>
  );
}
