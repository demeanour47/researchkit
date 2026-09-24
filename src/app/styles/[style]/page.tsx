import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStyleProfile, parseProfiledStyle, profiledStyles } from "@/domains/publishing";
import { CITATION_STYLES } from "@/knowledge/citation/styles";
import { StylePage, stylePageCopy } from "@/templates/style";

interface StyleRouteProps {
  params: Promise<{ style: string }>;
}

/** Every style page is prerendered at build time; any other address is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return profiledStyles().map((style) => ({ style }));
}

export async function generateMetadata({ params }: StyleRouteProps): Promise<Metadata> {
  const style = parseProfiledStyle((await params).style);
  if (!style) return {};
  const { name } = CITATION_STYLES[style];
  return { title: name, description: stylePageCopy.metaDescription(name, getStyleProfile(style).summary) };
}

export default async function StyleRoute({ params }: StyleRouteProps) {
  const style = parseProfiledStyle((await params).style);
  if (!style) notFound();
  return <StylePage style={style} />;
}
