import type { Metadata } from "next";
import { ToolsIndexPage, toolsIndex } from "@/templates/tools-index";

export const metadata: Metadata = {
  title: toolsIndex.title,
  description: toolsIndex.metaDescription,
};

export default function Page() {
  return <ToolsIndexPage />;
}
