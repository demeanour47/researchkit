"use client";

import { useState } from "react";
import { Badge, Button, ButtonLink, ChoiceChips, SelectField, TextField, cx } from "@/ui";
import { formattingFor } from "@/knowledge/project/formatting";
import { NODE_STATE_LABELS, type NodeState } from "@/knowledge/project/journey";
import { nextStepFor } from "@/knowledge/project/next-steps";
import { readinessOf } from "@/knowledge/project/readiness";
import { PROJECT_TYPE_INFO } from "@/knowledge/project/sections";
import { CITATION_STYLE_IDS, type CitationStyleId, type ProjectType } from "@/knowledge/project/state";
import { JourneyMap } from "./journey-map";
import { NodePanel } from "./node-panel";
import { OutputPanel, SectionsPanel } from "./sections-panel";
import { StartProject } from "./start-project";
import { projectActions, useProjectView, type ProjectView } from "./store";

const STATE_MARK: Record<NodeState, string> = { completed: "✓", current: "●", available: "○", blocked: "◌", optional: "◇", "not-applicable": "–" };

function Heading({ id, children }: { id: string; children: string }) {
  return <h2 id={id} className="text-heading font-semibold">{children}</h2>;
}

function Journey({ view }: { view: ProjectView }) {
  const { journey, project } = view;
  const [picked, setPicked] = useState<string | null>(null);
  const selected = journey.nodes.find((node) => node.id === picked) ?? journey.current ?? journey.nodes[0];
  const step = nextStepFor(journey, project);
  const info = PROJECT_TYPE_INFO.find((item) => item.type === project.profile.type)!;

  return (
    <section aria-labelledby="journey-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="accent">{info.name}</Badge>
          <h2 id="journey-title" className="mt-2 text-title font-semibold">{view.draft.projectTitle || project.profile.interest || "My research project"}</h2>
        </div>
        <p className="text-small text-text-muted" aria-live="polite"><strong className="text-text">{journey.percent}%</strong> · {journey.completed} of {journey.applicable} milestones</p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Research journey progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={journey.percent}>
        <div className="h-full bg-action transition-[width] duration-(--duration-moderate) ease-standard" style={{ width: `${journey.percent}%` }} />
      </div>

      <div className="rounded-lg border border-action bg-action-soft p-4">
        <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Next step</p>
        <p className="font-semibold">{step.headline}</p>
        <p className="text-small text-text-muted">{step.detail}</p>
        {step.node?.handoff && step.node.state !== "not-applicable" && <ButtonLink href={step.node.handoff.href} size="sm" className="mt-3" trailingIcon="arrow-right">Continue with {step.node.handoff.label}</ButtonLink>}
        {step.node && !step.node.handoff && <Button size="sm" className="mt-3" onClick={() => setPicked(step.node!.id)}>Continue: {step.node.name}</Button>}
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="hidden md:block"><JourneyMap journey={journey} selected={selected?.id ?? null} onSelect={setPicked} /></div>
        <div className="min-w-0 space-y-4">
          <nav aria-label="Journey stages" className="min-w-0">
            <ol className="flex snap-x gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-2 md:overflow-visible lg:grid-cols-3">
              {journey.nodes.map((node) => (
                <li key={node.id} className="shrink-0 snap-start md:shrink">
                  <button
                    type="button"
                    onClick={() => setPicked(node.id)}
                    aria-current={node.state === "current" ? "step" : undefined}
                    aria-pressed={selected?.id === node.id}
                    className={cx("flex w-full min-w-28 items-center gap-2 rounded-md border px-3 py-2 text-left text-small transition-colors duration-(--duration-quick)", selected?.id === node.id ? "border-action bg-action-soft" : "border-border bg-surface hover:bg-hover", node.state === "current" && "font-semibold")}
                  >
                    <span aria-hidden="true">{STATE_MARK[node.state]}</span>
                    <span>{node.name}<span className="sr-only">, {NODE_STATE_LABELS[node.state]}</span></span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          {selected && <div className="rounded-lg border border-border bg-surface p-4"><NodePanel key={selected.id} node={selected} project={project} /></div>}
        </div>
      </div>
    </section>
  );
}

function Readiness({ view }: { view: ProjectView }) {
  const readiness = readinessOf(view.journey);
  return (
    <section aria-labelledby="readiness-title" className="space-y-3">
      <Heading id="readiness-title">Research readiness</Heading>
      <p className="text-small text-text-muted">{readiness.sentence} This is a guide to what you&apos;ve recorded, not a grade.</p>
      <ul className="grid gap-3 sm:grid-cols-5">
        {readiness.bars.map((bar) => (
          <li key={bar.dimension} className="text-small">
            <div className="flex justify-between"><span>{bar.label}</span><span className="text-text-muted">{bar.percent === null ? "n/a" : `${bar.percent}%`}</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sunken"><div className="h-full bg-action transition-[width] duration-(--duration-moderate) ease-standard" style={{ width: `${bar.percent ?? 0}%` }} /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Formatting({ view }: { view: ProjectView }) {
  const guidance = formattingFor(view.project.profile);
  return (
    <section aria-labelledby="formatting-title" className="space-y-3">
      <Heading id="formatting-title">Formatting guidance</Heading>
      <div className="grid gap-4 text-small md:grid-cols-2">
        <div><h3 className="font-semibold">General academic practice</h3><ul className="list-disc pl-5 text-text-muted">{[...guidance.general, ...guidance.forType].map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div>
          <h3 className="font-semibold">{guidance.style ? `${guidance.style.name} requirements` : "Citation style"}</h3>
          {guidance.style ? <ul className="list-disc pl-5 text-text-muted">{guidance.style.points.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="text-text-muted">Choose a citation style in the project details.</p>}
          {guidance.style?.toolHref && <ButtonLink href={guidance.style.toolHref} size="sm" variant="secondary" className="mt-2">Open the citation generator</ButtonLink>}
          <h3 className="mt-3 font-semibold">Your institution</h3>
          <p className="whitespace-pre-line text-text-muted wrap-anywhere">{guidance.institution}</p>
        </div>
      </div>
    </section>
  );
}

function Details({ view }: { view: ProjectView }) {
  const { profile } = view.project;
  const [institution, setInstitution] = useState(profile.institution ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <section aria-labelledby="details-title" className="space-y-4">
      <Heading id="details-title">Project details</Heading>
      <ChoiceChips name="change-type" legend="Document type" options={PROJECT_TYPE_INFO.map((item) => ({ value: item.type, label: item.name }))} value={profile.type} onChange={(type: ProjectType) => projectActions.setType(type)} />
      <div className="grid max-w-2xl gap-4">
        <SelectField label="Citation style" value={profile.citationStyle ?? ""} onChange={(event) => projectActions.profile({ citationStyle: (event.target.value || undefined) as CitationStyleId | undefined })} options={[{ value: "", label: "Not decided yet" }, ...CITATION_STYLE_IDS.map((id) => ({ value: id, label: id.toUpperCase() }))]} />
        <TextField label="Institution requirements" multiline rows={3} value={institution} onChange={(event) => setInstitution(event.target.value)} onBlur={() => projectActions.profile({ institution })} />
      </div>
      {confirmDelete ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-small">Delete the journey from this browser? Your workspace project is kept.</p>
          <Button variant="secondary" size="sm" onClick={() => projectActions.remove()}>Delete journey</Button>
          <Button variant="subtle" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
        </div>
      ) : (
        <Button variant="subtle" size="sm" onClick={() => setConfirmDelete(true)}>Delete this journey</Button>
      )}
    </section>
  );
}

/** The project home: the journey first, then the document, formatting and output. */
export function ProjectHome() {
  const view = useProjectView();
  if (view === undefined) return <p className="text-text-muted" role="status">Loading your research journey…</p>;
  if (view === null) {
    return (
      <div className="space-y-4">
        <h2 className="text-heading font-semibold">Start a research journey</h2>
        <p className="max-w-2xl text-text-muted">Choose the document you are preparing. You can change it later, and nothing is saved anywhere except this browser.</p>
        <StartProject />
      </div>
    );
  }
  return (
    <div className="space-y-10">
      <Journey view={view} />
      <Readiness view={view} />
      <section aria-labelledby="document-title" className="space-y-3"><Heading id="document-title">Your document</Heading><SectionsPanel project={view.project} /></section>
      <Formatting view={view} />
      <section aria-labelledby="output-title" className="space-y-3"><Heading id="output-title">Final output</Heading><OutputPanel project={view.project} title={view.draft.projectTitle || view.project.profile.interest || "Research project"} /></section>
      <Details view={view} />
    </div>
  );
}
