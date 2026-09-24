/**
 * The research onion: a model of research design as six layers, from philosophy on
 * the outside to data collection techniques at the centre. The model was developed
 * by Mark Saunders, Philip Lewis and Adrian Thornhill.
 *
 * Fit rules describe what methodology textbooks commonly treat as typical
 * combinations. They are guidance, not rules: an unlisted combination "needs careful
 * justification", and no combination is ever forbidden. Content awaits review by a
 * named methodology reviewer before launch.
 */

import type { LayerId, OnionLayer, OnionOption } from "./types";

export const LAYERS: readonly OnionLayer[] = [
  {
    id: "philosophy",
    number: 1,
    name: "Research philosophy",
    question: "Which research philosophy best reflects your assumptions about reality and knowledge?",
    description:
      "Your philosophy is the set of assumptions you hold about what reality is and how knowledge about it can be gained. It shapes every later choice.",
  },
  {
    id: "approach",
    number: 2,
    name: "Research approach",
    question: "How will your research relate theory and data?",
    description: "Your approach describes whether you start from theory, start from data, or move between the two.",
  },
  {
    id: "choice",
    number: 3,
    name: "Methodological choice",
    question: "What kind of data will you work with?",
    description: "Your methodological choice is whether you work with numbers, with words and observations, or with both.",
  },
  {
    id: "strategy",
    number: 4,
    name: "Research strategy",
    question: "Which research strategy will you use?",
    description: "Your strategy is the overall plan for how you will answer your research question.",
  },
  {
    id: "timeHorizon",
    number: 5,
    name: "Time horizon",
    question: "Over what period will you collect data?",
    description: "Your time horizon is whether you study a single moment or change over time.",
  },
  {
    id: "technique",
    number: 6,
    name: "Techniques and procedures",
    question: "Which main technique will you use to collect data?",
    description: "Techniques and procedures are the specific ways you collect and analyse your data.",
  },
];

/** Which earlier layers each layer's choices are compared with. */
export const COMPARED_LAYERS: Readonly<Record<LayerId, readonly LayerId[]>> = {
  philosophy: [],
  approach: ["philosophy"],
  choice: ["philosophy", "approach"],
  strategy: ["philosophy", "approach", "choice"],
  timeHorizon: ["strategy"],
  technique: ["choice", "strategy"],
};

