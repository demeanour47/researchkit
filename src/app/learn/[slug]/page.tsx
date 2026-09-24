import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuide, guideSlugs } from "@/domains/publishing";
import { GuidePage } from "@/templates/guide";

interface GuideRouteProps {
  params: Promise<{ slug: string }>;
}

/** Every guide is prerendered at build time; any other address is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return guideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GuideRouteProps): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  return guide ? { title: guide.title, description: guide.description } : {};
}

export default async function GuideRoute({ params }: GuideRouteProps) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  return <GuidePage guide={guide} />;
}
