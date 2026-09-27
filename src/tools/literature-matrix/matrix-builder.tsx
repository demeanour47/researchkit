"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button, RadioGroup, SelectField, TextField, VisuallyHidden } from "@/ui";
import { LearnMore, ProjectFields } from "@/features/research";
import { download } from "@/features/figure-export";
import { chartFileName as fileName } from "@/knowledge/charts";
import { EMPTY_TYPED_PROJECT, projectFromTyped, updateProjectDraft, type MeasurementLevel, type TypedProject } from "@/knowledge/research";
import {
  COLOUR_TAGS,
  COLOUR_TAG_LABELS,
  COLUMN_PRESETS,
  COLUMN_PRESET_LABELS,
  EXPORT_FORMATS,
  FIELD_GROUPS,
  FIELD_GROUP_LABELS,
  FIELD_INFO,
  MATRIX_FIELDS,
  PRINTABLE_COLUMNS,
  PRIORITIES,
  PRIORITY_LABELS,
  READING_STATUSES,
  READING_STATUS_LABELS,
  addStudy,
  coveredVariables,
  deleteStudy,
  detectPatterns,
  duplicateStudy,
  exportMatrix,
  isEmptyLens,
  matrixIssues,
  potentialGaps,
  projectLens,
  setFavourite,
  setPriority,
  setStatus,
  setTag,
  shiftStudy,
  statedGaps,
  studyLabel,
  synthesis,
  updateField,
  viewStudies,
  visibleFields,
  type ColourTag,
  type ColumnPreset,
  type ExportFormat,
  type Matrix,
  type MatrixField,
  type Priority,
  type ReadingStatus,
  type SortDirection,
  type Study,
} from "@/knowledge/literature";
import { announcements, viewAnnouncement } from "./announcements";
import { ComparePanel } from "./compare-panel";
import { steps } from "./copy";
import { exampleLevels, exampleProject, exampleStudies, exampleTopic } from "./example";
import { ImportPanel } from "./import-panel";
import { InsightsPanel } from "./insights-panel";
import { MatrixTable } from "./matrix-table";
import { Step } from "./parts";
import { StudyEditor } from "./study-editor";

const yearOrNull = (value: string) => (/^\d{4}$/.test(value.trim()) ? Number(value) : null);

