/**
 * The Research Onion Summary as downloadable documents: Markdown, plain text and a
 * self-contained, print-friendly HTML page. Pure functions of the summary, so every
 * format says exactly the same thing.
 */

import { EVIDENCE_LABELS, FIT_LABELS, SUMMARY_LABELS, SUMMARY_TEXT } from "./labels";
import type { OnionSummary } from "./recommendation";
import { doiUrl, getReference, referenceMarkdown, referenceText } from "./references";
import { findOption } from "./research-onion";
import type { Judgement, Reference } from "./types";
import { LAYER_ORDER } from "./types";

/** A document outline shared by every format, so they cannot drift apart. */
interface Block {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  /** Sub-sections, one per combination that needs attention. */
  entries?: { heading: string; lines: { label?: string; text: string }[] }[];
  references?: Reference[];
}

const optionName = (id: string) => findOption(id)?.name ?? id;
const pairName = (judgement: Judgement) => `${optionName(judgement.later)} with ${optionName(judgement.earlier)}`;
const cites = (ids: readonly string[], all: Reference[]) =>
  ids.map((id) => all.find((reference) => reference.id === id)?.cite ?? id).join("; ");

function outline(summary: OnionSummary, references: Reference[]): Block[] {
  const chosen = new Map(summary.choices.map(({ layer, option }) => [layer, option.name]));
  const blocks: Block[] = [
    {
      heading: SUMMARY_TEXT.choices,
      items: LAYER_ORDER.map((layer) => `${SUMMARY_LABELS[layer]}: ${chosen.get(layer) ?? SUMMARY_TEXT.notChosen}`),
    },
  ];

  const strong = summary.judgements.filter((judgement) => judgement.fit === "strong");
  if (summary.judgements.length > 0) {
    blocks.push({
      heading: SUMMARY_TEXT.whyItWorks,
      ...(strong.length > 0
        ? { items: strong.map((judgement) => `${judgement.reason} (${EVIDENCE_LABELS[judgement.evidence.level]})`) }
        : { paragraphs: [SUMMARY_TEXT.noStrongFits] }),
    });
  }

  const attention = summary.judgements.filter((judgement) => judgement.fit !== "strong");
  if (attention.length > 0) {
    blocks.push({
      heading: SUMMARY_TEXT.needsAttention,
      entries: attention.map((judgement) => {
        const { evidence, alternativeView } = judgement;
        const lines: { label?: string; text: string }[] = [
          { text: judgement.reason },
          {
            label: SUMMARY_TEXT.evidence,
            text:
              EVIDENCE_LABELS[evidence.level] +
              (evidence.sources.length > 0 ? ` (${cites(evidence.sources, references)})` : ""),
          },
        ];
        if (alternativeView) {
          lines.push({
            label: SUMMARY_TEXT.alternativeView,
            text: `${alternativeView.text} (${cites(alternativeView.sources, references)})`,
          });
        }
        if (judgement.justify) lines.push({ label: SUMMARY_TEXT.justify, text: judgement.justify });
        return { heading: `${pairName(judgement)}: ${FIT_LABELS[judgement.fit]}`, lines };
      }),
    });
  }

  if (summary.weaknesses.length > 0) blocks.push({ heading: SUMMARY_TEXT.weaknesses, items: summary.weaknesses });
  if (summary.toJustify.length > 0) blocks.push({ heading: SUMMARY_TEXT.toJustify, items: summary.toJustify });
  if (references.length > 0) blocks.push({ heading: SUMMARY_TEXT.furtherReading, references });
  return blocks;
}

/**
 * Every reference the document mentions: further reading first, then any evidence
 * or alternative-view sources not already listed, so every citation has an entry.
 */
function documentReferences(summary: OnionSummary): Reference[] {
  const ids = [
    ...summary.furtherReading.map((reference) => reference.id),
    ...summary.judgements.flatMap((judgement) => [
      ...(judgement.fit === "strong" ? [] : judgement.evidence.sources),
      ...(judgement.alternativeView?.sources ?? []),
    ]),
  ];
  return [...new Set(ids)].map(getReference);
}


const sortReferences = (references: Reference[]) =>
  [...references].sort((a, b) => a.apa.localeCompare(b.apa, "en"));

function prepare(summary: OnionSummary) {
  const references = sortReferences(documentReferences(summary));
  return outline(summary, references);
}

