import type { Metadata } from "next";
import { GuidesIndexPage, guidesIndex } from "@/templates/guides-index";

export const metadata: Metadata = {
  title: guidesIndex.title,
  description: guidesIndex.metaDescription,
};

export default function Page() {
  return <GuidesIndexPage />;
}
