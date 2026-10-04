import type { Metadata } from "next";
import { ReferenceChecker, page } from "@/tools/reference-checker";

export const metadata: Metadata = {
  title: page.title,
  description: page.metaDescription,
};

export default function Page() {
  return <ReferenceChecker />;
}
