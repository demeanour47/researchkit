"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { toBibtex } from "@/knowledge/literature-search/bibtex";
import { inCategory, sortRecords, type SortOrder } from "@/knowledge/literature-search/display";
import { parseErrorBody, parseSearchResponse } from "@/knowledge/literature-search/response";
import type { DocumentType, OpenAccessFilter, SearchResponse } from "@/knowledge/literature-search/types";
import { SEARCH_LIMITS } from "@/knowledge/literature-search/types";
import { Button, Callout, ChoiceChips, CopyButton, EmptyState, Icon, Link, LoadingIndicator, SelectField, TextField, VisuallyHidden, type CopyResult } from "@/ui";
import { ui } from "./copy";
import { ResultCard } from "./result-card";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; response: SearchResponse }
  | { phase: "error"; kind: "rate-limited" | "failed" | "malformed" | "offline" | "invalid"; message?: string };

const ALL = "__all__";

export function Explorer() {
  const [query, setQuery] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [openAccess, setOpenAccess] = useState<OpenAccessFilter>("any");
  const [documentType, setDocumentType] = useState<DocumentType>("any");
  const [sort, setSort] = useState<SortOrder>("relevance");
  const [category, setCategory] = useState<string>(ALL);
  const [state, setState] = useState<State>({ phase: "idle" });
  const [announcement, setAnnouncement] = useState("");
  const controller = useRef<AbortController | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const filtersId = useId();

  useEffect(() => () => controller.current?.abort(), []);

  async function search(event?: FormEvent) {
    event?.preventDefault();
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState({ phase: "loading" });
    setCategory(ALL);
    setAnnouncement(ui.searching);
    try {
      const response = await fetch("/api/literature/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, yearFrom: yearFrom || null, yearTo: yearTo || null, openAccess, documentType }),
        signal: current.signal,
        cache: "no-store",
      });
      const body: unknown = await response.json().catch(() => null);
      if (current.signal.aborted) return;
      if (!response.ok) {
        const error = parseErrorBody(body);
        setState({ phase: "error", kind: response.status === 429 ? "rate-limited" : error?.code === "invalid" || response.status === 400 ? "invalid" : error?.code === "malformed" ? "malformed" : "failed", message: error?.code === "invalid" ? error.message : undefined });
        setAnnouncement(error?.message ?? ui.failed);
        return;
      }
      const parsed = parseSearchResponse(body);
      if (!parsed) {
        setState({ phase: "error", kind: "malformed" });
        setAnnouncement(ui.malformed);
        return;
      }
      setState({ phase: "done", response: parsed });
      setAnnouncement(ui.total(parsed.records.length, parsed.total));
      requestAnimationFrame(() => headingRef.current?.focus());
    } catch {
      if (current.signal.aborted) return;
      setState({ phase: "error", kind: "offline" });
      setAnnouncement(ui.offline);
    }
  }

  const response = state.phase === "done" ? state.response : null;
  const visible = useMemo(() => (response ? sortRecords(inCategory(response.records, category === ALL ? null : category), sort) : []), [response, category, sort]);

  function onCopy(subject: string, result: CopyResult) {
    setAnnouncement(result === "copied" ? ui.copied(subject) : ui.copyFailed(subject));
  }

  const busy = state.phase === "loading";

  return (
    <div className="grid gap-6">
      <form onSubmit={search} className="grid gap-4 rounded-panel border border-border bg-surface p-4" aria-describedby={filtersId}>
        <TextField label={ui.searchLabel} hint={ui.searchHint} value={query} onChange={(event) => setQuery(event.target.value)} maxLength={SEARCH_LIMITS.maxQueryLength} autoComplete="off" spellCheck={false} required />
        <fieldset className="grid gap-4">
          <legend id={filtersId} className="mb-2 text-small font-medium text-text-muted">
            {ui.filters}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextField label={ui.yearFrom} inputMode="numeric" value={yearFrom} onChange={(event) => setYearFrom(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2015" />
            <TextField label={ui.yearTo} inputMode="numeric" value={yearTo} onChange={(event) => setYearTo(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2025" />
            <SelectField label={ui.openAccess} options={ui.openAccessOptions} value={openAccess} onChange={(event) => setOpenAccess(event.target.value as OpenAccessFilter)} />
            <SelectField label={ui.type} options={ui.typeOptions} value={documentType} onChange={(event) => setDocumentType(event.target.value as DocumentType)} />
          </div>
        </fieldset>
        <div>
          <Button type="submit" busy={busy}>
            <Icon name="search" />
            {ui.searchButton}
          </Button>
        </div>
      </form>

      <Callout tone="info" title={ui.guidanceTitle} icon="lightbulb">
        <ul className="grid list-disc gap-1 ps-5">
          {ui.guidance.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="mt-2">
          <Link href="/learn/how-to-search-academic-literature">{ui.guideLink}</Link>
        </p>
      </Callout>

      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>

      <section aria-labelledby="results-heading" className="grid gap-4">
        <h2 id="results-heading" ref={headingRef} tabIndex={-1} className="text-heading font-semibold">
          {ui.resultsHeading}
        </h2>

        {state.phase === "idle" && (
          <EmptyState icon="search" title={ui.initialTitle} level={3}>
            {ui.initialText}
          </EmptyState>
        )}

        {state.phase === "loading" && (
          <div className="grid gap-3">
            <LoadingIndicator label={ui.searching} />
          </div>
        )}

        {state.phase === "error" && (
          <Callout className="animate-rise-in" tone={state.kind === "rate-limited" ? "caution" : "danger"} title={state.kind === "invalid" ? undefined : "Search unavailable"}>
            {state.kind === "rate-limited" ? ui.rateLimited : state.kind === "malformed" ? ui.malformed : state.kind === "offline" ? ui.offline : state.kind === "invalid" ? (state.message ?? ui.failed) : ui.failed}
          </Callout>
        )}

        {response && (
          <>
            <p className="text-small text-text-muted">
              {ui.total(response.records.length, response.total)} {ui.retrieved(response.retrievedAt)}
            </p>
            {response.notices.map((notice) => (
              <Callout key={notice} tone="note">
                {notice}
              </Callout>
            ))}
            {response.providers.some((provider) => provider.status === "error") && response.records.length > 0 && (
              <Callout tone="caution">
                {ui.partial} {response.providers.filter((provider) => provider.status === "error").map((provider) => `${provider.name} (${provider.message ?? ""})`).join("; ")}
              </Callout>
            )}
            {response.skipped > 0 && <Callout tone="note">{ui.skipped(response.skipped)}</Callout>}

            {response.records.length === 0 ? (
              <EmptyState icon="search" title={ui.noResultsTitle} level={3}>
                <ul className="grid list-disc gap-1 text-start ps-5">
                  {ui.noResultsHelp.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </EmptyState>
            ) : (
              <>
                {response.categories.length > 1 && (
                  <div className="grid gap-2">
                    <ChoiceChips
                      name="topic-group"
                      legend={ui.topicsHeading}
                      value={category}
                      onChange={setCategory}
                      options={[{ value: ALL, label: `${ui.allTopics} (${response.records.length})` }, ...response.categories.map((entry) => ({ value: entry.label, label: `${entry.label} (${entry.count})` }))]}
                    />
                    <p className="text-small text-text-muted">{ui.topicsNote}</p>
                  </div>
                )}

                {(response.suggestions.providerTerms.length > 0 || response.suggestions.researchKitTerms.length > 0) && (
                  <details className="rounded-panel border border-border p-4">
                    <summary className="cursor-pointer font-medium focus-ring">{ui.suggestionsHeading}</summary>
                    <div className="mt-3 grid gap-3 text-small">
                      {response.suggestions.providerTerms.length > 0 && (
                        <div>
                          <p className="font-medium">{ui.providerTerms}</p>
                          <p className="text-text-muted">{response.suggestions.providerTerms.map((entry) => `${entry.term} (${entry.count})`).join(", ")}</p>
                        </div>
                      )}
                      {response.suggestions.researchKitTerms.length > 0 && (
                        <div>
                          <p className="font-medium">{ui.researchKitTerms}</p>
                          <p className="text-text-muted">{response.suggestions.researchKitTerms.map((entry) => `${entry.term} (${entry.count})`).join(", ")}</p>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-48">
                    <SelectField label={ui.sort} options={ui.sortOptions} value={sort} onChange={(event) => setSort(event.target.value as SortOrder)} />
                  </div>
                  <CopyButton text={toBibtex(visible)} subject="for these results" copyLabel="Copy all BibTeX" onResult={(result) => onCopy(ui.bibtexSubject, result)} />
                </div>

                {visible.length === 0 ? (
                  <p className="text-text-muted">{ui.noMatchInGroup}</p>
                ) : (
                  <ul className="grid gap-4">
                    {visible.map((record) => (
                      <ResultCard key={record.id} record={record} onCopy={onCopy} />
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
