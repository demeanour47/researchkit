/**
 * Tables as HTML, with formatting in inline styles so it survives pasting into Word.
 * Two forms:
 * - document: accessible markup for the page and HTML export. The caption is a
 *   <caption>; header cells are <th> with scope and ids, and every data cell names its
 *   headers; groups of rows are separate <tbody> elements headed by a row group header.
 * - word: the same table with the caption and notes as paragraphs, which Word keeps as
 *   ordinary text above and below the table when pasted.
 */

import { captionAlign, captionLines, noteParagraphs } from "./caption";
import { styleSpec, FONT_FAMILIES, PADDING_POINTS } from "./styles";
import type { ResearchTable, TableCell, TableOptions, TableRow, TextRun } from "./types";

export const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const RULE = "1pt solid #000000";
const SHADE = "#f2f2f2";
const HIDDEN = "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0";

function runsHtml(runs: readonly TextRun[]): string {
  return runs
    .map((run) => {
      let html = escapeHtml(run.text);
      if (run.superscript) html = `<sup>${html}</sup>`;
      if (run.italic) html = `<i>${html}</i>`;
      if (run.bold) html = `<b>${html}</b>`;
      if (run.smallCaps) html = `<span style="font-variant:small-caps">${html}</span>`;
      return html;
    })
    .join("");
}

/** Which columns a header cell covers, and its position, row by row. */
function headerLayout(table: ResearchTable) {
  return table.header.map((cells) => {
    let column = 0;
    return cells.map((cell) => {
      const start = column;
      column += cell.span ?? 1;
      return { cell, start, end: column - 1 };
    });
  });
}

/** Whether each column holds numbers, judged from its body cells. */
export function numericColumns(table: ResearchTable): boolean[] {
  return Array.from({ length: table.columns }, (_, column) => {
    const cells = table.rows.filter((candidate) => candidate.kind !== "group").map((candidate) => cellAt(candidate, column)).filter((cell): cell is TableCell => Boolean(cell?.text));
    return cells.length > 0 && cells.every((cell) => cell.numeric);
  });
}

/** A single number, as decimal tabs can align: “−0.52”, “1,204”, “< .001”, “.48**”. Not “4 (66.7)” or “—”. */
export const isPlainNumber = (text: string) => /^(?:[<>]\s?)?[−-]?(?:\d[\d,]*)?(?:\.\d+)?\**$/.test(text.trim()) && /\d/.test(text);

/** Columns whose every value is a single number, so they can align on the decimal point. */
export function decimalColumns(table: ResearchTable): boolean[] {
  return numericColumns(table).map((isNumber, column) => {
    if (!isNumber || column === 0) return false;
    return table.rows.filter((candidate) => candidate.kind !== "group").every((candidate) => {
      const cell = cellAt(candidate, column);
      return !cell || !cell.text || cell.text === "—" || isPlainNumber(cell.text);
    });
  });
}

/** The cell covering a column in a row, if the row starts one there. */
function cellAt(candidate: TableRow, column: number): TableCell | undefined {
  let position = 0;
  for (const cell of candidate.cells) {
    if (position === column) return cell;
    position += cell.span ?? 1;
  }
  return undefined;
}

export interface HtmlOptions {
  mode: "document" | "word";
  /** Prefix for element ids, unique on the page. */
  idPrefix?: string;
}