export const OPTIONS: readonly OnionOption[] = [
  // Layer 1: research philosophy
  {
    id: "positivism",
    layer: "philosophy",
    name: "Positivism",
    subject: "Positivism",
    essence: "begins from objective measurement",
    definition:
      "Positivism holds that reality exists independently of the researcher and can be studied objectively, through observation and measurement, to find general patterns or laws.",
    whyUsed: "To test theories and measure relationships between variables as objectively as possible.",
    strengths: ["Findings can be replicated and compared across studies.", "Supports generalising from a sample to a wider population."],
    limitations: [
      "Can overlook the meanings people give to their experiences.",
      "Complex social situations may not reduce neatly to measurable variables.",
    ],
    examples: [
      "Testing whether class size predicts exam results across many schools.",
      "Measuring the effect of a training programme on productivity.",
    ],
    references: [],
    fits: {},
  },
  {
    id: "interpretivism",
    layer: "philosophy",
    name: "Interpretivism",
    subject: "Interpretivism",
    essence: "focuses on the meanings people give to their experiences",
    definition:
      "Interpretivism holds that social reality is shaped by people's interpretations, so research should seek to understand the meanings people attach to their experiences and actions.",
    whyUsed: "To understand how and why people experience situations in particular ways.",
    strengths: ["Captures rich, contextual detail.", "Takes participants' own perspectives seriously."],
    limitations: [
      "Findings are hard to generalise beyond the setting studied.",
      "The researcher's own interpretation shapes the findings and must be acknowledged.",
    ],
    examples: [
      "Exploring how first-generation students experience their first year at university.",
      "Understanding how nurses make sense of end-of-life care decisions.",
    ],
    references: [],
    fits: {},
  },
  {
    id: "pragmatism",
    layer: "philosophy",
    name: "Pragmatism",
    subject: "Pragmatism",
    essence: "chooses whatever methods best answer the research question",
    definition:
      "Pragmatism judges ideas by their practical consequences. It treats the research question as the starting point and uses whichever methods best address it.",
    whyUsed: "To answer practical problems where different kinds of evidence are useful.",
    strengths: ["Flexible: allows qualitative and quantitative methods to be combined.", "Keeps research focused on useful answers."],
    limitations: [
      "Can be criticised as lacking a clear philosophical position unless it is explained.",
      "Combining methods requires more time and skill.",
    ],
    examples: [
      "Evaluating a new policy using both usage statistics and staff interviews.",
      "Designing and testing a change to reduce patient waiting times.",
    ],
    references: [],
    fits: {},
  },
  {
    id: "realism",
    layer: "philosophy",
    name: "Realism",
    subject: "Realism",
    essence: "looks for the mechanisms that lie behind what can be observed",
    definition:
      "Realism holds that reality exists independently of our knowledge of it, but that we can only understand it partly and imperfectly. Critical realism, a common form, looks for the underlying structures and mechanisms that produce what we observe.",
    whyUsed: "To explain why things happen, not only what happens, in complex social settings.",
    strengths: ["Allows both measurement and interpretation.", "Aims to explain causes while recognising the role of context."],
    limitations: [
      "Its concepts, such as underlying mechanisms, can be difficult to define and study.",
      "Less familiar to some examiners, so it needs clear explanation.",
    ],
    examples: [
      "Explaining why the same management practice succeeds in some organisations but not others.",
      "Investigating the social structures behind unequal access to healthcare.",
    ],
    references: [],
    fits: {},
  },

  // Layer 2: research approach
  {
    id: "deductive",
    layer: "approach",
    name: "Deductive",
    subject: "a deductive approach",
    essence: "tests an existing theory against data",
    definition: "A deductive approach starts from an existing theory, develops hypotheses from it, and collects data to test them.",
    whyUsed: "When established theory exists and the aim is to test it.",
    strengths: ["A clear, structured research design.", "Shows whether a theory holds in a new setting."],
    limitations: ["May miss unexpected findings outside the hypotheses.", "Depends on the quality of the theory being tested."],
    examples: [
      "Testing whether a theory of motivation predicts employee turnover.",
      "Checking whether a well-known model of technology acceptance applies to older adults.",
    ],
    references: [],
    fits: { philosophy: { strong: ["positivism"], possible: ["realism", "pragmatism"] } },
  },
  {
    id: "inductive",
    layer: "approach",
    name: "Inductive",
    subject: "an inductive approach",
    essence: "builds theory from patterns in data",
    definition: "An inductive approach starts from data and identifies patterns, themes or explanations, building theory from what is found.",
    whyUsed: "When a topic is new or poorly understood and existing theory offers little guidance.",
    strengths: ["Open to unexpected findings.", "Produces explanations grounded in the data."],
    limitations: [
      "Findings may not generalise beyond the cases studied.",
      "Can be time-consuming, with no guarantee that a clear theory emerges.",
    ],
    examples: ["Exploring how small businesses adapted to a sudden crisis.", "Identifying themes in students' accounts of online learning."],
    references: [],
    fits: { philosophy: { strong: ["interpretivism"], possible: ["realism", "pragmatism"] } },
  },
  {
    id: "abductive",
    layer: "approach",
    name: "Abductive",
    subject: "an abductive approach",
    essence: "moves between data and theory to find the best explanation",
    definition:
      "An abductive approach moves back and forth between data and theory, starting from a surprising observation and looking for the most plausible explanation of it.",
    whyUsed: "When an observation doesn't fit existing theory and needs a new or modified explanation.",
    strengths: ["Combines the openness of induction with the discipline of testing.", "Well suited to explaining puzzling findings."],
    limitations: ["The back-and-forth process can be hard to describe clearly.", "Requires good knowledge of existing theory."],
    examples: [
      "Explaining why a successful product failed in one market.",
      "Revising a theory of customer loyalty after unexpected survey results.",
    ],
    references: [],
    fits: { philosophy: { strong: ["pragmatism", "realism"], possible: ["interpretivism"] } },
  },

  // Layer 3: methodological choice
  {
    id: "quantitative",
    layer: "choice",
    name: "Quantitative",
    subject: "a quantitative design",
    essence: "collects numerical data for statistical analysis",
    definition: "A quantitative design collects numerical data and analyses it statistically to measure, compare or test relationships.",
    whyUsed: "To measure how much, how many or how strongly, often across large samples.",
    strengths: ["Allows statistical testing and generalisation.", "Efficient for large numbers of participants."],
    limitations: ["Can miss the reasons behind the numbers.", "Depends on valid and reliable measures."],
    examples: ["A questionnaire measuring job satisfaction among 400 employees.", "Comparing test scores between two teaching methods."],
    references: [],
    fits: {
      philosophy: { strong: ["positivism"], possible: ["realism", "pragmatism"] },
      approach: { strong: ["deductive"], possible: ["abductive"] },
    },
  },
  {
    id: "qualitative",
    layer: "choice",
    name: "Qualitative",
    subject: "a qualitative design",
    essence: "collects words, observations or images to understand meaning",
    definition:
      "A qualitative design collects non-numerical data, such as interviews, observations or texts, to understand meanings, experiences and processes.",
    whyUsed: "To explore how and why people think and act as they do.",
    strengths: ["Rich, detailed understanding.", "Flexible enough to follow unexpected leads."],
    limitations: ["Small samples limit statistical generalisation.", "Analysis is time-consuming and interpretive."],
    examples: ["In-depth interviews with 15 teachers about curriculum change.", "Observing team meetings to understand how decisions are made."],
    references: [],
    fits: {
      philosophy: { strong: ["interpretivism"], possible: ["realism", "pragmatism"] },
      approach: { strong: ["inductive"], possible: ["abductive"] },
    },
  },
  {
    id: "mixed-methods",
    layer: "choice",
    name: "Mixed methods",
    subject: "a mixed methods design",
    essence: "combines quantitative and qualitative data in one study",
    definition: "A mixed methods design combines quantitative and qualitative data within one study and brings their findings together.",
    whyUsed: "When one kind of data alone can't fully answer the research question.",
    strengths: ["Each kind of data can offset the other's weaknesses.", "Can both measure and explain."],
    limitations: ["Demands more time, resources and skill.", "Bringing the two kinds of findings together needs careful planning."],
    examples: [
      "A survey followed by interviews to explain its results.",
      "Interviews used to design a questionnaire that is then used at scale.",
    ],
    references: [],
    fits: {
      philosophy: { strong: ["pragmatism"], possible: ["realism"] },
      approach: { strong: ["abductive"], possible: ["deductive", "inductive"] },
    },
  },
  {
    id: "multi-method",
    layer: "choice",
    name: "Multi-method",
    subject: "a multi-method design",
    essence: "uses several techniques from a single tradition, all quantitative or all qualitative",
    definition:
      "A multi-method design uses more than one data collection technique, but within a single tradition: either all quantitative or all qualitative.",
    whyUsed: "To strengthen findings by approaching a question from more than one angle within the same tradition.",
    strengths: ["Allows findings to be compared across techniques.", "Stays within one set of analysis methods."],
    limitations: ["Doesn't gain the benefits of combining numbers and words.", "Involves more data collection and analysis than a single technique."],
    examples: ["Interviews and focus groups in one qualitative study.", "A questionnaire combined with analysis of existing statistics."],
    references: [],
    fits: {
      philosophy: { strong: ["pragmatism"], possible: ["positivism", "interpretivism", "realism"] },
      approach: { possible: ["deductive", "inductive", "abductive"] },
    },
  },

  // Layer 4: research strategy
  {
    id: "experiment",
    layer: "strategy",
    name: "Experiment",
    subject: "an experiment",
    essence: "tests cause and effect by controlling variables",
    definition:
      "An experiment changes one factor and measures its effect on another while controlling other influences, often by randomly assigning participants to groups.",
    whyUsed: "To establish cause and effect.",
    strengths: ["The strongest design for testing claims about cause and effect.", "Precise, repeatable procedures."],
    limitations: ["Controlled settings may not reflect real life.", "Some factors can't ethically or practically be changed by the researcher."],
    examples: [
      "Randomly assigning students to two revision methods and comparing test scores.",
      "Testing whether the wording of a message changes willingness to donate.",
    ],
    references: [],
    fits: {
      philosophy: { strong: ["positivism"], possible: ["realism", "pragmatism"] },
      approach: { strong: ["deductive"], possible: ["abductive"] },
      choice: { strong: ["quantitative"], possible: ["mixed-methods", "multi-method"] },
    },
  },
  {
    id: "survey",
    layer: "strategy",
    name: "Survey",
    subject: "a survey",
    essence: "collects standardised data from many people",
    definition:
      "A survey collects the same information from a large number of people, usually through a questionnaire or structured interview, to describe a population or examine relationships.",
    whyUsed: "To describe characteristics, attitudes or behaviours across a population.",
    strengths: ["Reaches many people efficiently.", "Standardised data can be compared and analysed statistically."],
    limitations: ["Answers are limited to the questions asked.", "Relies on what people report, which may differ from what they do."],
    examples: ["A national survey of student wellbeing.", "Measuring customer satisfaction across a bank's branches."],
    references: [],
    fits: {
      philosophy: { strong: ["positivism"], possible: ["realism", "pragmatism"] },
      approach: { strong: ["deductive"], possible: ["inductive", "abductive"] },
      choice: { strong: ["quantitative"], possible: ["mixed-methods", "multi-method"] },
    },
  },
  {
    id: "case-study",
    layer: "strategy",
    name: "Case study",
    subject: "a case study",
    essence: "examines a case in depth in its real-life context",
    definition:
      "A case study investigates one or a few cases, such as an organisation, event or community, in depth and in their real-life context, often using several sources of evidence.",
    whyUsed: "To understand a complex situation in detail, where context matters.",
    strengths: ["Rich understanding of how things work in practice.", "Can combine several kinds of evidence."],
    limitations: ["Findings from a few cases can't be generalised statistically.", "Defining the boundaries of the case can be difficult."],
    examples: ["How one hospital introduced electronic patient records.", "A study of three start-ups' growth strategies."],
    references: [],
    fits: {
      philosophy: { strong: ["interpretivism", "realism"], possible: ["positivism", "pragmatism"] },
      approach: { strong: ["inductive", "abductive"], possible: ["deductive"] },
      choice: { strong: ["qualitative", "mixed-methods"], possible: ["quantitative", "multi-method"] },
    },
  },
  {
    id: "ethnography",
    layer: "strategy",
    name: "Ethnography",
    subject: "ethnography",
    essence: "studies a group's culture through extended immersion",
    definition:
      "Ethnography studies the culture and everyday life of a group by spending an extended period with them, typically through participant observation.",
    whyUsed: "To understand a group's shared practices and meanings from the inside.",
    strengths: ["Deep, first-hand understanding of everyday life.", "Reveals what people do, not only what they say."],
    limitations: ["Very time-consuming.", "The researcher's presence may change how people behave."],
    examples: [
      "Spending a year with a community sports club to understand belonging.",
      "Studying the working culture of an emergency department.",
    ],
    references: [],
    fits: {
      philosophy: { strong: ["interpretivism"], possible: ["realism", "pragmatism"] },
      approach: { strong: ["inductive"], possible: ["abductive"] },
      choice: { strong: ["qualitative"], possible: ["multi-method", "mixed-methods"] },
    },
  },
  {
    id: "grounded-theory",
    layer: "strategy",
    name: "Grounded Theory",
    subject: "Grounded Theory",
    essence: "develops theory inductively",
    definition:
      "Grounded Theory develops a theory from the data itself, collecting and analysing data at the same time and comparing cases until new data adds little (theoretical saturation).",
    whyUsed: "To produce a new explanation of a process where existing theory is limited.",
    strengths: ["Theory closely grounded in evidence.", "Systematic procedures for analysis."],
    limitations: [
      "Time-consuming, because data collection and analysis alternate.",
      "Different versions of Grounded Theory follow different procedures, so the version used must be named.",
    ],
    examples: [
      "Developing a theory of how families cope with long-term illness.",
      "Explaining how new managers learn their role.",
    ],
    references: [],
    fits: {
      philosophy: { strong: ["interpretivism"], possible: ["pragmatism", "realism"] },
      approach: { strong: ["inductive"], possible: ["abductive"] },
      choice: { strong: ["qualitative"], possible: ["multi-method", "mixed-methods"] },
    },
  },
  {
    id: "action-research",
    layer: "strategy",
    name: "Action research",
    subject: "action research",
    essence: "improves a practical situation through cycles of action and reflection",
    definition:
      "Action research brings researchers and participants together to improve a practical situation through repeated cycles of planning, acting, observing and reflecting.",
    whyUsed: "To solve a real problem while generating knowledge about it.",
    strengths: ["Produces practical change as well as knowledge.", "Involves the people affected."],
    limitations: ["Findings are closely tied to one setting.", "The researcher's involvement makes objectivity harder to claim."],
    examples: [
      "Teachers working together to improve feedback practices over a school year.",
      "A hospital team redesigning how patients are handed over between shifts.",
    ],
    references: [],
    fits: {
      philosophy: { strong: ["pragmatism"], possible: ["interpretivism", "realism"] },
      approach: { strong: ["abductive"], possible: ["inductive", "deductive"] },
      choice: { strong: ["mixed-methods", "qualitative"], possible: ["multi-method", "quantitative"] },
    },
  },
  {
    id: "narrative-inquiry",
    layer: "strategy",
    name: "Narrative inquiry",
    subject: "narrative inquiry",
    essence: "studies experience through the stories people tell",
    definition:
      "Narrative inquiry studies people's experiences through the stories they tell, paying attention to how events are ordered and given meaning.",
    whyUsed: "To understand how people make sense of events over the course of their lives.",
    strengths: ["Keeps the richness and order of personal experience.", "Gives participants a voice."],
    limitations: ["Usually involves few participants.", "Stories are shaped by memory and by the way they are told."],
    examples: ["Refugees' accounts of settling in a new country.", "The career stories of women in engineering."],
    references: [],
    fits: {
      philosophy: { strong: ["interpretivism"], possible: ["pragmatism", "realism"] },
      approach: { strong: ["inductive"], possible: ["abductive"] },
      choice: { strong: ["qualitative"], possible: ["multi-method", "mixed-methods"] },
    },
  },
  {
    id: "phenomenology",
    layer: "strategy",
    name: "Phenomenology",
    subject: "phenomenology",
    essence: "explores how people experience a phenomenon",
    definition:
      "Phenomenology studies how people experience a particular phenomenon, aiming to describe what that lived experience is like from the perspective of those who have had it. It is also a philosophical tradition; here it is treated as a research strategy.",
    whyUsed: "To understand what an experience is like for those who live it.",
    strengths: ["Detailed insight into lived experience.", "Centres participants' own perspectives."],
    limitations: ["Relies on small, carefully chosen samples.", "Requires careful handling of the researcher's own assumptions."],
    examples: ["The experience of returning to study after a long break.", "What living with chronic pain is like for young adults."],
    references: [],
    fits: {
      philosophy: { strong: ["interpretivism"], possible: ["pragmatism"] },
      approach: { strong: ["inductive"], possible: ["abductive"] },
      choice: { strong: ["qualitative"], possible: ["multi-method"] },
    },
  },
  {
    id: "archival-research",
    layer: "strategy",
    name: "Archival research",
    subject: "archival research",
    essence: "analyses records that already exist",
    definition:
      "Archival research uses records and documents that already exist, such as company reports, official records or historical archives, as its main source of data.",
    whyUsed: "To study the past, or large-scale patterns, using existing records.",
    strengths: ["Gives access to data that would otherwise be out of reach.", "The data isn't affected by the researcher's presence."],
    limitations: ["The records were created for other purposes and may be incomplete.", "Access to archives can be restricted."],
    examples: [
      "Analysing 20 years of annual reports for changes in sustainability reporting.",
      "Using parliamentary records to trace a policy debate.",
    ],
    references: [],
    fits: {
      philosophy: { possible: ["positivism", "interpretivism", "pragmatism", "realism"] },
      approach: { possible: ["deductive", "inductive", "abductive"] },
      choice: { possible: ["quantitative", "qualitative", "mixed-methods", "multi-method"] },
    },
  },

  // Layer 5: time horizon
  {
    id: "cross-sectional",
    layer: "timeHorizon",
    name: "Cross-sectional",
    subject: "a cross-sectional design",
    essence: "collects data at a single point in time",
    definition: "A cross-sectional study collects data at one point in time, giving a snapshot.",
    whyUsed: "When time is limited, or the aim is to describe a situation as it is now.",
    strengths: ["Quicker and cheaper than following people over time.", "Useful for comparing groups at one moment."],
    limitations: ["Can't show change over time.", "Makes cause and effect harder to establish."],
    examples: ["A survey of student stress levels in one semester.", "Interviews with managers about current remote-working policies."],
    references: [],
    fits: {
      strategy: {
        strong: ["survey", "case-study", "phenomenology"],
        possible: ["experiment", "grounded-theory", "narrative-inquiry", "archival-research"],
      },
    },
  },
  {
    id: "longitudinal",
    layer: "timeHorizon",
    name: "Longitudinal",
    subject: "a longitudinal design",
    essence: "follows change over time",
    definition: "A longitudinal study collects data from the same people, groups or organisations at several points in time.",
    whyUsed: "To study change and development.",
    strengths: ["Shows how things change over time.", "Gives stronger evidence about the order in which things happen."],
    limitations: ["Time-consuming and costly.", "Participants may drop out over time."],
    examples: ["Following graduates' careers over five years.", "Tracking a company's culture before and after a merger."],
    references: [],
    fits: {
      strategy: {
        strong: ["ethnography", "action-research", "archival-research"],
        possible: ["experiment", "survey", "case-study", "grounded-theory", "narrative-inquiry", "phenomenology"],
      },
    },
  },

  // Layer 6: techniques and procedures
  {
    id: "questionnaire",
    layer: "technique",
    name: "Questionnaire",
    subject: "a questionnaire",
    essence: "asks many people the same set of questions",
    definition: "A questionnaire asks each respondent the same questions in the same order, usually with fixed answer options, on paper or online.",
    whyUsed: "To collect comparable data from many people.",
    strengths: ["Efficient for large samples.", "Standardised answers are easy to compare."],
    limitations: ["Little chance to probe or clarify answers.", "Response rates can be low."],
    examples: ["An online questionnaire on study habits sent to all first-year students.", "A customer satisfaction form with rating scales."],
    references: [],
    fits: {
      choice: { strong: ["quantitative"], possible: ["mixed-methods", "multi-method"] },
      strategy: { strong: ["survey"], possible: ["experiment", "case-study", "action-research"] },
    },
  },
  {
    id: "interview",
    layer: "technique",
    name: "Interview",
    subject: "an interview",
    essence: "explores views in depth through conversation",
    definition:
      "An interview is a conversation in which the researcher asks questions to explore a participant's views and experiences. Interviews may be structured, semi-structured or unstructured.",
    whyUsed: "To understand people's perspectives in depth.",
    strengths: ["Detailed, nuanced answers.", "Allows follow-up questions."],
    limitations: [
      "Time-consuming to conduct, transcribe and analyse.",
      "Answers can be shaped by the interviewer, or by what seems acceptable to say.",
    ],
    examples: ["Semi-structured interviews with 12 HR managers.", "Life-history interviews with retired teachers."],
    references: [],
    fits: {
      choice: { strong: ["qualitative", "mixed-methods"], possible: ["multi-method", "quantitative"] },
      strategy: {
        strong: ["case-study", "grounded-theory", "narrative-inquiry", "phenomenology"],
        possible: ["ethnography", "action-research", "survey"],
      },
    },
  },
  {
    id: "observation",
    layer: "technique",
    name: "Observation",
    subject: "observation",
    essence: "records behaviour as it happens",
    definition: "Observation involves watching and recording what people do in a setting, either as an outsider or as a participant.",
    whyUsed: "To see what people actually do, rather than what they report.",
    strengths: ["Captures real behaviour in context.", "Can reveal things participants take for granted."],
    limitations: ["People may behave differently when observed.", "Observations need careful recording to limit bias."],
    examples: ["Observing interactions in a primary school classroom.", "Recording how customers move through a shop."],
    references: [],
    fits: {
      choice: { strong: ["qualitative"], possible: ["quantitative", "mixed-methods", "multi-method"] },
      strategy: { strong: ["ethnography"], possible: ["experiment", "case-study", "action-research", "grounded-theory"] },
    },
  },
  {
    id: "focus-group",
    layer: "technique",
    name: "Focus group",
    subject: "a focus group",
    essence: "gathers views through a guided group discussion",
    definition: "A focus group is a guided discussion with a small group of participants on a set topic, led by a moderator.",
    whyUsed: "To explore shared views and how opinions form through discussion.",
    strengths: ["Group interaction can bring out ideas individuals might not raise.", "Collects several views at once."],
    limitations: ["Some voices can dominate the discussion.", "Less suitable for sensitive or personal topics."],
    examples: ["Discussing campus facilities with groups of students.", "Testing reactions to a new product idea."],
    references: [],
    fits: {
      choice: { strong: ["qualitative"], possible: ["mixed-methods", "multi-method"] },
      strategy: { strong: ["action-research"], possible: ["case-study", "grounded-theory", "ethnography"] },
    },
  },
  {
    id: "document-analysis",
    layer: "technique",
    name: "Document analysis",
    subject: "document analysis",
    essence: "examines existing documents and texts",
    definition:
      "Document analysis systematically examines existing documents, such as policies, reports, letters or media texts, to interpret their content and meaning.",
    whyUsed: "To study how an issue is described, justified or recorded in writing.",
    strengths: ["Documents are often readily available.", "Unaffected by the researcher's presence."],
    limitations: [
      "Documents may be incomplete or written for a particular audience.",
      "Interpretation depends on understanding why and how the documents were produced.",
    ],
    examples: [
      "Analysing university strategy documents for how they describe employability.",
      "Studying newspaper coverage of climate protests.",
    ],
    references: [],
    fits: {
      choice: { strong: ["qualitative"], possible: ["quantitative", "mixed-methods", "multi-method"] },
      strategy: {
        strong: ["archival-research", "case-study"],
        possible: ["grounded-theory", "ethnography", "action-research", "narrative-inquiry"],
      },
    },
  },
  {
    id: "secondary-data",
    layer: "technique",
    name: "Secondary data",
    subject: "secondary data analysis",
    essence: "reanalyses data that others have collected",
    definition:
      "Secondary data analysis uses data collected by someone else for another purpose, such as national statistics or existing survey datasets.",
    whyUsed: "To answer new questions with existing, often large, datasets.",
    strengths: ["Saves time and cost.", "Can provide large, high-quality datasets."],
    limitations: ["The data may not measure exactly what you need.", "You have no control over how it was collected."],
    examples: ["Using national census data to study housing and health.", "Reanalysing a large existing education survey."],
    references: [],
    fits: {
      choice: { strong: ["quantitative"], possible: ["qualitative", "mixed-methods", "multi-method"] },
      strategy: { strong: ["archival-research", "survey"], possible: ["case-study", "experiment", "grounded-theory"] },
    },
  },
];

export function getLayer(id: LayerId): OnionLayer {
  const layer = LAYERS.find((candidate) => candidate.id === id);
  if (!layer) throw new RangeError(`Unknown layer: ${id}`);
  return layer;
}

/** The option with this id, or undefined if there is none. */
export function findOption(id: string): OnionOption | undefined {
  return OPTIONS.find((option) => option.id === id);
}

export function optionsFor(layer: LayerId): OnionOption[] {
  return OPTIONS.filter((option) => option.layer === layer);
}
