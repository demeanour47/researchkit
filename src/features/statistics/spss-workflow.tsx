/** A numbered, text-first representation of the SPSS analysis workflow. */
export function SpssWorkflow({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => (
        <li key={`${index}-${step}`} className="grid min-w-0 grid-cols-[2rem_1fr] items-start gap-3 rounded-panel border border-border bg-surface p-4">
          <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-pill border border-border-strong font-semibold tabular-nums">{index + 1}</span>
          <span className="pt-1 font-medium">{step}</span>
        </li>
      ))}
    </ol>
  );
}