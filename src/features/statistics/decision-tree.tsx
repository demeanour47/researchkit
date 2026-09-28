import { getAnalysisMethod, type AnalysisMethodId } from "@/knowledge/research/data-analysis-types";
import { DECISION_TREE, type TreeLeaf, type TreeNode } from "@/knowledge/research/test-finder";
import { statisticsCopy } from "./copy";

const copy = statisticsCopy.tree;
const names = (methods: readonly AnalysisMethodId[]) => methods.map((method) => getAnalysisMethod(method).name).join(", ");

function Leaf({ leaf }: { leaf: TreeLeaf }) {
  return (
    <div className="mt-1 grid gap-0.5 rounded-control border border-border bg-surface px-3 py-2 text-small">
      {leaf.tests.length > 0 ? (
        <p>
          <span className="font-semibold">{copy.common}</span> {names(leaf.tests)}
        </p>
      ) : (
        <p>{copy.none}</p>
      )}
      {leaf.alsoConsider.length > 0 && (
        <p className="text-text-muted">
          <span className="font-medium">{copy.also}</span> {names(leaf.alsoConsider)}
        </p>
      )}
      {leaf.note && <p className="text-text-muted">{leaf.note}</p>}
    </div>
  );
}

function Branches({ node }: { node: TreeNode }) {
  return (
    <div className="grid gap-2">
      <p className="font-semibold">{node.question}</p>
      <ul className="grid gap-3 border-s-2 border-border-strong ps-3 sm:ps-4">
        {node.branches.map((branch) => (
          <li key={branch.answer} className="grid gap-1">
            <p>
              <span aria-hidden="true" className="text-text-muted">
                →{" "}
              </span>
              {branch.answer}
            </p>
            {branch.next.kind === "leaf" ? <Leaf leaf={branch.next} /> : <Branches node={branch.next} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The decision tree as nested lists: each question, its answers, and where each path
 * leads. Nested lists keep the structure available to screen readers and readable
 * without the surrounding text. The tool shows each purpose collapsed; guides show all.
 */
export function DecisionTreeView({ collapsible = false, tree = DECISION_TREE }: { collapsible?: boolean; tree?: TreeNode }) {
  return (
    <figure className="grid gap-4 rounded-panel border border-border bg-sunken p-4">
      <figcaption className="grid gap-1">
        <span className="font-semibold">{copy.caption}</span>
        <span className="text-small text-text-muted">{copy.intro}</span>
      </figcaption>
      <p className="font-semibold">{tree.question}</p>
      <ul className="grid gap-3">
        {tree.branches.map((branch) =>
          collapsible ? (
            <li key={branch.answer}>
              <details className="rounded-control border border-border bg-surface">
                <summary className="cursor-pointer rounded-control px-3 py-2 font-medium focus-ring">{branch.answer}</summary>
                <div className="px-3 pb-3">{branch.next.kind === "leaf" ? <Leaf leaf={branch.next} /> : <Branches node={branch.next} />}</div>
              </details>
            </li>
          ) : (
            <li key={branch.answer} className="grid gap-2 rounded-control border border-border bg-surface p-3">
              <p className="font-medium">{branch.answer}</p>
              {branch.next.kind === "leaf" ? <Leaf leaf={branch.next} /> : <Branches node={branch.next} />}
            </li>
          ),
        )}
      </ul>
    </figure>
  );
}
