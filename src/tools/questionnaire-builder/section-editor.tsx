"use client";

import { useState } from "react";
import { Button, TextField } from "@/ui";
import { SECTION_KIND_INFO, moveSection, removeSection, renameSection, sectionGuidance, sectionQuestions, setSectionContent, type Questionnaire, type QuestionnaireSection, type ResearchProjectDraft } from "@/knowledge/research";
import { announcements } from "./announcements";
import { steps } from "./copy";
import type { Update } from "./question-editor";

/** One section: its title, its text, guidance from the project, and buttons to move or remove it. */
export function SectionEditor({ section, position, questionnaire, project, update }: { section: QuestionnaireSection; position: number; questionnaire: Questionnaire; project: ResearchProjectDraft; update: Update }) {
  const [title, setTitle] = useState(section.title);
  const total = questionnaire.sections.length;
  const count = sectionQuestions(questionnaire, section.id).length;
  const guidance = sectionGuidance(section, project);
  const id = `section-${section.id}`;
  // At either end the button becomes disabled, so focus moves to the section's heading.
  const move = (to: number, button: "up" | "down") =>
    update(moveSection(questionnaire, section.id, to), announcements.sectionMoved(section.title, to + 1, total), (button === "up" && to === 0) || (button === "down" && to === total - 1) ? `${id}-heading` : `${id}-${button}`);

  return (
    <li className="grid gap-4 rounded-panel border border-border p-4">
      <h3 id={`${id}-heading`} tabIndex={-1} className="text-subheading font-semibold focus-ring">
        {`${position + 1}. ${section.title}`}
      </h3>
      <p className="text-small text-text-muted">
        {SECTION_KIND_INFO[section.kind].label}: {SECTION_KIND_INFO[section.kind].purpose} {steps.sectionQuestionsCount(count)}
      </p>
      <TextField
        id={`${id}-title`}
        label={steps.sectionTitle(position + 1)}
        autoComplete="off"
        value={title}
        error={title.trim() ? undefined : steps.titleRequired}
        onChange={(event) => {
          setTitle(event.target.value);
          if (event.target.value.trim()) update(renameSection(questionnaire, section.id, event.target.value));
        }}
      />
      <TextField
        id={`${id}-content`}
        label={steps.sectionText}
        hint={steps.sectionTextHint(SECTION_KIND_INFO[section.kind].placeholder)}
        multiline
        rows={3}
        value={section.content}
        onChange={(event) => update(setSectionContent(questionnaire, section.id, event.target.value))}
      />
      {guidance.length > 0 && (
        <div className="grid gap-1 text-small">
          <h4 className="font-semibold">{steps.guidance}</h4>
          <ul className="grid list-disc gap-1 ps-6">
            {guidance.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button id={`${id}-up`} variant="subtle" size="sm" disabled={position === 0} onClick={() => move(position - 1, "up")} aria-label={`${steps.moveUp}: ${section.title}`}>
          {steps.moveUp}
        </Button>
        <Button id={`${id}-down`} variant="subtle" size="sm" disabled={position === total - 1} onClick={() => move(position + 1, "down")} aria-label={`${steps.moveDown}: ${section.title}`}>
          {steps.moveDown}
        </Button>
        <Button
          variant="subtle"
          size="sm"
          aria-label={steps.removeSection(section.title, count)}
          onClick={() => {
            const next = questionnaire.sections[position + 1] ?? questionnaire.sections[position - 1];
            update(removeSection(questionnaire, section.id), announcements.sectionRemoved(section.title, count), next ? `section-${next.id}-heading` : "new-section");
          }}
        >
          {steps.remove}
        </Button>
      </div>
    </li>
  );
}
