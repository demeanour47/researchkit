/** Everything the Questionnaire Builder announces to screen readers. Pure, so it is tested. */

export const announcements = {
  built: (questions: number) => `Questionnaire built from your project: ${questions} ${questions === 1 ? "question" : "questions"}, each still to be worded by you.`,
  missingAdded: (count: number) => (count === 0 ? "Every variable and indicator already has a question." : `${count} placeholder ${count === 1 ? "question" : "questions"} added for what wasn't measured.`),
  questionAdded: (number: string, section: string) => `Question ${number} added to ${section}.`,
  questionDuplicated: (number: string, copy: string) => `Question ${number} duplicated as question ${copy}.`,
  questionDeleted: (number: string) => `Question ${number} deleted. Later questions have been renumbered.`,
  questionMoved: (from: string, to: string) => (from === to ? `Question ${from} is already there.` : `Question ${from} is now question ${to}.`),
  questionSection: (number: string, section: string) => `Question moved to ${section}. It is now question ${number}.`,
  typeChanged: (number: string, type: string) => `Question ${number} is now a ${type.toLowerCase()} question.`,
  sectionAdded: (title: string) => `Section “${title}” added before the closing note.`,
  sectionRemoved: (title: string, questions: number) => `Section “${title}” removed${questions > 0 ? `, with ${questions} ${questions === 1 ? "question" : "questions"}` : ""}.`,
  sectionMoved: (title: string, position: number, total: number) => `Section “${title}” is now ${position} of ${total}.`,
  preview: (mode: string) => `${mode} shown.`,
  downloaded: (format: string) => `${format} file downloaded.`,
  copied: "Questionnaire copied as plain text.",
  copyFailed: "It couldn't be copied automatically. Select it and copy it with Control+C, or Command+C on a Mac.",
} as const;
