import { PRISMA_KINDS, PRISMA_KIND_INFO } from "@/knowledge/prisma";
import { steps } from "./copy";

/** The diagram types, what each box reports, and the checks, rendered on the server so it reads without JavaScript. */
export function Guide() {
  const lists: [string, string, readonly string[]][] = [
    ["guide-boxes", steps.guideBoxes, steps.guideBoxItems],
    ["guide-checks", steps.guideChecks, steps.guideCheckItems],
  ];
  return (
    <div className="grid gap-8">
      <p className="text-text-muted">{steps.guideIntro}</p>
      <section aria-labelledby="guide-kinds" className="grid gap-3">
        <h3 id="guide-kinds" className="text-subheading font-semibold">
          {steps.kind}
        </h3>
        <dl className="grid gap-3">
          {PRISMA_KINDS.map((kind) => (
            <div key={kind}>
              <dt className="font-medium">{PRISMA_KIND_INFO[kind].label}</dt>
              <dd className="text-text-muted">{PRISMA_KIND_INFO[kind].description}</dd>
            </div>
          ))}
        </dl>
      </section>
      {lists.map(([id, heading, items]) => (
        <section key={id} aria-labelledby={id} className="grid gap-3">
          <h3 id={id} className="text-subheading font-semibold">
            {heading}
          </h3>
          <ul className="grid list-disc gap-2 ps-6">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
