import { Link, cardClasses, cx } from "@/ui";
import { getStyleProfile, stylePath, type GuideBlock } from "@/domains/publishing";
import { ReferenceList } from "@/features/research/reference-list";
import { TitleExamples } from "@/features/research/title-examples";
import { CITATION_STYLES, styleTitle } from "@/knowledge/citation/styles";
import { getReference } from "@/knowledge/research/references";
import { TITLE_EXAMPLES } from "@/knowledge/research/title/examples";
import { TITLE_PATTERNS } from "@/knowledge/research/title/patterns";

const labels = {
  definedBy: "Defined by:",
  usedIn: "Commonly used in:",
  examples: { weak: "Weak title", whyWeak: "Why it is weak", stronger: "What a stronger title has", academic: "Academic explanation", example: "A stronger example", nepal: "Nepal", global: "Global" },
} as const;

/**
 * Renders one block of editorial content. Style entries use level-3 headings,
 * so they belong inside a section headed at level 2.
 */
export function ContentBlock({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className={cx("grid gap-2.5 ps-6 marker:text-action", block.ordered ? "list-decimal marker:font-semibold" : "list-disc")}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      );
    }
    case "styles":
      return (
        <div className="grid gap-4">
          {block.styles.map((style) => {
            const profile = getStyleProfile(style);
            return (
              <div key={style} className={cx(cardClasses(), "grid gap-1.5")}>
                <h3 className="text-subheading font-semibold">
                  <Link href={stylePath(style)}>{styleTitle(style)}</Link>
                </h3>
                <p className="text-small text-text-muted">
                  {labels.definedBy} {CITATION_STYLES[style].authority}
                </p>
                <p>
                  <span className="font-medium">{labels.usedIn}</span> {profile.usedIn}
                </p>
                <p>{profile.summary}</p>
              </div>
            );
          })}
        </div>
      );
    case "references":
      return <ReferenceList references={block.ids.map(getReference).sort((a, b) => a.apa.localeCompare(b.apa))} />;
    case "title-examples":
      return <TitleExamples examples={TITLE_EXAMPLES.filter((example) => !block.region || example.region === block.region)} showStronger labels={labels.examples} />;
    case "title-patterns":
      return (
        <dl className="grid gap-3">
          {TITLE_PATTERNS.map((pattern) => (
            <div key={pattern.id} className={cx(cardClasses({ padding: "sm" }), "grid gap-1")}>
              <dt className="font-semibold">{pattern.name}</dt>
              <dd className="text-small text-text-muted">{pattern.explanation}</dd>
            </div>
          ))}
        </dl>
      );
    case "links":
      return (
        <ul className="grid gap-2">
          {block.items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} variant="standalone">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      );
  }
}
