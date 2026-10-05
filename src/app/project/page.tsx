import type { Metadata } from "next";
import { ProjectPage, projectPage } from "@/templates/project";

export const metadata: Metadata = {
  title: projectPage.title,
  description: projectPage.metaDescription,
};

export default function Page() {
  return <ProjectPage />;
}
