import type { Metadata } from "next";
import { StylesIndexPage, stylesIndex } from "@/templates/styles-index";

export const metadata: Metadata = {
  title: stylesIndex.title,
  description: stylesIndex.metaDescription,
};

export default function Page() {
  return <StylesIndexPage />;
}
