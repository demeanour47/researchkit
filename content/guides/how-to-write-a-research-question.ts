import type { Guide } from "../../src/domains/publishing/guide";

/**
 * Writing a focused, answerable research question. The question types, elements and
 * FINER criteria are the ones the Research Question Builder uses (from the knowledge
 * layer), and the guide's tests check that they match.
 */
export const howToWriteAResearchQuestion: Guide = {
  slug: "how-to-write-a-research-question",
  title: "How to write a research question",
  description:
    "How to turn a topic into a focused, answerable research question: the elements a question names, the main types of question, the FINER criteria, a worked example of refining a broad question, and the common mistakes.",
  summary:
    "A good research question names what you will study, in whom, where and when, and asks something your study can actually answer. Start from a topic, narrow it to a problem, then write a question whose type (descriptive, comparative, relational, explanatory and so on) fits what you want to find out. Test it against the FINER criteria: feasible, interesting, novel, ethical and relevant.",
  updated: "2026-10-04",
  reviewedBy: null,
  sections: [
    {
      id: "why-it-matters",
      heading: "Why the question comes first",
      blocks: [
        { type: "paragraph", text: "The research question decides almost everything that follows: what data you need, from whom, how you collect it and how you analyse it (Creswell & Creswell, 2018; Punch, 2005). A vague question leads to a study that collects too much, analyses the wrong thing, or can't reach a conclusion. A clear one tells you, and your reader, what the study is for." },
        { type: "paragraph", text: "Writing a good question usually takes several drafts. That is normal: refining the question is part of the research, not a delay before it." },
      ],
    },
    {
      id: "topic-to-question",
      heading: "From topic to question",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Topic: the broad area you are interested in, such as tourism in Nepal.",
            "Problem: something specific that is unknown, contested or causing difficulty, such as whether income from homestays reaches poorer households.",
            "Aim: what your study will do about the problem, such as examine how homestay income is distributed.",
            "Question: the specific question your study will answer, naming its variables or concepts, its population, its setting and, where it matters, its time.",
          ],
        },
        { type: "paragraph", text: "Reading the literature as you go keeps the question honest: it shows what is already known, so you don't ask a question that has been answered, and it supplies the concepts and measures you will use." },
      ],
    },
    {
      id: "elements",
      heading: "What a research question names",
      blocks: [
        { type: "paragraph", text: "Most research questions name some of these elements; which ones a question needs depends on its type. The examples are the elements the Research Question Builder finds in the refined question in the worked example below." },
        {
          type: "table",
          caption: "The elements of a research question",
          columns: ["Element", "What it is", "Example"],
          rows: [
            ["Independent variable", "What you think influences or explains something else", "participation in a homestay programme"],
            ["Dependent variable", "What you measure as the outcome", "household income"],
            ["Population", "Who or what the study is about", "households"],
            ["Context", "Where, or in what setting", "Ghandruk"],
            ["Time", "When, where it matters", "in 2024"],
          ],
        },
        { type: "paragraph", text: "A qualitative question usually has no independent and dependent variables: it names a phenomenon or experience to explore, the people who experience it and the setting." },
      ],
    },
    {
      id: "types",
      heading: "Types of research question",
      blocks: [
        { type: "paragraph", text: "Questions can be classified by purpose (what they ask) and by approach (how they will be answered). The Research Question Builder uses these types, each with an example from its knowledge base:" },
        {
          type: "table",
          caption: "Types of research question",
          columns: ["Type", "What it asks", "Example"],
          rows: [
            ["Descriptive", "Asks what something is like: how common, how much, or what its characteristics are.", "What is the level of physical activity among office workers in Leeds?"],
            ["Comparative", "Asks how two or more groups, places or times differ on something.", "How does reading attainment differ between pupils in rural and urban schools?"],
            ["Relational", "Asks whether and how two or more things are related.", "What is the relationship between screen time and sleep quality among teenagers?"],
            ["Correlational", "Asks whether two measured variables vary together, and how strongly.", "To what extent are working hours associated with burnout among junior doctors?"],
            ["Explanatory", "Asks why something happens, or how one thing influences another.", "How does peer mentoring influence retention among first-year students?"],
            ["Exploratory", "Asks how people experience or understand something, usually where little is known.", "How do newly qualified teachers experience their first term?"],
            ["Predictive", "Asks whether one or more factors can predict a later outcome.", "To what extent do first-year grades predict final degree classification?"],
            ["Qualitative", "A question answered with words, observations or images, focusing on meanings, experiences and processes.", "In what ways do carers describe their access to respite care?"],
            ["Quantitative", "A question answered with numerical data, asking how much, how many or how strongly.", "How many hours of paid work do full-time students do each week?"],
            ["Mixed methods", "A question with a quantitative and a qualitative part, answered by combining both kinds of data.", "To what extent does flexible working affect job satisfaction, and how do employees explain the effect?"],
          ],
        },
        { type: "paragraph", text: "An explanatory question asks about causes, and answering it convincingly needs a design that can support causal claims, such as an experiment, or careful reasoning about other explanations. A relational question claims less, and is easier to answer with survey data." },
      ],
    },
    {
      id: "finer",
      heading: "Test it: the FINER criteria",
      blocks: [
        { type: "paragraph", text: "The FINER criteria are a widely used checklist for a research question (Hulley et al., 2013):" },
        {
          type: "table",
          caption: "The FINER criteria",
          columns: ["Criterion", "Ask yourself"],
          rows: [
            ["Feasible", "Can you answer it with the time, access, skills and resources you have?"],
            ["Interesting", "Does the answer matter to you, your supervisor and people in your field?"],
            ["Novel", "Does it add something new: new evidence, a new setting, or a new way of looking at the problem?"],
            ["Ethical", "Can it be answered without undue risk to participants, researchers or communities?"],
            ["Relevant", "Will the answer serve your aim and matter to your field, to practice or to policy?"],
          ],
        },
        { type: "paragraph", text: "Only some of these can be judged from the wording. Whether a question is interesting or novel depends on the literature and on your field, so discuss it with your supervisor." },
      ],
    },
    {
      id: "worked-example",
      heading: "Worked example: refining a broad question",
      blocks: [
        { type: "paragraph", text: "This is a hypothetical example of how a student might refine a question; it doesn't describe a real study." },
        {
          type: "table",
          caption: "Refining a question in three drafts",
          columns: ["Draft", "Question", "Problem or improvement"],
          rows: [
            ["1", "How does tourism affect Nepal?", "Far too broad: no population, no measurable outcome, and no study could answer it"],
            ["2", "Do homestays help people in Ghandruk?", "A yes/no question with a vague outcome: “help” and “people” need defining"],
            ["3", "What is the relationship between participation in a homestay programme and household income among households in Ghandruk, Kaski district, in 2024?", "Relational, with an independent variable, a dependent variable, a population, a context and a time; answerable with a household survey"],
          ],
        },
        { type: "paragraph", text: "The third draft could be complemented by a qualitative question, such as “How do households in Ghandruk describe the benefits and costs of running a homestay?”, which would make it a mixed-methods study. Check draft 3 against FINER: feasibility depends on reaching enough households; ethics on how income questions are asked and kept confidential." },
      ],
    },
    {
      id: "sub-questions",
      heading: "Main questions, sub-questions and objectives",
      blocks: [
        { type: "paragraph", text: "Larger projects, such as a dissertation, usually have one main question and a few sub-questions that together answer it. Each sub-question should be answerable in its own right and needed for the main question. Research objectives restate the questions as tasks, one objective for each thing the study must do." },
        { type: "paragraph", text: "In quantitative research, a question about relationships or differences often leads to hypotheses: testable predictions about what the answer will be." },
      ],
    },
    {
      id: "common-mistakes",
      heading: "Common mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Too broad: a question a whole field couldn't answer, let alone one study.",
            "Too narrow or already answered: a question with an obvious or published answer.",
            "Yes/no wording, which invites a one-word answer; “to what extent”, “how” and “what is the relationship between” open it up.",
            "Two questions in one, joined by “and”, which may need different designs.",
            "Vague terms such as “impact”, “success” or “development” that can't be observed or measured as written.",
            "A conclusion built in, such as “Why does social media harm students?”, which assumes the answer.",
            "A causal question (“effect of”) for a study that can only show association.",
            "A question that isn't feasible with the access, time or data available.",
          ],
        },
      ],
    },
    {
      id: "checklist",
      heading: "Checklist",
      blocks: [
        {
          type: "list",
          items: [
            "It names what you will study, in whom, where and, if it matters, when.",
            "Its type matches what you want to know, and your design can answer it.",
            "Its key terms can be defined and, for a quantitative question, measured.",
            "It doesn't assume its own answer.",
            "It passes the FINER criteria, including feasibility.",
            "Your objectives, design and analysis follow from it.",
          ],
        },
      ],
    },
    {
      id: "using-the-tools",
      heading: "Build your question with ResearchKit",
      blocks: [
        { type: "paragraph", text: "The Research Question Builder identifies your question's type and elements, flags what is missing, and walks you through the FINER criteria, saying which ones only you can judge. From there, the Research Objectives Generator turns the question into objectives and the Hypothesis Builder into testable hypotheses." },
        { type: "links", items: [{ label: "Open the Research Question Builder", href: "/tools/research-question-builder" }, { label: "Write objectives", href: "/tools/research-objectives-generator" }, { label: "Build hypotheses", href: "/tools/hypothesis-builder" }, { label: "Plan it in the research workspace", href: "/workspace" }] },
      ],
    },
    {
      id: "references",
      heading: "References",
      blocks: [{ type: "references", ids: ["hulley-2013", "creswell-creswell-2018", "punch-2005"] }],
    },
  ],
  faq: [
    { question: "How long should a research question be?", answer: "Long enough to name its key elements, usually one sentence. If it needs two sentences, it may be two questions." },
    { question: "Should it be a question or a statement?", answer: "A question, ending with a question mark. Aims and objectives are written as statements." },
    { question: "How many research questions should I have?", answer: "It depends on the project and your institution's expectations. A dissertation usually has one main question and a few sub-questions; check your handbook." },
    { question: "Can my question change during the research?", answer: "In exploratory and qualitative research it often does, as you learn more. In a quantitative study, fix it before collecting data, and report any change honestly." },
    { question: "What makes a question qualitative or quantitative?", answer: "What answering it needs: numbers and measurement, or words, meanings and experiences. Some questions need both." },
  ],
  relatedToolIds: ["research-question-builder", "research-objectives-generator", "hypothesis-builder", "variables-builder", "conceptual-framework-builder"],
  relatedGuideSlugs: ["how-to-write-research-objectives", "qualitative-or-quantitative-research", "how-to-write-a-literature-review", "how-to-write-a-good-research-title", "how-to-plan-a-dissertation"],
};
