import { getAnalysisMethod, type AnalysisMethodId } from "@/knowledge/research/data-analysis-types";
import { assumptionsFor, isProfiledTest, TEST_PROFILES } from "@/knowledge/research/test-finder";
import { getSpssProcedure } from "@/knowledge/research/spss-procedures";
import { DataTable } from "./data-table";

const list = (items: readonly string[]) => (
  <ul className="grid list-disc gap-1 ps-5 text-small marker:text-text-muted">
    {items.map((item) => <li key={item}>{item}</li>)}
  </ul>
);

/** The SPSS implementation reference for a test already selected by ResearchKit. */
export function SpssProcedureView({ method }: { method: AnalysisMethodId }) {
  const analysis = getAnalysisMethod(method);
  const procedure = getSpssProcedure(method);
  const profile = isProfiledTest(method) ? TEST_PROFILES[method] : null;

  return (
    <article aria-labelledby={`spss-${method}-title`} className="grid min-w-0 gap-5 rounded-panel border border-border bg-surface p-4 sm:p-6">
      <div className="grid gap-1">
        <h3 id={`spss-${method}-title`} className="text-subheading font-semibold">{analysis.name}</h3>
        <p>{analysis.purpose}</p>
        <p className="text-small text-text-muted">{profile?.fits ?? analysis.suitableWhen}</p>
      </div>

      {profile && profile.whyNot.length > 0 && (
        <div className="grid gap-2">
          <h4 className="font-semibold">Why not another test?</h4>
          {list(profile.whyNot.map((alternative) => `${getAnalysisMethod(alternative.method).name}: ${alternative.reason}`))}
        </div>
      )}

      <div className="grid gap-2">
        <h4 className="font-semibold">SPSS procedure</h4>
        <p>{procedure.procedure}</p>
        <ol aria-label="SPSS menu path" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small">
          {procedure.menu.map((part, index) => (
            <li key={`${part}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">›</span>}
              <span>{part}</span>
            </li>
          ))}
        </ol>
        <p className="text-caption text-text-muted">{procedure.editionNote}</p>
        <a className="text-small text-action underline underline-offset-4 focus-ring" href={procedure.source} target="_blank" rel="noreferrer">
          Verify this procedure in IBM SPSS Statistics 32 documentation
        </a>
      </div>

      <div className="grid gap-2">
        <h4 className="font-semibold">Variable placement</h4>
        {list(procedure.variables.map((entry) => `${entry.role}: ${entry.requirement}`))}
      </div>

      <div className="grid gap-2">
        <h4 className="font-semibold">Options and output</h4>
        {list(procedure.options)}
        <DataTable caption={`${analysis.name}: output to inspect`} columns={["SPSS output", "What to inspect"]} rows={procedure.output.map((entry) => [entry.table, entry.inspect])} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid content-start gap-1">
          <h4 className="font-semibold">Assumptions</h4>
          {list(assumptionsFor(method).map((assumption) => assumption.statement ? `${assumption.name}: ${assumption.statement}` : assumption.name))}
        </div>
        <div className="grid content-start gap-1">
          <h4 className="font-semibold">Effect size</h4>
          <p className="text-small">{procedure.effectSize}</p>
        </div>
      </div>

      <div className="grid gap-1 border-t border-border pt-4">
        <h4 className="font-semibold">Reporting</h4>
        <p className="text-small">{procedure.report}</p>
        <p className="text-small text-text-muted">{procedure.interpretation}</p>
      </div>
    </article>
  );
}