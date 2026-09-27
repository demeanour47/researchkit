import type { Metadata } from "next";
import { WorkspacePage, workspacePage } from "@/templates/workspace";

export const metadata: Metadata = {
  title: workspacePage.title,
  description: workspacePage.metaDescription,
};

export default function Page() {
  return <WorkspacePage />;
}
