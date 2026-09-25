import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { crc32 } from "./conceptual-export";
import { buildQuestionnaire } from "./questionnaire-builder";
import { PDF_PAGE, layoutPdf, pageLabel, questionnaireDocx, questionnairePdf, utf8, xmlText, zip } from "./questionnaire-export";
import { addQuestion, changeType, updateQuestion } from "./questionnaire-items";
import { questionnaireDocument, questionnaireMarkdown, type DocumentBlock } from "./questionnaire-summary";
import { sleepProject } from "./questionnaire-test-helpers";
import { checkQuestionnaire } from "./questionnaire-validator";
import { QUESTION_TYPES, type Questionnaire } from "./questionnaire-types";

const project = sleepProject();
const blocks = () => questionnaireDocument(buildQuestionnaire(project), project);
const latin1 = (bytes: Uint8Array) => Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

/** Reads a stored ZIP archive back, checking every signature, size and CRC on the way. */
function unzip(bytes: Uint8Array): Map<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = bytes.length - 22;
  assert.equal(view.getUint32(end, true), 0x06054b50, "end of central directory");
  const count = view.getUint16(end + 10, true);
  let central = view.getUint32(end + 16, true);
  const files = new Map<string, string>();
  for (let index = 0; index < count; index++) {
    assert.equal(view.getUint32(central, true), 0x02014b50, "central directory header");
    const size = view.getUint32(central + 24, true);
    const nameLength = view.getUint16(central + 28, true);
    const local = view.getUint32(central + 42, true);
    assert.equal(view.getUint32(local, true), 0x04034b50, "local header");
    assert.equal(view.getUint16(local + 8, true), 0, "stored");
    const name = new TextDecoder().decode(bytes.subarray(local + 30, local + 30 + nameLength));
    const data = bytes.subarray(local + 30 + nameLength, local + 30 + nameLength + size);
    assert.equal(view.getUint32(local + 14, true), crc32(data), `${name} CRC`);
    files.set(name, new TextDecoder().decode(data));
    central += 46 + nameLength;
  }
  return files;
}

/** Whether every opening WordprocessingML tag of these kinds is closed, in order. */
function balanced(xml: string, tags: readonly string[]): boolean {
  const stack: string[] = [];
  for (const match of xml.matchAll(/<(\/?)(w:[a-zA-Z]+)[^>]*?(\/?)>/g)) {
    const [, closing, tag, selfClosing] = match;
    if (!tags.includes(tag) || selfClosing) continue;
    if (closing) {
      if (stack.pop() !== tag) return false;
    } else stack.push(tag);
  }
  return stack.length === 0;
}

describe("utf8", () => {
  it("encodes one to four bytes per character, as the platform does", () => {
    for (const text of ["plain", "café", "☐ ○", "日本語", "🙂 emoji", ""]) assert.deepEqual(Array.from(utf8(text)), Array.from(new TextEncoder().encode(text)), text);
  });
});

describe("zip", () => {
  it("writes a readable archive with correct CRCs, and the same bytes every time", () => {
    const entries = [
      { name: "a.txt", data: utf8("hello") },
      { name: "folder/ü.xml", data: utf8("<x>ü</x>") },
      { name: "empty", data: new Uint8Array(0) },
    ];
    const files = unzip(zip(entries));
    assert.deepEqual([...files.entries()], [
      ["a.txt", "hello"],
      ["folder/ü.xml", "<x>ü</x>"],
      ["empty", ""],
    ]);
    assert.deepEqual(zip(entries), zip(entries));
  });
});

describe("xmlText", () => {
  it("escapes markup and removes characters XML forbids", () => {
    assert.equal(xmlText(`a < b & "c" > d`), "a &lt; b &amp; &quot;c&quot; &gt; d");
    assert.equal(xmlText("bell\u0007 tab\t ok￿"), "bell tab\t ok");
  });
});

