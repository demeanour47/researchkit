"use client";

import { AuthorFields as SharedAuthorFields, type AuthorFieldsProps as SharedAuthorFieldsProps } from "@/features/citation";
import { form } from "./copy";

export { firstFieldId } from "@/features/citation";

export type AuthorFieldsProps = Omit<SharedAuthorFieldsProps, "labels">;

/** The shared author fields, with APA's wording: given names may be initials, since APA uses only initials. */
export function AuthorFields(props: AuthorFieldsProps) {
  return <SharedAuthorFields {...props} labels={form} />;
}
