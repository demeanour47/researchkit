/**
 * Worked examples for teaching: a weak title, why it is weak, what a stronger title
 * would have, and the academic reasoning. The titles are fictional and written only
 * to illustrate; they are never offered as a replacement for the researcher's own.
 */

export interface TitleExample {
  id: string;
  region: "nepal" | "global";
  weak: string;
  whyWeak: readonly string[];
  strongerCharacteristics: readonly string[];
  explanation: string;
  /** A fictional title with those characteristics, for the guide. */
  stronger: string;
  references: readonly string[];
}

export const TITLE_EXAMPLES: readonly TitleExample[] = [
  {
    id: "mobile-phones",
    region: "nepal",
    weak: "Impact of Mobile Phones on Students",
    whyWeak: [
      "“Mobile phones” is a topic, not a variable: it doesn't say what about phone use is measured.",
      "“Students” is too wide: which students, at what level, and where?",
      "“Impact” claims cause and effect, which a survey can't usually show.",
    ],
    strongerCharacteristics: [
      "Names a measurable independent variable, such as daily smartphone use.",
      "Names the outcome it is related to.",
      "Names the population and the place.",
      "Uses relationship wording when the design is correlational.",
    ],
    explanation:
      "Creswell and Creswell (2018) advise drafting a working title early and refining it as the study takes shape. Naming the variables, participants and site keeps it specific, and causal words such as “impact” belong only with designs that can support them (Shadish et al., 2002).",
    stronger: "Relationship between Daily Smartphone Use and Sleep Quality among Grade 11 Students in Kathmandu Valley",
    references: ["creswell-creswell-2018", "shadish-2002"],
  },
  {
    id: "women-empowerment",
    region: "nepal",
    weak: "A Study on Women Empowerment in Nepal",
    whyWeak: [
      "“A Study on” adds words without meaning.",
      "“Women empowerment” is a broad idea with many definitions; the title doesn't say which aspect is studied.",
      "“Nepal” is a whole country for what is probably a local study.",
    ],
    strongerCharacteristics: [
      "Leaves out filler openings.",
      "Names the specific aspect studied and how it is expressed.",
      "Matches the place in the title to where data were collected.",
    ],
    explanation:
      "APA Style (American Psychological Association, 2020) advises against title words that serve no purpose. A focused title names the concepts the study actually measures, which Kothari (2004) ties to a clearly defined research problem.",
    stronger: "Participation in Community Forest User Groups and Household Decision-Making among Women in Kaski District, Nepal",
    references: ["apa-2020", "kothari-2004"],
  },
  {
    id: "tourism",
    region: "nepal",
    weak: "Tourism and Its Effects",
    whyWeak: ["The title names a field, not a study: neither what is measured nor whom it concerns.", "“Its effects” leaves the outcome unstated."],
    strongerCharacteristics: ["Names the kind of tourism studied.", "Names the outcome.", "Names the community and place.", "May name the method when it matters, such as a mixed-methods design."],
    explanation: "A title is often the only part of a study readers see in a search. Punch (2005) stresses that a study's questions, and so its title, define what it will and won't cover.",
    stronger: "Homestay Tourism and Household Income among Families in Ghandruk, Kaski: A Mixed-Methods Study",
    references: ["punch-2005", "creswell-plano-clark-2018"],
  },
  {
    id: "social-media",
    region: "global",
    weak: "Social Media and Mental Health Issues Nowadays",
    whyWeak: ["“Issues” and “nowadays” are vague and date quickly.", "No population is named.", "Neither variable is defined: which use of social media, and which aspect of mental health?"],
    strongerCharacteristics: ["Names measurable variables.", "Names the population.", "Replaces relative time words with a period, when time matters."],
    explanation: "Sekaran and Bougie (2013) describe variables as things that can be measured and vary. A title that names them lets readers judge what the study can find.",
    stronger: "Time Spent on Social Media and Depressive Symptoms among Adolescents in England",
    references: ["sekaran-bougie-2013"],
  },
  {
    id: "online-learning",
    region: "global",
    weak: "An Investigation into the Effectiveness of Online Learning",
    whyWeak: ["“An Investigation into” is filler.", "“Effectiveness” is ambiguous: effective for what outcome?", "The design, which decides whether an effect can be shown, isn't clear."],
    strongerCharacteristics: ["Starts with the content, not filler.", "Names the outcome that shows effectiveness.", "Names the participants and, for an effect claim, a design that can support it."],
    explanation: "Effect claims need designs with a comparison, such as quasi-experiments (Shadish et al., 2002). Naming the design tells readers how strong the evidence is.",
    stronger: "Effect of Flipped Classroom Instruction on Mathematics Achievement among First-Year Undergraduates: A Quasi-Experimental Study",
    references: ["shadish-2002", "apa-2020"],
  },
  {
    id: "nurses",
    region: "global",
    weak: "Nurses' Experiences",
    whyWeak: ["The title names who, but not which experience.", "It is too short to say what the study is about."],
    strongerCharacteristics: ["Names the experience studied.", "Names the setting.", "May name the qualitative approach, such as phenomenology."],
    explanation: "Qualitative studies are framed around a central phenomenon and the participants rather than variables (Creswell & Creswell, 2018), so their titles name those. Phenomenological studies describe how people live through an experience (van Manen, 1990).",
    stronger: "Lived Experiences of Nurses Caring for Patients at the End of Life in Intensive Care Units: A Phenomenological Study",
    references: ["creswell-creswell-2018", "van-manen-1990"],
  },
];
