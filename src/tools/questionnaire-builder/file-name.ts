/** A file name from the questionnaire's title: lower case, hyphenated, and never empty. Pure, so it is tested. */
export function fileName(title: string, extension: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return `${base || "questionnaire"}.${extension}`;
}