describe("questionnaireDocx", () => {
  const files = unzip(questionnaireDocx(questionnaireDocument(updateQuestion(changeType(buildQuestionnaire(project), "q-5", "matrix"), "q-5", { rows: ["I fall asleep <quickly>"] }), project), "Sleep & screens"));
  const document = files.get("word/document.xml")!;

  it("contains every part a Word document needs", () => {
    assert.deepEqual([...files.keys()], ["[Content_Types].xml", "_rels/.rels", "docProps/core.xml", "word/document.xml", "word/_rels/document.xml.rels", "word/styles.xml", "word/footer1.xml"]);
    assert.ok(files.get("[Content_Types].xml")!.includes('PartName="/word/document.xml"'));
    assert.ok(files.get("_rels/.rels")!.includes('Target="word/document.xml"'));
    assert.ok(files.get("word/_rels/document.xml.rels")!.includes('Target="footer1.xml"'));
    assert.ok(files.get("docProps/core.xml")!.includes("<dc:title>Sleep &amp; screens</dc:title>"));
  });

  it("is well-formed, with headings, numbered questions, tables and a page break after the cover", () => {
    assert.ok(balanced(document, ["w:document", "w:body", "w:p", "w:r", "w:tbl", "w:tr", "w:tc", "w:pPr", "w:rPr"]));
    assert.ok(document.includes('<w:pStyle w:val="Title"/>'));
    assert.equal(document.match(/<w:pStyle w:val="Heading1"\/>/g)?.length, 10, "every section but the cover");
    assert.equal(document.match(/<w:br w:type="page"\/>/g)?.length, 1);
    assert.ok(document.includes("<w:t xml:space=\"preserve\">1.\t</w:t>"));
    assert.equal(document.match(/<w:tbl>/g)?.length, 3, "Likert items and the matrix are tables");
    assert.ok(document.includes("5a. I fall asleep &lt;quickly&gt;"));
    assert.ok(document.includes("<w:tblHeader/>"), "table headers repeat on new pages");
    assert.ok(document.includes('<w:pgSz w:w="11906" w:h="16838"/>'), "A4");
  });

  it("numbers pages in the footer", () => {
    const footer = files.get("word/footer1.xml")!;
    assert.ok(footer.includes(" PAGE ") && footer.includes(" NUMPAGES "));
  });
});

describe("layoutPdf", () => {
  /** A long questionnaire: a heading per section and many Likert items. */
  function long(sections: number, perSection: number): DocumentBlock[] {
    let questionnaire: Questionnaire = { title: "Long", sections: [], questions: [] };
    for (let s = 0; s < sections; s++) {
      questionnaire = { ...questionnaire, sections: [...questionnaire.sections, { id: `s${s}`, kind: "items", title: `Section ${s + 1}`, content: "" }] };
      for (let q = 0; q < perSection; q++) questionnaire = addQuestion(questionnaire, `s${s}`, { type: "likert", text: `Statement ${q + 1} in section ${s + 1}, long enough to wrap onto a second line in the printed questionnaire.` }).questionnaire;
    }
    return questionnaireDocument(questionnaire, project);
  }
  const pagesOf = (pages: ReturnType<typeof layoutPdf>, index: number) => pages.flatMap((page, number) => (page.blocks.includes(index) ? [number] : []));

  it("starts a new page after the cover", () => {
    const layout = layoutPdf(blocks());
    const breakAt = blocks().findIndex((block) => block.kind === "page-break");
    assert.deepEqual(pagesOf(layout, breakAt - 1), [0]);
    assert.deepEqual(pagesOf(layout, breakAt + 1), [1]);
  });

  it("never splits a question that fits on a page, and keeps each heading with what follows", () => {
    const document = long(4, 12);
    const pages = layoutPdf(document);
    assert.ok(pages.length > 3);
    document.forEach((block, index) => {
      if (block.kind === "question") assert.equal(pagesOf(pages, index).length, 1, `question ${block.number} is split`);
      if (block.kind === "heading") assert.deepEqual(pagesOf(pages, index), pagesOf(pages, index + 1).slice(0, 1), `${block.text} is left alone`);
    });
    assert.deepEqual(pages.flatMap((page) => page.blocks).filter((index, at, all) => all.indexOf(index) === at), document.map((_, index) => index).filter((index) => document[index].kind !== "page-break"), "every block is placed, in order");
  });

  it("keeps everything inside the margins", () => {
    for (const page of layoutPdf(long(2, 20))) {
      for (const item of page.items) {
        const top = item.type === "line" ? Math.min(item.y1, item.y2) : item.y;
        const bottom = item.type === "rect" ? item.y + item.height : item.type === "line" ? Math.max(item.y1, item.y2) : item.y;
        assert.ok(top >= PDF_PAGE.margin - 0.01 && bottom <= PDF_PAGE.height - PDF_PAGE.margin + 0.01, JSON.stringify(item));
        if (item.type === "text") assert.ok(item.x >= PDF_PAGE.margin - 0.01 && item.x < PDF_PAGE.width - PDF_PAGE.margin, item.text);
      }
    }
  });

  it("splits a question taller than a page between its rows", () => {
    let questionnaire = buildQuestionnaire(project);
    questionnaire = updateQuestion(changeType(questionnaire, "q-5", "matrix"), "q-5", { rows: Array.from({ length: 70 }, (_, index) => `Statement ${index + 1}`) });
    const document = questionnaireDocument(questionnaire, project);
    const index = document.findIndex((block) => block.kind === "question" && block.number === "5");
    assert.ok(pagesOf(layoutPdf(document), index).length >= 2);
  });

  it("lays out every question type", () => {
    let questionnaire: Questionnaire = { title: "All", sections: [{ id: "all", kind: "custom", title: "All", content: "" }], questions: [] };
    for (const type of QUESTION_TYPES) questionnaire = addQuestion(questionnaire, "all", { type, text: `A ${type} question` }).questionnaire;
    const pages = layoutPdf(questionnaireDocument(questionnaire, project));
    const texts = pages.flatMap((page) => page.items.filter((item) => item.type === "text").map((item) => (item.type === "text" ? item.text : "")));
    for (const expected of ["Answer: __________", "[File upload: online versions only]", "[option 1]", "Yes", "True", "Strongly", "[word at one", "9a. [statement 1]"]) assert.ok(texts.some((text) => text.includes(expected)), expected);
    assert.ok(pages.some((page) => page.items.some((item) => item.type === "circle")), "single choices have circles");
    assert.ok(pages.some((page) => page.items.some((item) => item.type === "rect")), "boxes to tick");
  });
});

