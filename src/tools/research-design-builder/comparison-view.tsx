import { compareDesigns, type DesignId } from "@/knowledge/research";
import { steps } from "./copy";

/** The shortlisted designs side by side: aspects as rows, designs as columns. */
export function ComparisonView({ ids }: { ids: readonly DesignId[] }) {
  const comparison = compareDesigns(ids);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-start text-small">
        <caption className="mb-2 text-start font-medium">{steps.comparisonCaption}</caption>
        <thead>
          <tr className="border-b border-border-control">
            <th scope="col" className="px-2 py-2 text-start font-semibold">
              {steps.aspect}
            </th>
            {comparison.designs.map((design) => (
              <th key={design.id} scope="col" className="px-2 py-2 text-start font-semibold">
                {design.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.rows.map((row) => (
            <tr key={row.aspect} className="border-b border-border align-top">
              <th scope="row" className="px-2 py-2 text-start font-medium">
                {row.label}
              </th>
              {row.values.map((value, index) => (
                <td key={comparison.designs[index].id} className="min-w-32 px-2 py-2">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
