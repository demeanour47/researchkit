import type { Metadata } from "next";
import { PrismaFlowBuilder, prismaFlowBuilderPage } from "@/tools/prisma-flow-builder";

export const metadata: Metadata = {
  title: prismaFlowBuilderPage.title,
  description: prismaFlowBuilderPage.metaDescription,
};

export default function Page() {
  return <PrismaFlowBuilder />;
}
