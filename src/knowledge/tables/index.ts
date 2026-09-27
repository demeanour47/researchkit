export {
  BORDER_STYLES,
  CORRELATION_METHODS,
  DEFAULT_TABLE_OPTIONS,
  NUMBER_ALIGNS,
  ORIENTATIONS,
  PADDINGS,
  PERCENT_BASES,
  SUPPRESS_BELOW,
  TABLE_FONTS,
  TABLE_GROUPS,
  TABLE_GROUP_LABELS,
  TABLE_STYLES,
  TABLE_TYPES,
  TABLE_TYPE_INFO,
  TEXT_ALIGNS,
  UNNUMBERED_TYPES,
  getTableType,
  typeDefaults,
  type BorderStyle,
  type CorrelationMethod,
  type NumberAlign,
  type Orientation,
  type Padding,
  type PercentBase,
  type ResearchTable,
  type TableCell,
  type TableFont,
  type TableGroup,
  type TableOptions,
  type TableRow,
  type TableSource,
  type TableStyleId,
  type TableType,
  type TableTypeInfo,
  type TextAlign,
  type TextRun,
} from "./types";
export { FONT_FAMILIES, FONT_SIZES, TABLE_STYLE_LABELS, TABLE_STYLE_SPECS, applyTableStyle, styleSpec, type TableStyleSpec } from "./styles";
export { captionLines, noteParagraphs, runsText, tableLabel } from "./caption";
export { buildTable, canShow, tableIssues, type TableInput } from "./build";
export type { BuildResult, TableIssue } from "./build-common";
export { tableHtml, tableHtmlDocument } from "./html";
export { tableCsv, tableMarkdown, tablePlainText, tableTsv } from "./text";
export { tableDocx } from "./docx";
export { tablePdf } from "./pdf";
export { recommendTables, type TableSuggestion } from "./recommend";
export { TABLE_LIMITATIONS, TABLE_REVIEW_ITEMS } from "./limits";
