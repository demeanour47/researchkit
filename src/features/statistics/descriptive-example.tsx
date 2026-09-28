import { TRAINING_DAYS, trainingSummary } from "@/knowledge/research/test-finder";
import { statisticsCopy } from "./copy";
import { DataTable } from "./data-table";

const copy = statisticsCopy.descriptive;

/** A small dataset and its mean, median, mode and standard deviation, each with its working and meaning. */
export function DescriptiveExample() {
  return (
    <div className="grid gap-4">
      <DataTable id="descriptive-data" caption={copy.dataCaption} columns={[copy.employee, copy.days]} numeric={[true, true]} rows={TRAINING_DAYS.map((days, index) => [index + 1, days])} />
      <DataTable
        id="descriptive-summary"
        caption={copy.summaryCaption}
        columns={[copy.statistic, copy.value, copy.working, copy.meaning]}
        numeric={[false, true, false, false]}
        rows={trainingSummary().map((summary) => [summary.label, summary.value, summary.working, <span key="meaning" className="block max-w-72">{summary.meaning}</span>])}
      />
    </div>
  );
}
