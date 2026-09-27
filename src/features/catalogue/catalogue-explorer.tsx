"use client";

import { Fragment, useSyncExternalStore, type ReactNode } from "react";
import { Button, ChoiceChips, EmptyState, Icon, SearchBar, Section, SectionHeader, Toolbar, cx, type IconName } from "@/ui";
import type { CatalogueStatus } from "@/domains/catalogue";
import { queryWords, normalize } from "@/features/search/match";
import { explorerCopy } from "./explorer-copy";

export type StatusFilter = "all" | CatalogueStatus;

export interface ExplorerItem {
  id: string;
  /** Everything a search should look in: name, description and category. */
  text: string;
  status: CatalogueStatus;
  /** The item's card, rendered on the server. */
  card: ReactNode;
}

export interface ExplorerSection {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  items: readonly ExplorerItem[];
}

export interface CatalogueExplorerProps {
  sections: readonly ExplorerSection[];
  /** What the items are called, in the plural, such as “tools”. */
  plural: string;
  /** Shown above the categories while nothing is filtered, such as featured items. */
  highlights?: ReactNode;
}

interface Filters {
  query: string;
  status: StatusFilter;
  category: string;
}

const NO_FILTERS: Filters = { query: "", status: "all", category: "all" };
const CHANGE_EVENT = "researchkit-filters-change";

/** The filters live in the address, so a filtered list can be shared, bookmarked and linked to. */
function readFilters(): string {
  return window.location.search;
}

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function parse(search: string | null): Filters {
  if (search === null) return NO_FILTERS;
  const params = new URLSearchParams(search);
  const status = params.get("status");
  return {
    query: params.get("q") ?? "",
    status: status === "available" || status === "coming-soon" ? status : "all",
    category: params.get("category") ?? "all",
  };
}

function write(filters: Filters) {
  const params = new URLSearchParams(window.location.search);
  const set = (key: string, value: string, empty: string) => (value === empty ? params.delete(key) : params.set(key, value));
  set("q", filters.query, "");
  set("status", filters.status, "all");
  set("category", filters.category, "all");
  const search = params.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * A catalogue directory with search and filters. Cards are rendered on the
 * server and only shown or hidden here, so the page is complete without
 * scripts; the filters appear once scripts run.
 */
export function CatalogueExplorer({ sections, plural, highlights }: CatalogueExplorerProps) {
  const labels = explorerCopy(plural);
  const search = useSyncExternalStore(subscribe, readFilters, () => null);
  const ready = search !== null;
  const filters = parse(search);
  const update = (change: Partial<Filters>) => write({ ...filters, ...change });

  const words = queryWords(filters.query);
  const matches = (item: ExplorerItem) =>
    (filters.status === "all" || item.status === filters.status) && words.every((word) => normalize(item.text).includes(word));
  const filtering = filters.query.trim() !== "" || filters.status !== "all" || filters.category !== "all";
  const shown = sections
    .filter((section) => filters.category === "all" || section.id === filters.category)
    .map((section) => ({ ...section, items: section.items.filter(matches) }))
    .filter((section) => !filtering || section.items.length > 0);
  const resultCount = shown.reduce((total, section) => total + section.items.length, 0);

  const everything = sections.flatMap((section) => section.items);
  const count = (status: CatalogueStatus) => everything.filter((item) => item.status === status).length;

  return (
    <>
      <div className={cx("z-(--z-raised) -mx-2 bg-canvas/80 px-2 pt-6 pb-3 backdrop-blur-md md:sticky md:top-header print:hidden", !ready && "invisible")}>
        <Toolbar label={labels.toolbar} className="gap-x-6 gap-y-3">
          <SearchBar
            label={labels.search}
            placeholder={labels.searchPlaceholder}
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            className="min-w-0 flex-1 basis-64"
          />
          <ChoiceChips
            name="status"
            legend={labels.status}
            hideLegend
            appearance="segmented"
            value={filters.status}
            onChange={(status) => update({ status })}
            options={[
              { value: "all", label: labels.all, meta: everything.length },
              { value: "available", label: labels.available, meta: count("available") },
              { value: "coming-soon", label: labels.comingSoon, meta: count("coming-soon") },
            ]}
          />
        </Toolbar>
        <ChoiceChips
          name="category"
          legend={labels.category}
          hideLegend
          value={filters.category}
          onChange={(category) => update({ category })}
          options={[{ value: "all", label: labels.all }, ...sections.map((section) => ({ value: section.id, label: section.title, icon: section.icon, meta: section.items.length }))]}
          className="mt-3"
        />
      </div>

      <p role="status" className="sr-only">
        {ready && filtering ? labels.results(resultCount) : ""}
      </p>

      {!filtering && highlights}

      {filtering && resultCount === 0 && (
        <div className="py-section-compact">
          <EmptyState
            icon="search"
            title={labels.noResults}
            level={2}
            action={
              <Button variant="secondary" onClick={() => write(NO_FILTERS)}>
                {labels.clear}
              </Button>
            }
          >
            {labels.noResultsHint}
          </EmptyState>
        </div>
      )}

      {shown.map((section) => {
        const available = section.items.filter((item) => item.status === "available").length;
        return (
          <Section key={section.id} id={section.id} labelledBy={`${section.id}-title`} spacing="compact">
            <SectionHeader
              id={`${section.id}-title`}
              title={
                <span className="inline-flex items-center gap-3">
                  <Icon name={section.icon} className="size-6 text-action" />
                  {section.title}
                </span>
              }
              note={labels.summary(available, section.items.length - available)}
              description={section.description}
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <Fragment key={item.id}>{item.card}</Fragment>
              ))}
            </ul>
          </Section>
        );
      })}
    </>
  );
}
