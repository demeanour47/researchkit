import { getAnalysisMethod } from "@/knowledge/research/data-analysis-types";
import { STRUCTURE_DIAGRAMS, TEST_PROFILES, alternativesFor, assumptionCheckerCovers, assumptionsFor, getWorkedExample, type ProfiledTest } from "@/knowledge/research/test-finder";
import { statisticsCopy } from "./copy";
import { StructureDiagramView } from "./figures";
import { FormulaList } from "./formula-list";

const copy = statisticsCopy.profile;

function Block({ heading, children, level }: { heading: string; children: React.ReactNode; level: 4 | 5 }) {
  const Heading = `h${level}` as const;
  return (
    <div className="grid content-start gap-1.5">
      <Heading className="font-semibold">{heading}</Heading>
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
 * Everything a student needs about one test: the question it answers, the data it needs,
 * a diagram of its variables, its hypotheses, assumptions, alternatives, common mistakes
 * and how to introduce a result. Read from the knowledge layer, so the guide and the tool
 * say the same thing.
 */
export function TestProfileView({ test, level = 3 }: { test: ProfiledTest; level?: 3 | 4 }) {
  const profile = TEST_PROFILES[test];
  const method = getAnalysisMethod(test);
  const Heading = `h${level}` as const;
  const inner = level === 3 ? 4 : 5;
  const example = getWorkedExample(profile.example);
  return (
    <section id={`test-${test}`} aria-labelledby={`test-${test}-title`} className="grid gap-5 rounded-panel border border-border bg-surface p-4 sm:p-6">
      <div className="grid gap-1">
        <Heading id={`test-${test}-title`} className="text-subheading font-semibold">
          {method.name}
        </Heading>
        <p>{method.purpose}</p>
      </div>

      <Block heading={copy.answers} level={inner}>
        <p className="text-small">{profile.answers}</p>
      </Block>

      <Block heading={copy.structure} level={inner}>
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
      </Block>

      <StructureDiagramView diagram={STRUCTURE_DIAGRAMS[profile.diagram]} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Block heading={copy.fits} level={inner}>
          <p className="text-small">{profile.fits}</p>
        </Block>
        <Block heading={copy.whyNot} level={inner}>
          <Bullets items={profile.whyNot.map((entry) => `${getAnalysisMethod(entry.method).name}: ${entry.reason}`)} />
        </Block>
      </div>

      <Block heading={copy.hypotheses} level={inner}>
        <dl className="grid gap-1 text-small">
          <dt className="font-medium">{copy.nullHypothesis}</dt>
          <dd>{profile.nullHypothesis}</dd>
          <dt className="font-medium">{copy.alternativeHypothesis}</dt>
          <dd>{profile.alternativeHypothesis}</dd>
        </dl>
      </Block>

      <Block heading={copy.assumptions} level={inner}>
        <ul className="grid gap-1 text-small">
          {assumptionsFor(test).map((assumption) => (
            <li key={assumption.name}>
              <span className="font-medium">{assumption.name}</span>
              {assumption.statement && <span className="text-text-muted">: {assumption.statement}</span>}
            </li>
          ))}
        </ul>
        {!assumptionCheckerCovers(test) && <p className="text-caption text-text-muted">{copy.notCovered}</p>}
      </Block>

      <Block heading={copy.example} level={inner}>
        <p className="text-small">
          <a href={`#example-${example.id}`} className="text-action underline underline-offset-4 focus-ring">
            {example.question}
          </a>
        </p>
      </Block>

      <div className="grid gap-4 sm:grid-cols-2">
        <Block heading={copy.limitations} level={inner}>
          <Bullets items={method.limitations} />
        </Block>
        <Block heading={copy.alternatives} level={inner}>
          <Bullets items={alternativesFor(test).map((alternative) => `${alternative.name}: ${alternative.when}`)} />
        </Block>
      </div>

      <Block heading={copy.mistakes} level={inner}>
        <Bullets items={profile.mistakes} />
      </Block>

      <Block heading={copy.reporting} level={inner}>
        <p className="text-small">{profile.reporting}</p>
      </Block>

      {profile.formulas.length > 0 && (
        <Block heading={copy.formulas} level={inner}>
          <FormulaList formulas={profile.formulas} />
        </Block>
      )}
    </section>
  );
}
