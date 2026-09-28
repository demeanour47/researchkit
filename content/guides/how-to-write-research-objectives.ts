import type { Guide } from "@/domains/publishing/guide";

export const howToWriteResearchObjectives: Guide = {
  slug: "how-to-write-research-objectives",
  title: "How to write research objectives",
  description:
    "What a general objective and specific objectives are, how to write and order them, which action verbs fit which research purpose, and how to check objectives against your research question, with worked examples.",
  summary:
    "A general objective states, in one sentence, what your whole study sets out to do. Specific objectives break it down into the smaller, achievable steps that together deliver it. Write the general objective from your research question, choose an action verb that fits your research purpose, then write specific objectives you can each show you achieved.",
  updated: "2026-09-28",
  reviewedBy: null,
  sections: [
    {
      id: "definition",
      heading: "What is a research objective?",
      blocks: [
        {
          type: "paragraph",
          text: "A research objective states what a study sets out to do, in a form that can later be checked: did the study do it, or not? Objectives usually come in two kinds. The general objective is one sentence that states the overall purpose of the study. Specific objectives break that purpose down into the smaller steps the study will take to achieve it (Kothari, 2004).",
        },
        {
          type: "paragraph",
          text: "Objectives follow from the research question: the question asks what you want to find out, and the objectives state what the study will do to answer it. Punch (2005) treats the research question as what organises a project; the objectives are the concrete actions that carry that organisation through into the study's design and findings.",
        },
      ],
    },
    {
      id: "purpose",
      heading: "Why objectives matter",
      blocks: [
        {
          type: "list",
          items: [
            "They turn a broad research question into concrete, checkable steps, which makes it possible to plan a design, sample and instruments around them.",
            "They give readers, supervisors and examiners a fixed standard to judge the study against: did it do what it set out to do?",
            "They keep a study from drifting. Each later decision, from variables to analysis, can be checked against whether it serves an objective.",
            "In a written report, the objectives usually set the structure of the findings and discussion, one section per objective.",
          ],
        },
      ],
    },
    {
      id: "general-objective",
      heading: "Writing the general objective",
      blocks: [
        {
          type: "paragraph",
          text: "The general objective is usually one sentence, starting with an infinitive verb (“To examine…”, “To describe…”, “To determine…”) and naming what is studied, who or what is studied, and, where it matters, where and when (Creswell & Creswell, 2018).",
        },
        {
          type: "paragraph",
          text: "It should read as a shorter, more formal restatement of the research question as a statement of intent rather than a question. “What is the relationship between employee motivation and job satisfaction among bank employees in Nepal?” becomes “To examine the relationship between employee motivation and job satisfaction among bank employees in Nepal.”",
        },
      ],
    },
    {
      id: "specific-objectives",
      heading: "Breaking it down into specific objectives",
      blocks: [
        {
          type: "paragraph",
          text: "Specific objectives state the individual steps that, together, achieve the general objective. There is no fixed number or fixed structure: how many you need, and what each one does, depends on your study (Bryman, 2016).",
        },
        {
          type: "paragraph",
          text: "A relational study, for example, commonly breaks its general objective down into objectives that identify or describe each variable on its own, then an objective that examines the relationship between them. A descriptive study might instead break its general objective down by sub-topic or by group. Treat any such pattern as a starting point to adapt, not a structure every study must follow.",
        },
        {
          type: "list",
          items: [
            "Each specific objective should name one clear action: one verb, one thing it applies to.",
            "Together, the specific objectives should cover the general objective without duplicating each other.",
            "Each should be something you can point to in your findings and say “this is where I did it”.",
            "Order them in the sequence the study will address them, which is often the order they are reported in.",
          ],
        },
      ],
    },
    {
      id: "verbs",
      heading: "Choosing action verbs for your purpose",
      blocks: [
        {
          type: "paragraph",
          text: "The verb an objective opens with signals what kind of claim the study is making, so it should match the study's purpose and the design that can support that claim (Creswell & Creswell, 2018; Saunders et al., 2019).",
        },
        {
          type: "list",
          items: [
            "Describing something: identify, describe, assess, determine, measure, document.",
            "Comparing groups, places or times: compare, evaluate.",
            "Examining a relationship between variables: examine, investigate, assess, determine.",
            "Measuring how strongly variables vary together: examine, determine, measure.",
            "Explaining why or how one thing influences another: examine, investigate, determine, analyse.",
            "Finding whether something predicts a later outcome: examine, determine, assess.",
            "Exploring or understanding experiences or meanings, usually where little is known: explore, understand, investigate, examine.",
          ],
        },
        {
          type: "paragraph",
          text: "This is guidance, not a rule that the verb decides the methodology. The same verb can suit more than one purpose, and the same purpose can be worded with more than one verb; what has to line up is the verb, what the objective actually asks the study to do, and the design that can deliver it.",
        },
      ],
    },
    {
      id: "alignment",
      heading: "Checking objectives against your research question",
      blocks: [
        {
          type: "paragraph",
          text: "An objective that has drifted from the research question is a common, avoidable weakness: the study ends up answering a different question from the one it set out to ask (Punch, 2005). Two checks catch most drift.",
        },
        {
          type: "list",
          items: [
            "Does the general objective name the same variables, population and scope as the research question, just as a statement instead of a question?",
            "Does each specific objective clearly serve the general objective, rather than introducing a new topic the question never raised?",
          ],
        },
      ],
    },
    {
      id: "characteristics",
      heading: "Characteristics of a well-written objective",
      blocks: [
        {
          type: "list",
          items: [
            "Clear: one action, stated so a reader knows exactly what will be done.",
            "Specific: names who or what is studied, not just a general area.",
            "A research action: something the study itself does (examine, measure, compare), not an outcome or a recommendation the study might lead to.",
            "Achievable and checkable: something you can point to in your findings and confirm was done.",
            "Aligned: connected to the research question and, for a specific objective, to the general objective.",
          ],
        },
      ],
    },
    {
      id: "mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Too vague: “To understand employees.” names who is studied but not what about them; there is no way to check whether it was achieved.",
            "Overloaded: “To identify, analyse, compare, evaluate and determine various factors affecting performance.” packs several distinct actions into one objective; it is usually clearer as separate objectives, one action each.",
            "An outcome, not a research action: “To provide recommendations to the manager on how to improve employee performance.” describes something the study might lead to, not something the research itself does.",
            "Missing population or context: an objective that never says who or what is studied leaves the reader to guess whom the findings apply to.",
            "Duplicated objectives: two specific objectives that say much the same thing in different words add length without adding coverage.",
            "Objectives that drift from the research question, so the study answers something other than what it set out to ask.",
          ],
        },
      ],
    },
    {
      id: "examples",
      heading: "A worked example",
      blocks: [
        {
          type: "paragraph",
          text: "Research question: “What is the relationship between employee motivation and job satisfaction among bank employees in Nepal?”",
        },
        {
          type: "paragraph",
          text: "General objective: “To examine the relationship between employee motivation and job satisfaction among bank employees in Nepal.”",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "To identify the level of employee motivation among bank employees in Nepal.",
            "To identify the level of job satisfaction among bank employees in Nepal.",
            "To examine the relationship between employee motivation and job satisfaction among bank employees in Nepal.",
          ],
        },
        {
          type: "paragraph",
          text: "Each specific objective names one action, and together they build up to the general objective: the first two establish the two variables on their own, and the third examines how they relate.",
        },
      ],
    },
    {
      id: "checklist",
      heading: "Checklist",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Does the general objective restate your research question as a statement of intent, in one sentence?",
            "Does it name an action verb that fits your research purpose?",
            "Does it name who or what is studied, and where or when it matters?",
            "Does each specific objective name one clear action, not several?",
            "Does each specific objective read as a research action, not an outcome or a recommendation?",
            "Do the specific objectives, together, cover the general objective without duplicating each other?",
            "Could you point to your findings and show where each specific objective was achieved?",
            "Are the specific objectives ordered in the sequence you will address them?",
          ],
        },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["creswell-creswell-2018", "bryman-2016", "kothari-2004", "punch-2005", "saunders-2019"] }],
    },
    {
      id: "next-steps",
      heading: "Put it into practice",
      blocks: [
        {
          type: "paragraph",
          text: "Objectives are easier to write once your research question is settled, and easier to check once your title and variables are written down alongside them.",
        },
        {
          type: "links",
          items: [
            { label: "Write your research question", href: "/tools/research-question-builder" },
            { label: "Generate your objectives from your question", href: "/tools/research-objectives-generator" },
            { label: "Plan every stage in your research workspace", href: "/workspace" },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      question: "How many specific objectives should a study have?",
      answer: "There is no fixed number. Most studies use somewhere between two and five, enough to cover the general objective without duplicating each other or splitting it more finely than the study needs.",
    },
    {
      question: "Do objectives have to use “To…” and an infinitive verb?",
      answer: "It is the most common convention in academic writing, and it keeps every objective phrased as an action. Follow your department's or journal's own style if it asks for something different.",
    },
    {
      question: "What is the difference between an aim and a general objective?",
      answer: "In practice the two words are often used for the same thing: a one-sentence statement of the study's overall purpose. Some departments use “aim” for that single sentence and reserve “objectives” for the specific, numbered steps; check which convention yours expects.",
    },
    {
      question: "Should objectives match the order of my research questions, if I have more than one?",
      answer: "It usually makes the report easier to follow if they do, since findings and discussion sections are commonly organised objective by objective.",
    },
    {
      question: "Can an objective mention a recommendation, such as suggesting improvements?",
      answer: "Keep recommendations out of your objectives. An objective states what the research itself does (examine, measure, compare); what you recommend as a result belongs in your conclusions, not in the list of things the study set out to do.",
    },
  ],
  relatedToolIds: ["research-objectives-generator", "research-question-builder", "research-title-builder", "hypothesis-builder"],
};