/** The table and its caption and notes as an HTML fragment. */
export function tableHtml(table: ResearchTable, options: TableOptions, { mode, idPrefix = "rt" }: HtmlOptions): string {
  const spec = styleSpec(options);
  const font = FONT_FAMILIES[options.font];
  const pad = PADDING_POINTS[options.padding];
  const numeric = numericColumns(table);
  const layout = headerLayout(table);
  const text = `font-family:${font.css};font-size:${options.fontSize}pt;line-height:1.2;color:#000000`;
  const captionHtml = captionLines(table, options)
    .map((line) => `<span style="display:block">${runsHtml(line)}</span>`)
    .join("");
  const notes = noteParagraphs(table, options);
  const notesId = `${idPrefix}-notes`;
  const border = (sides: { top?: boolean; bottom?: boolean }) => {
    if (options.borders === "grid") return `border:${RULE};`;
    if (options.borders === "none") return "";
    return `${sides.top ? `border-top:${RULE};` : ""}${sides.bottom ? `border-bottom:${RULE};` : ""}`;
  };
  const outer = (column: number, span: number) => (options.borders === "outer" ? `${column === 0 ? `border-left:${RULE};` : ""}${column + span === table.columns ? `border-right:${RULE};` : ""}` : "");
  const align = (column: number, cell: TableCell, header: boolean) => {
    if (column === 0) return "left";
    if (header) return "center";
    if (numeric[column] || cell.numeric) return options.numberAlign === "center" ? "center" : "right";
    return options.textAlign;
  };
  const cellStyle = (column: number, cell: TableCell, header: boolean, extra: string) =>
    `${extra}padding:${pad.vertical}pt ${pad.horizontal}pt ${pad.vertical}pt ${pad.horizontal + (cell.indent ?? 0) * 12}pt;text-align:${align(column, cell, header)};vertical-align:${header ? "bottom" : "top"};${
      header ? `font-weight:${options.boldHeaders ? "bold" : "normal"};` : cell.bold ? "font-weight:bold;" : "font-weight:normal;"
    }${cell.italic ? "font-style:italic;" : ""}${numeric[column] && !header ? "font-variant-numeric:tabular-nums;" : ""}`;
  const content = (cell: TableCell) => {
    const notesHtml = (cell.notes ?? []).map((mark) => `<sup>${escapeHtml(mark)}</sup>`).join("");
    if (cell.mark) return mode === "word" ? escapeHtml(cell.text) : `<span aria-hidden="true">${escapeHtml(cell.text)}</span><span style="${HIDDEN}">Yes</span>`;
    return `${escapeHtml(cell.text)}${notesHtml}`;
  };
  const document = mode === "document";

  // Header rows.
  const headerIds = layout.map((cells, rowIndex) => cells.map(({ start }) => `${idPrefix}-h${rowIndex}-${start}`));
  const lastHeader = table.header.length - 1;
  const headRows = layout
    .map((cells, rowIndex) => {
      const html = cells
        .map(({ cell, start }, index) => {
          const span = cell.span ?? 1;
          const top = rowIndex === 0;
          const bottom = rowIndex === lastHeader || (span > 1 && cell.text.trim() !== "");
          const attributes = document ? ` id="${headerIds[rowIndex][index]}" scope="${span > 1 ? "colgroup" : "col"}"` : "";
          return `<th${attributes}${span > 1 ? ` colspan="${span}"` : ""} style="${cellStyle(start, cell, true, border({ top, bottom }) + outer(start, span))}">${content(cell)}</th>`;
        })
        .join("");
      return `<tr>${html}</tr>`;
    })
    .join("");

  // Column header ids covering each column, for data cells' headers attribute.
  const columnHeaders = (column: number) => layout.flatMap((cells, rowIndex) => cells.filter(({ start, end, cell }) => column >= start && column <= end && cell.text.trim() !== "").map(({ start }) => `${idPrefix}-h${rowIndex}-${start}`));

  // Body rows, split into groups at group rows.
  const groups: { heading: TableRow | null; rows: TableRow[] }[] = [{ heading: null, rows: [] }];
  for (const candidate of table.rows) {
    if (candidate.kind === "group") groups.push({ heading: candidate, rows: [] });
    else groups[groups.length - 1].rows.push(candidate);
  }
  const lastBodyRow = table.rows[table.rows.length - 1];
  let bodyIndex = 0;
  const bodies = groups
    .filter((group) => group.heading || group.rows.length > 0)
    .map((group, groupIndex) => {
      const groupId = `${idPrefix}-g${groupIndex}`;
      const rows: string[] = [];
      if (group.heading) {
        const cell = group.heading.cells[0];
        const bottom = group.heading === lastBodyRow;
        rows.push(`<tr><th${document ? ` id="${groupId}" scope="rowgroup"` : ""} colspan="${table.columns}" style="${cellStyle(0, cell, false, border({ bottom }) + outer(0, table.columns))}text-align:left">${content(cell)}</th></tr>`);
      }
      group.rows.forEach((candidate) => {
        const shade = options.alternatingRows && bodyIndex % 2 === 1 ? `background-color:${SHADE};` : "";
        bodyIndex++;
        const rowId = `${idPrefix}-r${bodyIndex}`;
        const bottom = candidate === lastBodyRow;
        const top = candidate.kind === "total";
        let column = 0;
        const cells = candidate.cells
          .map((cell, index) => {
            const span = cell.span ?? 1;
            const start = column;
            column += span;
            const style = cellStyle(start, cell, false, shade + border({ top, bottom }) + outer(start, span));
            const colspan = span > 1 ? ` colspan="${span}"` : "";
            if (index === 0 && table.rowHeaders) return `<th${document ? ` id="${rowId}" scope="row"${group.heading ? ` headers="${groupId}"` : ""}` : ""}${colspan} style="${style}">${content(cell)}</th>`;
            const headers = document ? [...(table.rowHeaders ? [rowId] : []), ...(group.heading ? [groupId] : []), ...columnHeaders(start)].join(" ") : "";
            return `<td${headers ? ` headers="${headers}"` : ""}${colspan} style="${style}">${content(cell)}</td>`;
          })
          .join("");
        rows.push(`<tr style="page-break-inside:avoid">${cells}</tr>`);
      });
      return `<tbody>${rows.join("")}</tbody>`;
    })
    .join("");

  // Tables span the text width, as theses and journals set them.
  const tableStyle = `width:100%;border-collapse:collapse;${options.borders === "outer" ? `border:${RULE};` : ""}${text}`;
  const notesHtml = notes.map((paragraph) => `<p style="margin:0 0 2pt 0;text-align:left;${text}">${runsHtml(paragraph)}</p>`).join("");
  const alignCaption = captionAlign(table, options);
  if (document) {
    const caption = `<caption style="caption-side:${spec.position === "below" ? "bottom" : "top"};text-align:${alignCaption};padding:0 0 6pt 0;${text}">${captionHtml}</caption>`;
    return `<div style="${text}"><table style="${tableStyle}"${notes.length > 0 ? ` aria-describedby="${notesId}"` : ""}>${caption}<thead style="display:table-header-group">${headRows}</thead>${bodies}</table>${
      notes.length > 0 ? `<div id="${notesId}" style="margin-top:4pt">${notesHtml}</div>` : ""
    }</div>`;
  }
  const captionParagraph = `<p style="margin:0 0 6pt 0;text-align:${alignCaption};${text}">${captionLines(table, options)
    .map((line) => runsHtml(line))
    .join("<br>")}</p>`;
  const tableHtmlText = `<table style="${tableStyle}"><thead>${headRows}</thead>${bodies}</table>`;
  return `${spec.position === "above" ? captionParagraph : ""}${tableHtmlText}${spec.position === "below" ? captionParagraph : ""}${notes.length > 0 ? `<div style="margin-top:4pt">${notesHtml}</div>` : ""}`;
}

/** A standalone HTML document with the table, for saving and printing. The page is A4 in the chosen orientation. */
export function tableHtmlDocument(table: ResearchTable, options: TableOptions): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(table.title)}</title>
<style>@page { size: A4 ${options.orientation}; margin: 2cm; } body { margin: 2rem; background: #ffffff; } table { margin: 0; }</style>
</head>
<body>
${tableHtml(table, options, { mode: "document" })}
</body>
</html>
`;
}
