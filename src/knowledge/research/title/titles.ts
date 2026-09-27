/**
 * The researcher's own titles: one working title, alternatives, favourites, and each
 * title's earlier versions. Pure data: every change returns a new set, and nothing
 * here writes a title; it only keeps what the researcher typed.
 */

import { normalise } from "../question-text";

export interface TitleVersion {
  text: string;
  /** When this wording was replaced, in milliseconds. */
  replacedAt: number;
}

export interface CandidateTitle {
  id: string;
  text: string;
  favourite: boolean;
  /** Earlier wordings, newest first. */
  history: readonly TitleVersion[];
}

export interface TitleSet {
  titles: readonly CandidateTitle[];
  /** The title the project uses. Always one of `titles` while there are any. */
  workingId: string | null;
}

/** How many earlier versions each title keeps. */
export const HISTORY_LIMIT = 20;

export const EMPTY_TITLE_SET: TitleSet = { titles: [], workingId: null };

const nextId = (set: TitleSet) => `title-${set.titles.reduce((highest, title) => Math.max(highest, Number(title.id.replace("title-", "")) || 0), 0) + 1}`;

/** Adds a title. The first title becomes the working title. Blank or repeated titles are refused (the same set is returned). */
export function addTitle(set: TitleSet, text: string): TitleSet {
  const clean = normalise(text);
  if (!clean || set.titles.some((title) => title.text.toLowerCase() === clean.toLowerCase())) return set;
  const title: CandidateTitle = { id: nextId(set), text: clean, favourite: false, history: [] };
  return { titles: [...set.titles, title], workingId: set.workingId ?? title.id };
}

/**
 * Replaces a title's wording, keeping the old wording in its history. Unchanged or
 * blank wording leaves the set as it is.
 */
export function editTitle(set: TitleSet, id: string, text: string, now: number): TitleSet {
  const clean = normalise(text);
  const title = set.titles.find((candidate) => candidate.id === id);
  if (!title || !clean || clean === title.text) return set;
  const history = [{ text: title.text, replacedAt: now }, ...title.history].slice(0, HISTORY_LIMIT);
  return { ...set, titles: set.titles.map((candidate) => (candidate.id === id ? { ...candidate, text: clean, history } : candidate)) };
}

/** Brings back an earlier wording. The current wording goes into the history, so restoring can itself be undone. */
export function restoreVersion(set: TitleSet, id: string, index: number, now: number): TitleSet {
  const version = set.titles.find((candidate) => candidate.id === id)?.history[index];
  return version ? editTitle(set, id, version.text, now) : set;
}

/** Removes a title. If it was the working title, the first remaining title takes its place. */
export function removeTitle(set: TitleSet, id: string): TitleSet {
  const titles = set.titles.filter((title) => title.id !== id);
  const workingId = set.workingId === id ? (titles[0]?.id ?? null) : set.workingId;
  return { titles, workingId };
}

export function setWorkingTitle(set: TitleSet, id: string): TitleSet {
  return set.titles.some((title) => title.id === id) ? { ...set, workingId: id } : set;
}

export function toggleFavourite(set: TitleSet, id: string): TitleSet {
  return { ...set, titles: set.titles.map((title) => (title.id === id ? { ...title, favourite: !title.favourite } : title)) };
}

export const workingTitle = (set: TitleSet): CandidateTitle | null => set.titles.find((title) => title.id === set.workingId) ?? null;

/** A set that starts from the project's saved title, when there is one. */
export const titleSetFrom = (projectTitle: string | undefined): TitleSet => (projectTitle ? addTitle(EMPTY_TITLE_SET, projectTitle) : EMPTY_TITLE_SET);
