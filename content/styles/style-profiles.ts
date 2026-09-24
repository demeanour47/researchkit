import type { ProfiledStyleId, StyleProfile } from "@/domains/publishing/style-profile";

export const styleProfiles: Record<ProfiledStyleId, StyleProfile> = {
  apa: {
    usedIn: "Psychology, education and many social sciences.",
    summary: "Author–date citations, such as (Smith, 2020), with a reference list at the end.",
  },
  mla: {
    usedIn: "Literature, languages and other humanities.",
    summary:
      "Author–page citations, such as (Smith 45), with a works-cited list. The page number helps readers find a quoted passage.",
  },
  chicago: {
    usedIn: "History and other humanities, and widely in book publishing.",
    summary:
      "Offers two systems: footnotes with a bibliography, common in history, and an author–date system used more in the sciences.",
  },
  ieee: {
    usedIn: "Engineering, computer science and related technical fields.",
    summary: "Numbered citations in square brackets, such as [1], with sources listed in the order they are first cited.",
  },
  harvard: {
    usedIn: "Many universities, especially in the United Kingdom and Australia, across many subjects.",
    summary:
      "A family of author–date styles with no single official version. Each institution publishes its own rules, so use your institution's guide.",
  },
};
