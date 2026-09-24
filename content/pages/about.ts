import type { ContentPage } from "@/domains/publishing/page";

export const about: ContentPage = {
  title: "About ResearchKit",
  description:
    "ResearchKit is a free library of academic tools and guides that show the reasoning behind every result.",
  lead: "ResearchKit is a free library of academic tools and guides for students, researchers and educators. Every result shows the rule behind it, so you can check it and learn it.",
  sections: [
    {
      id: "why",
      heading: "Why ResearchKit exists",
      blocks: [
        {
          type: "paragraph",
          text: "Academic work is marked on conventions that are rarely taught: how to cite a source, which statistical test to use, how to report a result. Students with experienced tutors pick these rules up. Many others learn them by losing marks.",
        },
        {
          type: "paragraph",
          text: "ResearchKit makes those rules visible, gets them right, and gives them to everyone for free.",
        },
      ],
    },
    {
      id: "promises",
      heading: "What we promise",
      blocks: [
        {
          type: "list",
          items: [
            "Accuracy: every tool follows the authority it names, such as a style manual, and its logic is tested.",
            "Explanations: every result shows the reasoning behind it.",
            "Free access: no account, no paywall and no email address.",
            "Honesty about limits: when we are not certain, we say so.",
          ],
        },
      ],
    },
    {
      id: "status",
      heading: "Where things stand",
      blocks: [
        {
          type: "paragraph",
          text: "ResearchKit is at an early stage. One tool and one guide are published, and the rest are listed as coming soon.",
        },
        {
          type: "paragraph",
          text: "Published guidance has not yet been checked by a named reviewer. Every page where that applies says so, and reviewers will be named as they join.",
        },
      ],
    },
    {
      id: "never",
      heading: "What ResearchKit will not do",
      blocks: [
        {
          type: "list",
          items: [
            "Hide results behind payment, accounts or sign-ups.",
            "Sell or share information about the people who use it.",
            "Offer tools designed to disguise who wrote a piece of work.",
          ],
        },
      ],
    },
  ],
};
