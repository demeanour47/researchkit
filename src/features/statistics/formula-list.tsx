import { getFormula, type FormulaId } from "@/knowledge/research/test-finder";
import { statisticsCopy } from "./copy";

/** Formulas in plain text, each with every symbol defined and its meaning in words. */
export function FormulaList({ formulas }: { formulas: readonly FormulaId[] }) {
  return (
    <ul className="grid gap-3">
      {formulas.map((id) => {
        const formula = getFormula(id);
        return (
          <li key={id} className="grid gap-2 rounded-panel border border-border bg-surface p-4">
            <p className="font-semibold">{formula.name}</p>
            <p className="overflow-x-auto rounded-control bg-sunken px-3 py-2 font-mono text-body break-words">{formula.formula}</p>
            <div className="grid gap-1 text-small">
              <p className="font-medium">{statisticsCopy.formula.symbols}</p>
              <dl className="grid gap-1">
                {formula.symbols.map((symbol) => {
                  const split = symbol.indexOf(": ");
                  return (
                    <div key={symbol} className="flex flex-wrap gap-x-2">
                      <dt className="font-mono font-medium">{symbol.slice(0, split)}</dt>
                      <dd className="text-text-muted">{symbol.slice(split + 2)}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
            <p className="text-small">{formula.meaning}</p>
          </li>
        );
      })}
    </ul>
  );
}
