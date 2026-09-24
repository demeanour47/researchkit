/** The finder's catalogue id, used to relate it to guides. */
export const TOOL_ID = "citation-style-finder";

/** The finder's address. Provisional until the URL strategy (ADR-0005) is accepted. */
export const TOOL_PATH = "/tools/citation-style-finder";

/** Placeholder address for a style's full guide, provisional for the same reason. */
export const styleGuidePath = (styleId: string) => `/styles/${styleId}`;
