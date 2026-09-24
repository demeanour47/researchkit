/** Standalone content pages. Addresses are provisional until the URL strategy (ADR-0005) is accepted. */

import { about } from "../../../content/pages/about";
import type { ContentPage } from "./page";

export const ABOUT_PATH = "/about";

export function getAboutPage(): ContentPage {
  return about;
}
