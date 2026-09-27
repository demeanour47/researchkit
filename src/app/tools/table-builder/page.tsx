import type { Metadata } from "next";
import { TableBuilder, tableBuilderPage } from "@/tools/table-builder";

export const metadata: Metadata = {
  title: tableBuilderPage.title,
  description: tableBuilderPage.metaDescription,
};

export default function Page() {
  return <TableBuilder />;
}
