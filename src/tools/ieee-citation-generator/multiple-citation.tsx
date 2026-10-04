"use client";

import { useMemo, useState } from "react";
import { CopyButton, RadioGroup, TextField, type CopyResult } from "@/ui";
import { Runs, ValidationIssues } from "@/features/citation";
import { formatMultipleCitation, issuesFor, type RangeStyle } from "@/knowledge/citation/ieee";
import { copySubjects, multiple, output, type CopyTarget } from "./copy";
import { copyText } from "./copy-texts";

const rangeOptions = (Object.entries(multiple.ranges) as [RangeStyle, string][]).map(([value, label]) => ({ value, label }));

/** A citation of several references by number alone. No source details are needed. */
export function MultipleCitation({ onCopy }: { onCopy: (target: CopyTarget, result: CopyResult) => void }) {
  const [numbers, setNumbers] = useState("");
  const [ranges, setRanges] = useState<RangeStyle>("written-out");
  const citation = useMemo(() => (numbers.trim() ? formatMultipleCitation(numbers, ranges) : null), [numbers, ranges]);
  const issues = citation ? issuesFor(citation.notes) : [];
  const texts = citation?.runs ? copyText(citation.runs) : null;

  return (
    <section aria-labelledby="ieee-multiple-title" className="grid min-w-0 gap-4 border-t border-border pt-8">
      <h2 id="ieee-multiple-title" className="text-heading font-semibold">
        {multiple.heading}
      </h2>
      <p className="text-small text-text-muted">{multiple.intro}</p>
      <TextField id="ieee-multiple-numbers" label={multiple.label} hint={multiple.hint} value={numbers} onChange={(event) => setNumbers(event.target.value)} autoComplete="off" />
      <RadioGroup name="ieee-ranges" legend={multiple.rangesLegend} options={rangeOptions} value={ranges} onChange={setRanges} />
      <div className="grid min-w-0 gap-2 rounded-panel border border-border bg-surface p-4">
        <h3 className="text-small text-text-muted">{multiple.output}</h3>
        {citation?.runs && texts ? (
          <>
            <p id="ieee-multiple-text" className="wrap-anywhere text-heading">
              <Runs runs={citation.runs} />
            </p>
            <div>
              <CopyButton text={texts.text} html={texts.html} subject={copySubjects.multiple} selectOnFailure="ieee-multiple-text" onResult={(result) => onCopy("multiple", result)} />
            </div>
          </>
        ) : (
          <p className="text-text-muted">{multiple.empty}</p>
        )}
      </div>
      <ValidationIssues issues={issues} headingId="ieee-multiple-issues-title" headingLevel={3} labels={{ heading: multiple.issuesHeading, severity: output.severity, action: output.action }} />
    </section>
  );
}
