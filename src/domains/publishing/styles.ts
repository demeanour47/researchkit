/**
 * The style registry: which citation styles have a page, and their shared
 * editorial description. Only styles listed here may be linked to.
 */

import { styleProfiles } from "../../../content/styles/style-profiles";
import type { StyleId } from "@/knowledge/citation/styles";
import { PROFILED_STYLES, type ProfiledStyleId, type StyleProfile } from "./style-profile";

/** Addresses are provisional until the URL strategy (ADR-0005) is accepted. */
export const STYLES_INDEX_PATH = "/styles";
export const stylePath = (style: ProfiledStyleId) => `${STYLES_INDEX_PATH}/${style}`;

export function hasStylePage(style: StyleId): style is ProfiledStyleId {
  return (PROFILED_STYLES as readonly StyleId[]).includes(style);
}

export function getStyleProfile(style: ProfiledStyleId): StyleProfile {
  return styleProfiles[style];
}

export function profiledStyles(): readonly ProfiledStyleId[] {
  return PROFILED_STYLES;
}
