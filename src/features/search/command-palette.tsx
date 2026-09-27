"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon, IconTile, Kbd, cx, type IconName } from "@/ui";
import { searchItems } from "./match";
import { SEARCH_GROUPS, type SearchItem } from "./types";

const labels = {
  trigger: "Search",
  triggerHint: "Search tools and guides…",
  title: "Search ResearchKit",
  input: "Search tools, guides, styles and pages",
  placeholder: "Search tools, guides and styles…",
  results: "Results",
  count: (count: number) => (count === 0 ? "No results" : count === 1 ? "1 result" : `${count} results`),
  none: (query: string) => `Nothing matches “${query}”.`,
  noneHint: "Try a tool's name, a task such as “cite” or “chart”, or a citation style.",
  move: "to move",
  open: "to open",
  close: "to close",
} as const;

const noSubscription = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/**
 * Global search: a button in the header, or ⌘K / Ctrl+K anywhere, opens a
 * dialog that finds tools, guides, citation styles and pages as you type.
 * The input is a combobox controlling a grouped listbox: arrow keys move
 * through results, Enter opens one, Escape closes and returns focus.
 */
export function CommandPalette({ items }: { items: readonly SearchItem[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  // Results are only rendered while the dialog is open, so they add nothing to every page's HTML.
  const [isOpen, setIsOpen] = useState(false);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const titleId = `${baseId}-title`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  // The button needs scripts to work, so it stays hidden (keeping its space) until they run.
  const ready = useSyncExternalStore(noSubscription, () => true, () => false);
  const shortcut = useSyncExternalStore(noSubscription, () => (isMac() ? "⌘K" : "Ctrl K"), () => "⌘K");

  const results = useMemo(() => (isOpen ? searchItems(items, query) : []), [isOpen, items, query]);
  // With a query, the group holding the best match comes first; arrow keys follow what is on screen.
  const groupOrder = query.trim() ? [...new Set(results.map((item) => item.group))] : SEARCH_GROUPS;
  const groups = groupOrder.map((group) => ({ group, items: results.filter((item) => item.group === group) })).filter((entry) => entry.items.length > 0);
  const ordered = groups.flatMap((entry) => entry.items);
  const positions = new Map(ordered.map((item, index) => [item.id, index]));
  const active = Math.min(activeIndex, Math.max(ordered.length - 1, 0));

  function open() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActiveIndex(0);
    setIsOpen(true);
    dialog.showModal();
    inputRef.current?.focus();
  }

  function go(item: SearchItem | undefined) {
    if (!item) return;
    dialogRef.current?.close();
    router.push(item.href);
  }

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialogRef.current?.open) dialogRef.current.close();
        else open();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
    // optionId only depends on baseId, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (ordered.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((active + step + ordered.length) % ordered.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(ordered[active]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        aria-label={labels.trigger}
        className={cx(
          "inline-flex min-h-control-sm items-center gap-2 rounded-control border border-border bg-surface px-2.5 text-small text-text-muted shadow-card",
          "transition-[border-color,color] duration-(--duration-instant) ease-standard hover:border-border-strong hover:text-text focus-ring",
          "lg:min-w-60 lg:justify-between",
          !ready && "invisible",
        )}
      >
        <span className="flex items-center gap-2">
          <Icon name="search" className="size-4" />
          <span className="hidden lg:inline">{labels.triggerHint}</span>
        </span>
        <span className="hidden lg:inline">
          <Kbd>{shortcut}</Kbd>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          // A click on the backdrop lands on the dialog itself.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className={cx(
          "fixed inset-x-0 top-[10vh] mx-auto my-0 w-[min(42rem,calc(100%-2rem))] max-w-none overflow-hidden rounded-panel border border-border-strong bg-raised p-0 text-text shadow-overlay",
          "backdrop:bg-canvas/70 backdrop:backdrop-blur-sm open:animate-scale-in",
        )}
      >
        <h2 id={titleId} className="sr-only">
          {labels.title}
        </h2>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Icon name="search" className="size-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label={labels.input}
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={ordered.length > 0 ? optionId(active) : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={labels.placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            className="min-h-14 flex-1 bg-transparent text-lead text-text outline-none placeholder:text-text-muted"
          />
          <Kbd>Esc</Kbd>
        </div>

        <p role="status" className="sr-only">
          {isOpen ? labels.count(ordered.length) : ""}
        </p>

        <div id={listboxId} role="listbox" aria-label={labels.results} className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain p-2">
          {groups.map(({ group, items: groupItems }) => {
            const groupId = `${baseId}-${group.replace(/\s+/g, "-").toLowerCase()}`;
            return (
              <div key={group} role="group" aria-labelledby={groupId} className="pb-2">
                <div id={groupId} className="px-3 pt-2 pb-1.5 text-caption font-semibold tracking-wide text-text-muted uppercase">
                  {group}
                </div>
                {groupItems.map((item) => {
                  const index = positions.get(item.id) ?? 0;
                  const selected = index === active;
                  return (
                    <div
                      key={item.id}
                      id={optionId(index)}
                      role="option"
                      aria-selected={selected}
                      onClick={() => go(item)}
                      onMouseMove={() => !selected && setActiveIndex(index)}
                      className={cx(
                        "flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5",
                        selected ? "bg-action-soft" : "hover:bg-hover",
                      )}
                    >
                      <IconTile icon={item.icon as IconName} size="sm" tone={selected ? "action" : "neutral"} />
                      <div className="grid min-w-0 flex-1">
                        <span className={cx("truncate", selected && "font-medium")}>{item.title}</span>
                        <span className="truncate text-small text-text-muted">{item.description}</span>
                      </div>
                      <Icon name="corner-down-left" className={cx("text-text-muted", !selected && "invisible")} />
                    </div>
                  );
                })}
              </div>
            );
          })}
          {isOpen && ordered.length === 0 && (
            <div className="grid justify-items-center gap-1 px-6 py-10 text-center">
              <p className="font-medium">{labels.none(query.trim())}</p>
              <p className="text-small text-text-muted">{labels.noneHint}</p>
            </div>
          )}
        </div>

        <div aria-hidden="true" className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-sunken px-4 py-2.5 text-caption text-text-muted">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            {labels.move}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            {labels.open}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            {labels.close}
          </span>
        </div>
      </dialog>
    </>
  );
}
