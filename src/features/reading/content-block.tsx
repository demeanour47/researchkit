import { Link, cardClasses, cx } from "@/ui";
import { getStyleProfile, stylePath, type GuideBlock } from "@/domains/publishing";
import { CITATION_STYLES, styleTitle } from "@/knowledge/citation/styles";

const labels = {
  definedBy: "Defined by:",
  usedIn: "Commonly used in:",
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
  }
}
