import { Link } from "@/ui";
import { getGuide, guidePath } from "@/domains/publishing";
import { ComparisonMatrix, DecisionTreeView, TeachingFigure } from "@/features/statistics";
import { GUIDE_SLUGS, reference as copy } from "./copy";

function Part({ id, heading, children }: { id: string; heading: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4">
      <h3 id={id} className="text-subheading font-semibold">
        {heading}
      </h3>
      {children}
    </div>
  );
}

/**
 * The reasoning behind the finder, laid out to follow by hand: independent against
 * paired observations, the decision tree and the comparison table. Rendered on the
 * server, so it works without JavaScript.
 */
export function FinderReference() {
  const guides = Object.values(GUIDE_SLUGS).map((slug) => ({ slug, guide: getGuide(slug) }));
  return (
    <section aria-labelledby="reference-title" className="mt-10 grid gap-8 border-t border-border pt-8">
      <div className="grid gap-2">
        <h2 id="reference-title" className="text-heading font-semibold">
          {copy.heading}
        </h2>
        <p className="text-text-muted">{copy.intro}</p>
      </div>
      <Part id="reference-pairing" heading={copy.pairingHeading}>
        <TeachingFigure figure="pairing" />
      </Part>
      <Part id="reference-tree" heading={copy.treeHeading}>
        <DecisionTreeView collapsible />
      </Part>
      <Part id="reference-matrix" heading={copy.matrixHeading}>
        <ComparisonMatrix />
      </Part>
      <Part id="reference-learn" heading={copy.learnHeading}>
        <ul className="grid gap-2">
          {guides.map(({ slug, guide }) =>
            guide ? (
              <li key={slug}>
                <Link href={guidePath(slug)} variant="standalone">
                  {guide.title}
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      </Part>
    </section>
  );
}
