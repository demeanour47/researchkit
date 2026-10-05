import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Choosing between qualitative, quantitative, mixed-methods and multi-method designs.
 * The definitions are the Research Onion's (from the knowledge layer), and the guide's
 * tests check that they match.
 */
export const qualitativeOrQuantitativeResearch: Guide = {
  slug: "qualitative-or-quantitative-research",
  title: "Qualitative or quantitative research?",
  description:
    "How qualitative, quantitative, mixed-methods and multi-method research differ in questions, data, sampling, analysis and quality criteria, and how to choose the approach your research question needs.",
  summary:
    "Quantitative research collects numbers to measure, compare and test relationships, usually across large samples. Qualitative research collects words, observations or images to understand meanings, experiences and processes, usually in depth with fewer people. Mixed methods combines both in one study. Choose by asking what answering your research question needs, not by which approach seems easier or more scientific.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "the-difference",
      heading: "The difference in brief",
      blocks: [
        {
          type: "table",
          caption: "Quantitative and qualitative research compared",
          columns: ["", "Quantitative", "Qualitative"],
          rows: [
            ["Typical question", "How much, how many, how strongly, what is the relationship", "How, why, in what ways, what is it like"],
            ["Data", "Numbers: measurements, counts, ratings", "Words, observations, images, documents"],
            ["Typical methods", "Questionnaires, experiments, structured observation, existing statistics", "Interviews, focus groups, participant observation, document analysis"],
            ["Sample", "Larger, often chosen to represent a population", "Smaller, chosen for the insight participants can give"],
            ["Analysis", "Statistical", "Interpretive: coding, themes, narratives"],
            ["What the results offer", "Measurement, comparison, generalisation to a population", "Depth, context, meaning, explanation of processes"],
            ["Researcher's role", "Kept at a distance, following a fixed design", "Acknowledged as part of the research, with a design that can adapt"],
          ],
        },
        { type: "paragraph", text: "These are tendencies, not rules (Bryman, 2016; Creswell & Creswell, 2018). A questionnaire can include open questions, and qualitative data can be counted; what matters is how the data are used to answer the question." },
      ],
    },
    {
      id: "four-choices",
      heading: "Four methodological choices",
      blocks: [
        { type: "paragraph", text: "The Research Onion describes four choices, following Saunders et al. (2019). Multi-method is the one most often confused with mixed methods:" },
        {
          type: "table",
          caption: "Methodological choices",
          columns: ["Choice", "Definition", "Why it is used"],
          rows: [
            ["Quantitative", "A quantitative design collects numerical data and analyses it statistically to measure, compare or test relationships.", "To measure how much, how many or how strongly, often across large samples."],
            ["Qualitative", "A qualitative design collects non-numerical data, such as interviews, observations or texts, to understand meanings, experiences and processes.", "To explore how and why people think and act as they do."],
            ["Mixed methods", "A mixed methods design combines quantitative and qualitative data within one study and brings their findings together.", "When one kind of data alone can't fully answer the research question."],
            ["Multi-method", "A multi-method design uses more than one data collection technique, but within a single tradition: either all quantitative or all qualitative.", "To strengthen findings by approaching a question from more than one angle within the same tradition."],
          ],
        },
      ],
    },
    {
      id: "how-to-choose",
      heading: "How to choose",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Start from your research question. A question about how much, how many or how strongly needs numbers; a question about how people experience or understand something needs words and observations; a question that asks both needs both.",
            "Ask how much is already known. If the concepts are well understood and there are tested ways to measure them, measuring is possible; if little is known, exploring comes first.",
            "Decide whether you need to generalise. Estimating something for a whole population needs a sample that represents it, and a quantitative design; understanding a process in depth doesn't.",
            "Be honest about what is feasible: access to participants, time, the data that exist, and your skills in statistics or qualitative analysis.",
            "Check the expectations of your field, your supervisor and your institution, then justify your choice in your methodology chapter.",
          ],
        },
        { type: "paragraph", text: "Quantitative research is often associated with a deductive approach, testing theory, and qualitative research with an inductive one, building it, but the link isn't fixed (Saunders et al., 2019). What matters is that your question, approach, design and analysis fit together." },
      ],
    },
    {
      id: "worked-example",
      heading: "Worked example: one topic, three questions",
      blocks: [
        { type: "paragraph", text: "A hypothetical example: a student is interested in online learning among university students in Nepal. Depending on the question, the same topic leads to different designs." },
        {
          type: "table",
          caption: "Three questions on one topic",
          columns: ["Question", "Approach", "Data and analysis"],
          rows: [
            ["What is the relationship between the reliability of students' internet connections and their weekly hours of online study, among undergraduates at universities in the Kathmandu Valley?", "Quantitative", "A questionnaire to a sample of students; correlation or regression"],
            ["How do undergraduates studying outside the Kathmandu Valley describe the challenges of learning online?", "Qualitative", "Interviews with students chosen for different circumstances; thematic analysis"],
            ["To what extent does internet reliability explain differences in online study time, and how do students explain the difficulties they face?", "Mixed methods", "A questionnaire first, then interviews with some respondents to explain the survey's patterns"],
          ],
        },
        { type: "paragraph", text: "None of these is better than the others. Each answers a different question, and the first can't tell the student why connections matter, while the second can't say how common the challenges are." },
      ],
    },
    {
      id: "mixed-methods",
      heading: "Mixed methods: more than doing both",
      blocks: [
        { type: "paragraph", text: "A mixed-methods study integrates its two strands: one strand informs the other, or their findings are brought together to answer the question (Creswell & Plano Clark, 2018). Three core designs are commonly described:" },
        {
          type: "list",
          items: [
            "Convergent: both kinds of data are collected in the same phase and their results are compared or merged.",
            "Explanatory sequential: quantitative data first, then qualitative data to explain the results.",
            "Exploratory sequential: qualitative data first, to explore the topic or develop an instrument, then quantitative data to test or measure at scale.",
          ],
        },
        { type: "paragraph", text: "Mixed methods needs more time, resources and skill than a single approach. Choose it when the question needs both kinds of answer, not to make a study look more thorough (Johnson & Onwuegbuzie, 2004)." },
      ],
    },
    {
      id: "sampling",
      heading: "Sampling and sample size",
      blocks: [
        { type: "paragraph", text: "The two approaches choose participants for different reasons. Quantitative research that generalises to a population needs a sample that represents it, ideally by probability sampling, and a sample size planned for the precision or statistical power the analysis needs. Qualitative research usually selects participants purposively, for what they can tell you, and often decides when to stop by the point at which new data stop adding new insights, known as saturation, a concept that originates in grounded theory (Glaser & Strauss, 1967)." },
        { type: "paragraph", text: "Neither approach is a shortcut. A small qualitative sample can't support claims about how common something is; a large survey can't explain experiences it didn't ask about." },
      ],
    },
    {
      id: "quality",
      heading: "How quality is judged",
      blocks: [
        { type: "paragraph", text: "Quantitative research is judged by the validity and reliability of its measures, the soundness of its design and analysis, and how far its results generalise (Bryman, 2016). Qualitative research is judged by different criteria. A widely used set is trustworthiness: credibility, transferability, dependability and confirmability (Lincoln & Guba, 1985). Use the criteria that fit your approach, and explain in your methodology how you met them." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Choosing an approach first and fitting the question to it.",
            "Collecting numbers without checking that the measures are valid and reliable.",
            "Treating a statistically significant result as proof of cause and effect.",
            "Describing a small sample as representative of a population.",
            "Presenting quotations without explaining how they were analysed.",
            "Calling a study mixed methods when all its techniques come from one tradition, which is multi-method.",
            "Reporting the quantitative and qualitative results separately, without integrating them.",
            "Assuming qualitative research is easier because it has no statistics. Its analysis is demanding and time-consuming.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Plan your design with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The Research Onion walks you through philosophy, approach, methodological choice, strategy, time horizon and techniques, checking that your choices fit together. The Research Design Builder records your design, and the Sampling Builder and Sample Size Calculator help with who to include and how many." },
        { type: "links", items: [{ label: "Work through the Research Onion", href: "/tools/research-onion" }, { label: "Build your research design", href: "/tools/research-design-builder" }, { label: "Plan your sampling", href: "/tools/sampling-builder" }, { label: "Design a questionnaire", href: "/tools/questionnaire-builder" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["bryman-2016", "creswell-creswell-2018", "creswell-plano-clark-2018", "glaser-strauss-1967", "johnson-onwuegbuzie-2004", "lincoln-guba-1985", "saunders-2019"] }],
    },
  ],
  faq: [
    { question: "Is quantitative research more scientific?", answer: "No. The two approaches answer different questions, and each has its own standards of rigour. Use the one your question needs." },
    { question: "How many interviews do I need?", answer: "There is no fixed number. It depends on your question, your participants and your analysis; many qualitative studies stop when new interviews stop adding new insights. Justify the number you choose." },
    { question: "Can a questionnaire be qualitative?", answer: "Open-ended questions produce qualitative data, but a short written answer is usually less rich than an interview. Many questionnaires mix closed and open questions." },
    { question: "What is the difference between mixed methods and multi-method?", answer: "Mixed methods combines quantitative and qualitative data. Multi-method uses several techniques from one tradition, such as interviews and focus groups." },
    { question: "Do I need a research philosophy?", answer: "Many programmes ask you to state one, such as positivism or interpretivism, and to show that your approach fits it. The Research Onion explains the options." },
  ],
  relatedToolIds: ["research-onion", "research-design-builder", "sampling-builder", "sample-size-calculator", "questionnaire-builder", "conceptual-framework-builder"],
  relatedGuideSlugs: ["how-to-write-a-research-question", "how-to-write-a-literature-review", "how-to-choose-a-statistical-test", "power-analysis"],
};