/** The whole builder: project, studies, matrix, patterns and gaps, comparison and export. The guide is rendered on the server and passed in. */
export function MatrixBuilder({ guide }: { guide: ReactNode }) {
  const [matrix, setMatrix] = useState<Matrix>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<{ study: Study; index: number } | null>(null);
  const [project, setProject] = useState<TypedProject>(EMPTY_TYPED_PROJECT);
  const [levels, setLevels] = useState<Record<string, MeasurementLevel | "">>({});
  const [topic, setTopic] = useState("");
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<MatrixField | "">("");
  const [direction, setDirection] = useState<SortDirection>("ascending");
  const [status, setStatusFilter] = useState<ReadingStatus | "">("");
  const [priority, setPriorityFilter] = useState<Priority | "none" | "">("");
  const [tag, setTagFilter] = useState<ColourTag | "none" | "">("");
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [chosen, setChosen] = useState<ReadonlySet<MatrixField>>(new Set(COLUMN_PRESETS.essentials));
  const [exportTitle, setExportTitle] = useState("Literature Matrix");
  const [announcement, setAnnouncement] = useState("");
  const currentYear = new Date().getFullYear();

  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 30);
  };

  const draft = useMemo(() => updateProjectDraft(projectFromTyped(project, levels), { topic }), [project, levels, topic]);
  const lens = useMemo(() => projectLens(draft), [draft]);
  const fields = useMemo(() => visibleFields(chosen), [chosen]);
  const filter = { statuses: status ? [status] : [], priorities: priority ? [priority] : [], tags: tag ? [tag] : [], favouritesOnly, fromYear: yearOrNull(fromYear), toYear: yearOrNull(toYear) };
  const shown = viewStudies(matrix, { query, filter, sort: sortField ? { field: sortField, direction } : null });
  const filtered = shown.length !== matrix.length || Boolean(query.trim());
  const canReorder = !sortField && !filtered;
  const positions = new Map(matrix.map((study, index) => [study.id, index]));
  const covered = new Map(matrix.map((study) => [study.id, coveredVariables(study, lens)]));
  const issues = useMemo(() => matrixIssues(matrix, currentYear), [matrix, currentYear]);
  const patterns = useMemo(() => detectPatterns(matrix), [matrix]);
  const stated = useMemo(() => statedGaps(matrix), [matrix]);
  const potential = useMemo(() => potentialGaps(matrix, lens, currentYear), [matrix, lens, currentYear]);
  const summary = useMemo(() => synthesis(matrix, lens, currentYear), [matrix, lens, currentYear]);
  const editingStudy = matrix.find((study) => study.id === editing) ?? null;
  const labelOf = (id: string) => studyLabel(matrix.find((study) => study.id === id)!);

  /** A filter change, announced with how many studies it leaves. */
  const refilter = (apply: () => void, next: () => Study[]) => {
    apply();
    const count = next().length;
    announce(viewAnnouncement(count, matrix.length));
  };
  const viewWith = (changes: Partial<{ status: ReadingStatus | ""; priority: Priority | "none" | ""; tag: ColourTag | "none" | ""; favouritesOnly: boolean }>) => () => {
    const merged = { status, priority, tag, favouritesOnly, ...changes };
    return viewStudies(matrix, {
      query,
      sort: null,
      filter: { statuses: merged.status ? [merged.status] : [], priorities: merged.priority ? [merged.priority] : [], tags: merged.tag ? [merged.tag] : [], favouritesOnly: merged.favouritesOnly, fromYear: yearOrNull(fromYear), toYear: yearOrNull(toYear) },
    });
  };

  const addOne = () => {
    const next = addStudy(matrix);
    const created = next[next.length - 1];
    setMatrix(next);
    setEditing(created.id);
    announce(announcements.added(studyLabel(created)));
  };
  const remove = (id: string) => {
    const index = matrix.findIndex((study) => study.id === id);
    setLastDeleted({ study: matrix[index], index });
    if (editing === id) setEditing(null);
    setMatrix(deleteStudy(matrix, id));
    announce(announcements.deleted(labelOf(id)));
  };
  const undo = () => {
    if (!lastDeleted) return;
    const next = [...matrix];
    next.splice(Math.min(lastDeleted.index, next.length), 0, lastDeleted.study);
    setMatrix(next);
    setLastDeleted(null);
    announce(announcements.restored(studyLabel(lastDeleted.study)));
  };
  const move = (id: string, by: -1 | 1) => {
    const next = shiftStudy(matrix, id, by);
    setMatrix(next);
    announce(announcements.moved(labelOf(id), next.findIndex((study) => study.id === id) + 1, next.length));
    // Keep focus with the study as it moves.
    setTimeout(() => document.querySelector<HTMLButtonElement>(`[aria-label="${CSS.escape(by === -1 ? steps.moveUp(labelOf(id)) : steps.moveDown(labelOf(id)))}"]`)?.focus(), 0);
  };
  const closeEditor = () => {
    const id = editing;
    setEditing(null);
    if (id) setTimeout(() => document.getElementById(`edit-${id}`)?.focus(), 0);
  };
  const save = (format: ExportFormat) => {
    try {
      const file = exportMatrix(format, matrix, fields, exportTitle.trim() || "Literature Matrix");
      download(new Blob([file.data], { type: file.type }), fileName(exportTitle, file.extension));
      announce(announcements.exported(format));
    } catch {
      announce(announcements.exportFailed(format));
    }
  };

  const lensRows: [string, string][] = [
    [steps.projectRows.topic, lens.topic],
    [steps.projectRows.question, lens.researchQuestion],
    [steps.projectRows.objectives, lens.objectives.join("; ")],
    [steps.projectRows.hypotheses, lens.hypotheses.join(" ")],
    [steps.projectRows.variables, lens.variables.map((variable) => variable.name).join(", ")],
  ];

  return (
    <div className="grid gap-10">
      <Step id="project" heading={steps.project}>
        <p className="text-text-muted">{steps.projectIntro}</p>
        <LearnMore label={steps.projectToggle}>
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setProject({ ...exampleProject });
                setLevels({ ...exampleLevels });
                setTopic(exampleTopic);
                announce(steps.exampleProjectLoaded);
              }}
            >
              {steps.exampleProject}
            </Button>
          </div>
          <TextField label={steps.topic} value={topic} onChange={(event) => setTopic(event.target.value)} />
          <ProjectFields
            prefix="lm"
            value={project}
            levels={levels}
            onType={(field, value) => setProject((current) => ({ ...current, [field]: value }))}
            onChoose={(next, nextLevels) => {
              setProject(next);
              setLevels(nextLevels);
            }}
          />
        </LearnMore>
        {!isEmptyLens(lens) && (
          <div className="grid gap-2">
            <h3 className="text-subheading font-semibold">{steps.fromProject}</h3>
            <dl className="grid gap-x-6 gap-y-2 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[max-content_1fr]">
              {lensRows
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="font-medium">{label}</dt>
                    <dd className="break-words">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        )}
      </Step>

      <Step id="add" heading={steps.add}>
        <p className="text-text-muted">{steps.addIntro}</p>
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-3">
            <Button onClick={addOne}>{steps.addStudy}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                const next = exampleStudies.reduce<Matrix>((current, fields) => addStudy(current, fields), matrix);
                setMatrix(next);
                announce(announcements.exampleLoaded(exampleStudies.length));
              }}
            >
              {steps.loadExample}
            </Button>
          </div>
          <p className="text-small text-text-muted">{steps.exampleNote}</p>
        </div>
        <ImportPanel
          matrix={matrix}
          onImported={(next, message) => {
            setMatrix(next);
            announce(message);
          }}
        />
      </Step>

      <Step id="matrix" heading={steps.matrix}>
        {matrix.length === 0 ? (
          <p className="text-text-muted">{steps.empty}</p>
        ) : (
          <>
            <div className="grid gap-4">
              <TextField type="search" label={steps.search} hint={steps.searchHint} value={query} onChange={(event) => setQuery(event.target.value)} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0 [&_select]:w-full">
                <SelectField
                  label={steps.sortBy}
                  emptyOption={steps.yourOrder}
                  options={MATRIX_FIELDS.map((field) => ({ value: field, label: FIELD_INFO[field].label }))}
                  value={sortField}
                  onChange={(event) => {
                    setSortField(event.target.value as MatrixField | "");
                    announce(event.target.value ? `Sorted by ${FIELD_INFO[event.target.value as MatrixField].label}.` : "Showing your order.");
                  }}
                />
                <SelectField label={steps.status} emptyOption={steps.any} options={READING_STATUSES.map((value) => ({ value, label: READING_STATUS_LABELS[value] }))} value={status} onChange={(event) => refilter(() => setStatusFilter(event.target.value as ReadingStatus | ""), viewWith({ status: event.target.value as ReadingStatus | "" }))} />
                <SelectField
                  label={steps.priority}
                  emptyOption={steps.any}
                  options={[{ value: "none", label: steps.none }, ...PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }))]}
                  value={priority}
                  onChange={(event) => refilter(() => setPriorityFilter(event.target.value as Priority | "none" | ""), viewWith({ priority: event.target.value as Priority | "none" | "" }))}
                />
                <SelectField
                  label={steps.tag}
                  emptyOption={steps.any}
                  options={[{ value: "none", label: steps.none }, ...COLOUR_TAGS.map((value) => ({ value, label: COLOUR_TAG_LABELS[value] }))]}
                  value={tag}
                  onChange={(event) => refilter(() => setTagFilter(event.target.value as ColourTag | "none" | ""), viewWith({ tag: event.target.value as ColourTag | "none" | "" }))}
                />
              </div>
              <div className="flex flex-wrap items-end gap-6">
                {sortField && <RadioGroup name="sort-direction" legend={steps.direction} variant="inline" options={(["ascending", "descending"] as const).map((value) => ({ value, label: steps.directions[value] }))} value={direction} onChange={setDirection} />}
                <RadioGroup name="favourites" legend={steps.favouritesOnly} variant="inline" options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} value={favouritesOnly ? "yes" : "no"} onChange={(value) => refilter(() => setFavouritesOnly(value === "yes"), viewWith({ favouritesOnly: value === "yes" }))} />
                <div className="flex gap-4">
                  <div className="w-28">
                    <TextField label={steps.fromYear} inputMode="numeric" value={fromYear} onChange={(event) => setFromYear(event.target.value)} />
                  </div>
                  <div className="w-28">
                    <TextField label={steps.toYear} inputMode="numeric" value={toYear} onChange={(event) => setToYear(event.target.value)} />
                  </div>
                </div>
              </div>
              <LearnMore label={steps.columnsToggle(fields.length, MATRIX_FIELDS.length)}>
                <div className="grid gap-2">
                  <p className="font-medium">{steps.presets}</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(COLUMN_PRESETS) as ColumnPreset[]).map((preset) => (
                      <Button
                        key={preset}
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setChosen(new Set(COLUMN_PRESETS[preset]));
                          announce(`${COLUMN_PRESET_LABELS[preset]}: ${COLUMN_PRESETS[preset].length} columns shown.`);
                        }}
                      >
                        {COLUMN_PRESET_LABELS[preset]}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {FIELD_GROUPS.map((group) => (
                    <fieldset key={group} className="grid gap-1">
                      <legend className="mb-1 font-semibold">{FIELD_GROUP_LABELS[group]}</legend>
                      {MATRIX_FIELDS.filter((field) => FIELD_INFO[field].group === group).map((field) => (
                        <label key={field} className="flex min-h-control-sm items-center gap-2">
                          <input
                            type="checkbox"
                            className="size-4 accent-action focus-ring"
                            checked={fields.includes(field)}
                            disabled={field === "authors"}
                            onChange={(event) => {
                              const next = new Set(chosen);
                              if (event.target.checked) next.add(field);
                              else next.delete(field);
                              setChosen(next);
                            }}
                          />
                          {FIELD_INFO[field].label}
                        </label>
                      ))}
                    </fieldset>
                  ))}
                </div>
              </LearnMore>
            </div>

            {issues.length > 0 && (
              <LearnMore label={`${steps.checks} (${issues.length})`}>
                <ul className="grid list-disc gap-1 ps-6 text-small">
                  {issues.map((issue, index) => (
                    <li key={index}>{`${issue.severity === "problem" ? "Problem" : "Check"}: ${issue.message}`}</li>
                  ))}
                </ul>
              </LearnMore>
            )}

            {lastDeleted && (
              <div>
                <Button variant="secondary" size="sm" onClick={undo}>
                  {steps.undo}
                </Button>
              </div>
            )}

            {shown.length === 0 ? (
              <p>{steps.noMatches}</p>
            ) : (
              <MatrixTable
                studies={shown}
                total={matrix.length}
                fields={fields}
                canReorder={canReorder}
                positions={positions}
                covered={covered}
                onEdit={setEditing}
                onDuplicate={(id) => {
                  setMatrix(duplicateStudy(matrix, id));
                  announce(announcements.duplicated(labelOf(id)));
                }}
                onMove={move}
                onDelete={remove}
                onFavourite={(id) => {
                  const on = !matrix.find((study) => study.id === id)!.favourite;
                  setMatrix(setFavourite(matrix, id, on));
                  announce(announcements.favourite(labelOf(id), on));
                }}
              />
            )}
            {!canReorder && <p className="text-small text-text-muted">{steps.reorderNote}</p>}

            {editingStudy && (
              <StudyEditor
                study={editingStudy}
                issues={issues.filter((issue) => issue.studyId === editingStudy.id)}
                onField={(field, value) => setMatrix(updateField(matrix, editingStudy.id, field, value))}
                onStatus={(value) => setMatrix(setStatus(matrix, editingStudy.id, value))}
                onPriority={(value) => setMatrix(setPriority(matrix, editingStudy.id, value))}
                onTag={(value) => setMatrix(setTag(matrix, editingStudy.id, value))}
                onFavourite={(value) => setMatrix(setFavourite(matrix, editingStudy.id, value))}
                onClose={closeEditor}
              />
            )}
          </>
        )}
      </Step>

      <Step id="insights" heading={steps.insights}>
        {matrix.length === 0 ? <p className="text-text-muted">{steps.empty}</p> : <InsightsPanel matrix={matrix} patterns={patterns} stated={stated} potential={potential} synthesis={summary} onAnnounce={announce} />}
      </Step>

      <Step id="compare" heading={steps.compare}>
        {matrix.length < 2 ? <p className="text-text-muted">{steps.compareIntro}</p> : <ComparePanel matrix={matrix} />}
      </Step>

      <Step id="export" heading={steps.export}>
        {matrix.length === 0 ? (
          <p className="text-text-muted">{steps.empty}</p>
        ) : (
          <div className="grid gap-4">
            <p className="text-text-muted">{steps.exportIntro}</p>
            <TextField label={steps.exportTitle} value={exportTitle} onChange={(event) => setExportTitle(event.target.value)} />
            {fields.length > PRINTABLE_COLUMNS && <p className="text-small">{steps.wideWarning(fields.length)}</p>}
            <div className="flex flex-wrap gap-3">
              {EXPORT_FORMATS.map((format) => (
                <Button key={format} variant="secondary" onClick={() => save(format)}>
                  {steps.download(format)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Step>

      <Step id="guide" heading={steps.guide}>
        {guide}
      </Step>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}
