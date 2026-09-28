import { Card, Icon, Link, Tag } from "@/ui";
import { guidePath } from "@/domains/publishing";
import { StructureDiagramView } from "@/features/statistics";
import { getAnalysisMethod } from "@/knowledge/research/data-analysis-types";
import {
  FIT_LABELS,
  STRUCTURE_DIAGRAMS,
  TEST_PROFILES,
  alternativesFor,
  assumptionCheckerCovers,
  assumptionsFor,
  getWorkedExample,
  interpreterCovers,
  isProfiledTest,
  type CandidateTest,
  type FinderFit,
} from "@/knowledge/research/test-finder";
import { SPSS_PROCEDURE_METHODS } from "@/knowledge/research/spss-procedures";
import { TOOL_PATH as CHECKER_PATH } from "@/tools/statistical-assumption-checker/path";
import { TOOL_PATH as INTERPRETER_PATH } from "@/tools/results-interpretation/path";
import { TOOL_PATH as SPSS_LAB_PATH } from "@/tools/spss-research-lab/path";
import { GUIDE_SLUGS, results as copy } from "./copy";

/** Visual emphasis only; the fit is always written out in words. */
const TONES: Readonly<Record<FinderFit, "info" | "neutral" | "caution">> = { common: "info", also: "neutral", justify: "caution" };

function Part({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="grid content-start gap-1.5">
      <h4 className="text-small font-semibold">{heading}</h4>
      {children}
    </div>
  );
}

const Bullets = ({ items }: { items: readonly string[] }) => (
  <ul className="grid list-disc gap-1 ps-5 text-small marker:text-text-muted">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

/**
 * One candidate test: what it answers, why it may fit this situation, the data it needs
 * and how its variables are arranged, the assumptions to check, why a similar test may
 * not fit, an example, alternatives, and where to go next.
 */
export function CandidateCard({ candidate }: { candidate: CandidateTest }) {
  const method = getAnalysisMethod(candidate.method);
  const profile = isProfiledTest(candidate.method) ? TEST_PROFILES[candidate.method] : null;
  const alternatives = alternativesFor(candidate.method).slice(0, 3);
  const titleId = `candidate-${candidate.method}-title`;

  return (
    <Card as="article" aria-labelledby={titleId} className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 id={titleId} className="text-subheading font-semibold">
          {method.name}
        </h3>
        <Tag tone={TONES[candidate.fit]}>{FIT_LABELS[candidate.fit]}</Tag>
      </div>

      <Part heading={copy.answers}>
        <p className="text-small">{profile?.answers ?? method.purpose}</p>
      </Part>

      <Part heading={copy.why}>
        <Bullets items={candidate.why} />
      </Part>

      {candidate.caution && (
        <p className="flex items-start gap-2 rounded-control border border-border bg-sunken px-3 py-2 text-small">
          <Icon name="alert" className="mt-[0.2em] shrink-0 text-warning" />
          <span>{candidate.caution}</span>
        </p>
      )}

      {profile && (
        <Part heading={copy.structure}>
          <dl className="grid gap-1 text-small sm:grid-cols-[max-content_1fr] sm:gap-x-4">
            <dt className="font-medium">{copy.outcome}</dt>
            <dd>{profile.structure.outcome}</dd>
            <dt className="font-medium">{copy.predictor}</dt>
            <dd>{profile.structure.predictor}</dd>
            <dt className="font-medium">{copy.groups}</dt>
            <dd>{profile.structure.groups}</dd>
            <dt className="font-medium">{copy.pairing}</dt>
            <dd>{profile.structure.pairing}</dd>
          </dl>
        </Part>
      )}

      {profile && (
        <details open={candidate.fit === "common"} className="rounded-control border border-border">
          <summary className="cursor-pointer rounded-control px-3 py-2 text-small font-semibold focus-ring">{copy.diagram}</summary>
          <div className="p-3">
            <StructureDiagramView diagram={STRUCTURE_DIAGRAMS[profile.diagram]} />
          </div>
        </details>
      )}

      <Part heading={copy.assumptions}>
        <Bullets items={assumptionsFor(candidate.method).map((assumption) => (assumption.statement ? `${assumption.name}: ${assumption.statement}` : assumption.name))} />
        {!assumptionCheckerCovers(candidate.method) && <p className="text-caption text-text-muted">{copy.checkerMissing}</p>}
      </Part>

      {method.limitations.length > 0 && (
        <Part heading={copy.limitations}>
          <Bullets items={method.limitations} />
        </Part>
      )}

      {profile && (
        <Part heading={copy.reporting}>
          <p className="text-small">{profile.reporting}</p>
        </Part>
      )}

      {profile && (
        <Part heading={copy.whyNot}>
          <Bullets items={profile.whyNot.map((entry) => `${getAnalysisMethod(entry.method).name}: ${entry.reason}`)} />
        </Part>
      )}

      {profile && (
        <Part heading={copy.example}>
          <p className="text-small">“{getWorkedExample(profile.example).question}”</p>
        </Part>
      )}

      {alternatives.length > 0 && (
        <Part heading={copy.alternatives}>
          <Bullets items={alternatives.map((alternative) => `${alternative.name}: ${alternative.when}`)} />
        </Part>
      )}

      <ul className="grid gap-2 border-t border-border pt-4 text-small">
        {SPSS_PROCEDURE_METHODS.includes(candidate.method) && (
          <li>
            <Link href={SPSS_LAB_PATH} variant="standalone">
              {copy.spssProcedure(method.name)}
            </Link>
          </li>
        )}
        <li>
          {profile ? (
            <Link href={`${guidePath(GUIDE_SLUGS.choosing)}#test-${candidate.method}`} variant="standalone">
              {copy.learnMore(method.name)}
            </Link>
          ) : (
            <Link href={guidePath(GUIDE_SLUGS.choosing)} variant="standalone">
              {copy.learnChoosing}
            </Link>
          )}
        </li>
        {assumptionCheckerCovers(candidate.method) && (
          <li>
            <Link href={CHECKER_PATH} variant="standalone">
              {copy.checkAssumptions(method.name)}
            </Link>
          </li>
        )}
        {interpreterCovers(candidate.method) && (
          <li>
            <Link href={INTERPRETER_PATH} variant="standalone">
              {copy.interpret(method.name)}
            </Link>
          </li>
        )}
      </ul>
    </Card>
  );
}