describe("questionnairePdf", () => {
  const document = blocks();
  const pdf = latin1(questionnairePdf(document, "Sleep survey"));

  it("is a PDF whose cross-reference table points at every object", () => {
    assert.ok(pdf.startsWith("%PDF-1.4\n"));
    assert.ok(pdf.endsWith("%%EOF\n"));
    const start = Number(/startxref\n(\d+)\n/.exec(pdf)![1]);
    assert.equal(pdf.slice(start, start + 4), "xref");
    const offsets = [...pdf.slice(start).matchAll(/^(\d{10}) 00000 n $/gm)].map((match) => Number(match[1]));
    offsets.forEach((offset, index) => assert.ok(pdf.startsWith(`${index + 1} 0 obj`, offset), `object ${index + 1}`));
  });

  it("has one page per laid-out page, each numbered, in standard fonts", () => {
    const pages = layoutPdf(document).length;
    assert.equal(pdf.match(/\/Type \/Page /g)?.length, pages);
    assert.ok(pdf.includes(`/Count ${pages}`));
    for (let page = 1; page <= pages; page++) assert.ok(pdf.includes(`(${pageLabel(page, pages)})`), pageLabel(page, pages));
    for (const font of ["Helvetica", "Helvetica-Bold", "Helvetica-Oblique"]) assert.ok(pdf.includes(`/BaseFont /${font} `), font);
    assert.ok(pdf.includes("/Title (Sleep survey)"));
  });

  it("records stream lengths that match their content", () => {
    for (const match of pdf.matchAll(/<< \/Length (\d+) >>\nstream\n/g)) {
      const start = match.index! + match[0].length;
      assert.equal(pdf.slice(start + Number(match[1]), start + Number(match[1]) + 10), "\nendstream");
    }
  });
});

describe("large questionnaires", () => {
  it("builds, checks and exports 500 questions quickly (best of three)", () => {
    let questionnaire = buildQuestionnaire(project);
    for (let index = 0; index < 500; index++) {
      questionnaire = addQuestion(questionnaire, index % 2 ? "section-a" : "section-c", { type: QUESTION_TYPES[index % QUESTION_TYPES.length], variableId: "var-screen-time", indicatorId: "var-screen-time-ind-1", text: `Question ${index}` }).questionnaire;
    }
    const run = () => {
      const started = performance.now();
      const document = questionnaireDocument(questionnaire, project);
      checkQuestionnaire(questionnaire, project);
      questionnaireMarkdown(document);
      questionnaireDocx(document, "Large");
      questionnairePdf(document, "Large");
      return performance.now() - started;
    };
    const best = Math.min(run(), run(), run());
    assert.ok(best < 2000, `${Math.round(best)} ms`);
    assert.equal(questionnaireDocument(questionnaire, project).filter((block) => block.kind === "question").length, 506);
  });
});
