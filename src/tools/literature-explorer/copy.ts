/** All wording for Literature Explorer. Search logic and labels' meaning live in the knowledge layer. */

export const page = {
  title: "Literature Explorer",
  summary: "Search scholarly literature by topic, see which keywords and topics recur, and copy citations to start a reading list.",
  metaDescription:
    "Search scholarly articles by topic with OpenAlex. Filter by year, open access and type, see matched keywords and topic groups, open the article or its DOI, and copy an APA 7 reference or BibTeX.",
  intro:
    "Type a topic, and Literature Explorer searches OpenAlex, an open index of scholarly works. It shows what it found with the keywords that matched, the topics that recur, and links to the article, its DOI and any free full text. Use it to start a literature search, then read and judge each work yourself.",
  noScript: "Searching needs JavaScript. The notes below on how it works, its limits and what happens to your search work without it.",
  howHeading: "How to use it",
  methodHeading: "How results are chosen and ordered",
  limitsHeading: "What this tool can't do",
  privacyHeading: "Privacy",
} as const;

export const how: readonly string[] = [
  "Type your topic as a few key words or phrases. Put a phrase in quotation marks, such as “peer feedback”, and join alternatives with OR.",
  "Narrow by year, open access or type of work if you have too many results. Widen by removing a filter or a word if you have too few.",
  "Read the topic groups and suggested keywords. They show other words authors use for your idea, which you can search next.",
  "Open an article or its DOI to read it. Copy its APA 7 reference or BibTeX to start your reading list, and paste BibTeX into the Literature Matrix Builder's import box to compare studies.",
  "Search again with different words. Searching is repeated: keep a note of each search, the filters and the date.",
];

export const method: readonly string[] = [
  "Search: your words are matched against the title, abstract and keywords of each work in OpenAlex. Words without OR are all required; stemming means “writing” also finds “writings”.",
  "Order: each work scores points for your words in its title (3), abstract (1) and OpenAlex keywords or topics (2), and for each quoted phrase in the title (6) or abstract (3). The total is shown as a percentage of the most a work could score for your search. Equal scores keep OpenAlex's own order. This is a guide to relevance, not to quality.",
  "Duplicates: works with the same DOI, or the same title with the same year or first author, are combined. Works that only look alike are kept apart.",
  "Keywords: “OpenAlex keywords” and “topics” are assigned automatically by OpenAlex. They aren't the keywords the authors chose. “Words ResearchKit found” are words that recur in the titles and abstracts shown.",
  "Topic groups: ResearchKit groups the results using the topics and keywords that several works share. The groups depend on this set of results and change with your search.",
];

export const limits: readonly string[] = [
  "OpenAlex doesn't cover every work, and its metadata is collected automatically, so some records have missing or wrong details. Check each reference against the article before you cite it.",
  "Author names come as one text. ResearchKit splits them into family and given names by rule, so check them, especially names with several parts.",
  "It shows up to 50 works per search, and only the ones best matching your words. It isn't a systematic search and can't replace searching your library's databases.",
  "It can't say whether a work is peer reviewed, good, or right for your question. A free full-text link means OpenAlex found an open copy, not that it is the final published version.",
  "Retracted works are flagged when OpenAlex knows about it. Not every retraction is known.",
  "Your results are kept on this page only. Reload or leave, and they are gone. Copy what you need.",
];

export const privacy =
  "Your search words and filters are sent to ResearchKit's server, which passes them to OpenAlex to find results. ResearchKit doesn't store or log them. OpenAlex and the host that runs ResearchKit may keep their own records under their own policies. The results stay in your browser and nothing is saved. Don't enter anything you wouldn't want to send to those services.";

export const ui = {
  searchLabel: "Search for a topic",
  searchHint: "For example: “peer feedback” AND academic writing",
  searchButton: "Search",
  searching: "Searching OpenAlex",
  guidanceTitle: "Searching tips",
  guidance: [
    "Use key concepts, not whole sentences.",
    "Put exact phrases in quotation marks.",
    "Join synonyms with OR, such as student OR undergraduate.",
    "Exclude a word with NOT.",
  ],
  guideLink: "Read the guide: how to search academic literature",
  filters: "Filters",
  yearFrom: "From year",
  yearTo: "To year",
  openAccess: "Availability",
  openAccessOptions: [
    { value: "any", label: "All works" },
    { value: "open", label: "Open access only" },
  ],
  type: "Type of work",
  typeOptions: [
    { value: "any", label: "All types" },
    { value: "article", label: "Articles" },
    { value: "review", label: "Reviews" },
    { value: "book", label: "Books" },
    { value: "book-chapter", label: "Book chapters" },
    { value: "preprint", label: "Preprints" },
    { value: "dissertation", label: "Dissertations" },
  ],
  sort: "Order by",
  sortOptions: [
    { value: "relevance", label: "Relevance" },
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
  ],
  topicsHeading: "Topic groups",
  topicsNote: "Grouped by ResearchKit from the topics and keywords OpenAlex assigned to these results.",
  allTopics: "All results",
  suggestionsHeading: "Other words to search",
  providerTerms: "OpenAlex keywords (assigned automatically, not by the authors)",
  researchKitTerms: "Words ResearchKit found recurring in these titles and abstracts",
  resultsHeading: "Results",
  initialTitle: "Search to see results",
  initialText: "Results appear here. Nothing is searched until you press Search.",
  noResultsTitle: "No works found",
  noResultsHelp: [
    "Check the spelling, and try a more general word.",
    "Remove a filter, or widen the years.",
    "Use OR between synonyms, such as “students OR learners”.",
    "Remove quotation marks around phrases to match the words anywhere.",
  ],
  noMatchInGroup: "No results in this group.",
  rateLimited: "Too many searches in a short time, or OpenAlex is limiting requests. Wait a little and try again.",
  failed: "The search couldn't be completed. Your words were not lost; try again in a moment.",
  malformed: "ResearchKit received an answer it couldn't read. Try again, or change your search.",
  offline: "The search couldn't reach ResearchKit. Check your connection and try again.",
  partial: "Some sources could not be searched:",
  skipped: (count: number) => `${count} ${count === 1 ? "record" : "records"} from OpenAlex could not be read and ${count === 1 ? "was" : "were"} left out.`,
  total: (shown: number, total: number | null) => (total !== null && total > shown ? `Showing ${shown} of about ${total.toLocaleString("en")} works found.` : `${shown} ${shown === 1 ? "work" : "works"} found.`),
  retrieved: (iso: string) => `Retrieved from OpenAlex on ${iso.slice(0, 10)}.`,
  open: "Open article",
  doi: "Open DOI",
  fullText: "Open free full text",
  copyApa: "Copy APA 7 reference",
  copyBibtex: "Copy BibTeX",
  apaSubject: "APA 7 reference",
  bibtexSubject: "BibTeX",
  copied: (subject: string) => `Copied ${subject}.`,
  copyFailed: (subject: string) => `Couldn't copy ${subject}. Select the text and copy it yourself.`,
  matched: "Matched",
  topic: "Topic",
  openAccessBadge: "Open access",
  retractedBadge: "Retracted",
  incomplete: "Incomplete details",
  incompleteHelp: (fields: string[]) => `OpenAlex didn't supply: ${fields.join(", ")}.`,
  checkBeforeCiting: "Check before citing",
  referenceIncomplete: "This reference is incomplete: some parts are missing.",
  score: (score: number) => `Relevance ${score}%`,
  scoreExplained: "A guide based on your words in the title, abstract and keywords. Not a measure of quality.",
} as const;
