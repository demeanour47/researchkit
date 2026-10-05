"use client";

import { useState } from "react";
import { Callout, CopyButton, Link, SelectField, TextField } from "@/ui";
import { assembleOutput, outputAsText } from "@/knowledge/project/output";
import { PROJECT_GUIDANCE_NOTE, sectionsFor, type SectionTemplate } from "@/knowledge/project/sections";
import { SECTION_STATUSES, SECTION_STATUS_LABELS, type ProjectState, type SectionStatus } from "@/knowledge/project/state";
import { projectActions } from "./store";

function SectionEditor({ template, project }: { template: SectionTemplate; project: ProjectState }) {
  const saved = project.sections[template.id];
  const [text, setText] = useState(saved?.text ?? "");
  const status = saved?.status ?? "not-started";
  return (
    <details className="rounded-lg border border-border bg-surface p-4" name="section">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 font-semibold">
        <span>{template.title}</span>
        <span className="text-small font-normal text-text-muted">{SECTION_STATUS_LABELS[status]}</span>
      </summary>
      <div className="mt-4 space-y-4 text-small">
        <p>{template.purpose}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><h4 className="font-semibold">Usually includes</h4><ul className="list-disc pl-5 text-text-muted">{template.include.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><h4 className="font-semibold">Questions to answer</h4><ul className="list-disc pl-5 text-text-muted">{template.questions.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><h4 className="font-semibold">Common mistakes</h4><ul className="list-disc pl-5 text-text-muted">{template.mistakes.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><h4 className="font-semibold">Formatting</h4><p className="text-text-muted">{template.formatting}</p></div>
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          {template.tools.map((tool) => <Link key={tool.href} href={tool.href}>{tool.label}</Link>)}
          {template.guides.map((guide) => <Link key={guide.slug} href={`/learn/${guide.slug}`}>Learn: {guide.title}</Link>)}
        </p>
        <TextField label={`Your ${template.title.toLowerCase()}`} hint="Your own words. ResearchKit does not write this for you." multiline rows={8} value={text} onChange={(event) => setText(event.target.value)} onBlur={() => text !== (saved?.text ?? "") && projectActions.section(template.id, { text })} />
        <SelectField label="Status" value={status} options={SECTION_STATUSES.map((value) => ({ value, label: SECTION_STATUS_LABELS[value] }))} onChange={(event) => projectActions.section(template.id, { text, status: event.target.value as SectionStatus })} />
      </div>
    </details>
  );
}

/** The document builder: default sections for the project type, each with guidance and a place to write. */
export function SectionsPanel({ project }: { project: ProjectState }) {
  const sections = sectionsFor(project.profile.type);
  return (
    <div className="space-y-3">
      <p className="text-small text-text-muted">{PROJECT_GUIDANCE_NOTE}</p>
      {sections.map((template) => <SectionEditor key={`${project.profile.type}-${template.id}`} template={template} project={project} />)}
    </div>
  );
}

/** Everything the student has written, in order, with unfinished sections marked. */
export function OutputPanel({ project, title }: { project: ProjectState; title: string }) {
  const output = assembleOutput(project);
  return (
    <div className="space-y-4">
      {output.complete ? (
        <Callout tone="success" title="Every section is marked complete">Read it through against your institution&apos;s requirements before you submit.</Callout>
      ) : (
        <Callout tone="info" title={`${output.incomplete} of ${output.sections.length} sections are not complete`}>They are marked below. Nothing has been written for you.</Callout>
      )}
      <CopyButton text={outputAsText(project, title)} subject="document" />
      <ol className="space-y-4">
        {output.sections.map((section) => (
          <li key={section.id}>
            <h4 className="font-semibold">{section.title}{section.incomplete && <span className="ml-2 text-small font-normal text-text-muted">({SECTION_STATUS_LABELS[section.status]})</span>}</h4>
            <p className="whitespace-pre-line text-small text-text-muted wrap-anywhere">{section.text || "No text written yet."}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
