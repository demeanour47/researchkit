import type { Metadata } from "next";
import { CharacterCounter, characterCounterPage } from "@/tools/character-counter";

export const metadata: Metadata = {
  title: characterCounterPage.title,
  description: characterCounterPage.metaDescription,
};

export default function Page() {
  return <CharacterCounter />;
}
