import type { Metadata } from "next";
import { getAboutPage } from "@/domains/publishing";
import { AboutPage } from "@/templates/about";

const page = getAboutPage();

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

export default function Page() {
  return <AboutPage page={page} />;
}
