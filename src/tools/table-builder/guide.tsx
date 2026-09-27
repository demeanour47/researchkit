import { TABLE_GROUPS, TABLE_GROUP_LABELS, TABLE_TYPES, TABLE_TYPE_INFO } from "@/knowledge/tables";
import { SOURCE_TEXT, steps } from "./copy";

/** Every table type, grouped as a thesis uses them, rendered on the server so it reads without JavaScript. */
export function Guide() {
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      <nav aria-labelledby="table-contents">
        <h3 id="table-contents" className="text-subheading font-semibold">
          {steps.contents}
        </h3>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {TABLE_TYPES.map((type) => (
            <li key={type}>
              <a href={`#table-${type}`} className="underline focus-ring">
                {TABLE_TYPE_INFO[type].label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {TABLE_GROUPS.map((group) => (
        <section key={group} aria-labelledby={`table-group-${group}`} className="grid gap-4">
          <h3 id={`table-group-${group}`} className="text-subheading font-semibold">
            {TABLE_GROUP_LABELS[group]}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {TABLE_TYPES.filter((type) => TABLE_TYPE_INFO[type].group === group).map((type) => {
              const info = TABLE_TYPE_INFO[type];
              return (
                <section key={type} id={`table-${type}`} aria-labelledby={`table-${type}-title`} className="grid scroll-mt-4 content-start gap-3 rounded-panel border border-border bg-surface p-4 sm:p-6">
                  <h4 id={`table-${type}-title`} className="font-semibold">
                    {info.label}
                  </h4>
                  <p>{info.description}</p>
                  <dl className="grid gap-2">
                    <div>
                      <dt className="font-medium">{steps.bestFor}</dt>
                      <dd>{info.bestFor}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">{steps.contentFrom}</dt>
                      <dd>{SOURCE_TEXT[info.source]}</dd>
                    </div>
                    {info.layout && (
                      <div>
                        <dt className="font-medium">{steps.layout}</dt>
                        <dd>{info.layout}</dd>
                      </div>
                    )}
                  </dl>
                  {info.example && (
                    <details className="group">
                      <summary className="cursor-pointer rounded-control font-medium underline focus-ring">{steps.example}</summary>
                      <pre className="mt-2 overflow-x-auto rounded-control border border-border bg-background p-3 text-small">{info.example}</pre>
                    </details>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
