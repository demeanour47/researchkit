import type { Metadata } from "next";
import { ReferenceChecker, page } from "@/tools/reference-checker";

export const metadata: Metadata = {
  title: "APA 7 Reference Checker",
  description: page.metaDescription,
};

export default function Page() {
  return <ReferenceChecker />;
}
