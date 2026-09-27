import packageJson from "../../package.json";

/** Site identity. The name is temporary until the brand is applied. */
export const site = {
  name: "ResearchKit",
  /** What the product is, in a few words: shown beside the name. */
  tagline: "Academic research workspace",
  description: "Free academic tools that get it exactly right, and show you why.",
  /** The released version, read from the package so it can't drift. */
  version: packageJson.version,
  /** The public source repository. */
  repository: "https://github.com/demeanour47/researchkit",
  /** Project documentation: product, architecture and decisions. */
  documentation: "https://github.com/demeanour47/researchkit/tree/main/docs",
} as const;