export function toMarkdown(summary: OnionSummary): string {
  const lines = [`# ${SUMMARY_TEXT.title}`, "", SUMMARY_TEXT.intro];
  for (const block of prepare(summary)) {
    lines.push("", `## ${block.heading}`, "");
    for (const paragraph of block.paragraphs ?? []) lines.push(paragraph);
    for (const item of block.items ?? []) lines.push(`- ${item}`);
    for (const [index, entry] of (block.entries ?? []).entries()) {
      if (index > 0) lines.push("");
      lines.push(`### ${entry.heading}`, "");
      lines.push(entry.lines.map((line) => (line.label ? `**${line.label}:** ${line.text}` : line.text)).join("\n\n"));
    }
    for (const reference of block.references ?? []) lines.push(`- ${referenceMarkdown(reference)}`);
  }
  lines.push("", "---", "", SUMMARY_TEXT.footer, "");
  return lines.join("\n");
}

export function toPlainText(summary: OnionSummary): string {
  const underline = (text: string, character: string) => `${text}\n${character.repeat(text.length)}`;
  const lines = [underline(SUMMARY_TEXT.title.toUpperCase(), "="), "", SUMMARY_TEXT.intro];
  for (const block of prepare(summary)) {
    lines.push("", underline(block.heading, "-"), "");
    for (const paragraph of block.paragraphs ?? []) lines.push(paragraph);
    for (const item of block.items ?? []) lines.push(`- ${item}`);
    for (const [index, entry] of (block.entries ?? []).entries()) {
      if (index > 0) lines.push("");
      lines.push(entry.heading);
      for (const line of entry.lines) lines.push(line.label ? `  ${line.label}: ${line.text}` : `  ${line.text}`);
    }
    for (const reference of block.references ?? []) lines.push(`- ${referenceText(reference)}`);
  }
  lines.push("", SUMMARY_TEXT.footer, "");
  return lines.join("\n");
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function referenceHtml(reference: Reference): string {
  const body = reference.apa
    .split("*")
    .map((part, index) => (index % 2 === 1 ? `<i>${escapeHtml(part)}</i>` : escapeHtml(part)))
    .join("");
  if (!reference.doi) return body;
  const url = escapeHtml(doiUrl(reference.doi));
  return `${body} <a href="${url}">${url}</a>`;
}

const PRINT_STYLES = `
  body { font-family: Georgia, "Times New Roman", serif; line-height: 1.5; color: #111; background: #fff; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; }
  h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
  h2 { font-size: 1.25rem; margin-top: 2rem; border-bottom: 1px solid #999; padding-bottom: 0.25rem; }
  h3 { font-size: 1rem; margin-top: 1.25rem; }
  ul { padding-left: 1.5rem; }
  li { margin-bottom: 0.5rem; }
  .references li { list-style: none; text-indent: -1.5rem; padding-left: 1.5rem; margin-left: -1.5rem; }
  a { color: inherit; }
  footer { margin-top: 2.5rem; font-size: 0.875rem; color: #444; border-top: 1px solid #999; padding-top: 0.75rem; }
  @page { margin: 2cm; }
  @media print { body { margin: 0; max-width: none; } h2, h3 { break-after: avoid; } li { break-inside: avoid; } }
`;

export function toPrintHtml(summary: OnionSummary): string {
  const parts = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(SUMMARY_TEXT.title)}</title>`,
    `<style>${PRINT_STYLES}</style>`,
    "</head>",
    "<body>",
    "<main>",
    `<h1>${escapeHtml(SUMMARY_TEXT.title)}</h1>`,
    `<p>${escapeHtml(SUMMARY_TEXT.intro)}</p>`,
  ];
  for (const block of prepare(summary)) {
    parts.push("<section>", `<h2>${escapeHtml(block.heading)}</h2>`);
    for (const paragraph of block.paragraphs ?? []) parts.push(`<p>${escapeHtml(paragraph)}</p>`);
    if (block.items) parts.push(`<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
    for (const entry of block.entries ?? []) {
      parts.push(`<h3>${escapeHtml(entry.heading)}</h3>`);
      for (const line of entry.lines) {
        parts.push(
          line.label
            ? `<p><strong>${escapeHtml(line.label)}:</strong> ${escapeHtml(line.text)}</p>`
            : `<p>${escapeHtml(line.text)}</p>`,
        );
      }
    }
    if (block.references) {
      parts.push(`<ul class="references">${block.references.map((reference) => `<li>${referenceHtml(reference)}</li>`).join("")}</ul>`);
    }
    parts.push("</section>");
  }
  parts.push("</main>", `<footer><p>${escapeHtml(SUMMARY_TEXT.footer)}</p></footer>`, "</body>", "</html>", "");
  return parts.join("\n");
}
