import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeHtml, toMarkdown, toPlainText, toPrintHtml } from "./export";
import { SUMMARY_TEXT } from "./labels";
import { summarise } from "./recommendation";
import { REFERENCES, referenceText } from "./references";

const small = summarise({ philosophy: "realism", approach: "deductive" });
const full = summarise({
  philosophy: "positivism",
  approach: "inductive",
  choice: "qualitative",
  strategy: "grounded-theory",
  timeHorizon: "longitudinal",
  technique: "interview",
});
const empty = summarise({});

const reason =
  "A deductive approach usually tests an existing theory against data. It can also work with Realism, which generally looks for the mechanisms that lie behind what can be observed, if your design shows how the two connect.";
const justify = "Explain how a deductive approach will work alongside Realism in your study.";

describe("toMarkdown", () => {
  it("writes the complete summary for a partial design", () => {
    assert.equal(
      toMarkdown(small),
      [
        "# Research Onion Summary",
        "",
        SUMMARY_TEXT.intro,
        "",
        "## Your choices",
        "",
        "- Philosophy: Realism",
        "- Approach: Deductive",
        "- Method: Not chosen",
        "- Strategy: Not chosen",
        "- Time horizon: Not chosen",
        "- Data collection: Not chosen",
        "",
        "## Why this combination works",
        "",
        SUMMARY_TEXT.noStrongFits,
        "",
        "## Combinations that need attention",
        "",
        "### Deductive with Realism: Possible",
        "",
        reason,
        "",
        "**Evidence:** Interpretive judgement",
        "",
        `**What to justify:** ${justify}`,
        "",
        "## Potential weaknesses",
        "",
        "- Realism: Its concepts, such as underlying mechanisms, can be difficult to define and study.",
        "- Deductive: May miss unexpected findings outside the hypotheses.",
        "",
        "## What you should justify",
        "",
        "- Explain how your research question led to each of these choices.",
        `- ${justify}`,
        "",
        "## Further reading",
        "",
        "- Bryman, A. (2016). *Social research methods* (5th ed.). Oxford University Press.",
        "- Popper, K. R. (1959). *The logic of scientific discovery*. Hutchinson.",
        "- Saunders, M. N. K., Lewis, P., & Thornhill, A. (2019). *Research methods for business students* (8th ed.). Pearson.",
        "- Sayer, A. (2000). *Realism and social science*. SAGE. https://doi.org/10.4135/9781446218730",
        "",
        "---",
        "",
        SUMMARY_TEXT.footer,
        "",
      ].join("\n"),
    );
  });

  it("shows evidence and alternative views, with citations, for each combination that needs attention", () => {
    const markdown = toMarkdown(full);
    assert.ok(markdown.includes("### Grounded Theory with Positivism: Needs careful justification"));
    assert.ok(markdown.includes("**Evidence:** Strong textbook agreement (Bryman, 2016; Creswell & Creswell, 2018)"));
    assert.ok(markdown.includes("**Alternative view:** Some researchers note that Glaser and Strauss's original grounded theory"));
    assert.ok(markdown.includes("(Glaser & Strauss, 1967; Charmaz, 2014)"));
    assert.ok(markdown.includes("### Longitudinal with Grounded Theory: Possible"));
    assert.ok(!markdown.includes("### Interview with"), "strong fits are listed under why the combination works");
    assert.ok(
      markdown.includes(
        "- Grounded Theory usually develops theory inductively. This fits well with an inductive approach, which generally builds theory from patterns in data. (Strong textbook agreement)",
      ),
    );
  });

  it("writes an empty summary without judgements or reading", () => {
    const markdown = toMarkdown(empty);
    assert.equal((markdown.match(/Not chosen/g) ?? []).length, 6);
    for (const heading of ["Why this combination works", "Combinations that need attention", "Potential weaknesses", "Further reading"]) {
      assert.ok(!markdown.includes(heading), heading);
    }
  });
});

describe("every export", () => {
  const formats = { markdown: toMarkdown, text: toPlainText, html: toPrintHtml };

  for (const [name, format] of Object.entries(formats)) {
    it(`lists a reference for every work the ${name} export cites`, () => {
      const output = format(full);
      const plain = name === "markdown" ? output.replaceAll("*", "") : name === "html" ? output.replace(/<[^>]+>/g, "") : output;
      for (const reference of REFERENCES) {
        if (plain.includes(`${reference.cite})`) || plain.includes(`${reference.cite};`)) {
          const entry = referenceText(reference).replace(/ https:\/\/doi\.org\/\S+$/, "");
          assert.ok(plain.includes(name === "html" ? escapeHtml(entry) : entry), `${reference.cite} has no entry`);
        }
      }
    });

    it(`says the same thing in the ${name} export for every sentence of the summary`, () => {
      const output = format(full);
      for (const sentence of [...full.whyItWorks, ...full.weaknesses, ...full.toJustify]) {
        assert.ok(output.includes(name === "html" ? escapeHtml(sentence) : sentence), sentence.slice(0, 40));
      }
    });
  }
});

describe("toPlainText", () => {
  const text = toPlainText(small);

  it("uses underlined headings and no markup", () => {
    assert.ok(text.startsWith("RESEARCH ONION SUMMARY\n======================\n"));
    assert.ok(text.includes("Your choices\n------------\n"));
    assert.ok(!/[*#<>]/.test(text));
  });

  it("indents the details of each combination", () => {
    assert.ok(text.includes(`Deductive with Realism: Possible\n  ${reason}\n  Evidence: Interpretive judgement\n  What to justify: ${justify}\n`));
  });

  it("writes references in plain text with DOI links", () => {
    assert.ok(text.includes("- Sayer, A. (2000). Realism and social science. SAGE. https://doi.org/10.4135/9781446218730\n"));
  });
});

describe("toPrintHtml", () => {
  const html = toPrintHtml(full);

  it("is a complete, self-contained English document with one main heading", () => {
    assert.ok(html.startsWith("<!doctype html>\n<html lang=\"en\">"));
    assert.ok(html.includes('<meta charset="utf-8">'));
    assert.ok(html.includes("<title>Research Onion Summary</title>"));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.ok(!/<script|<link|src=/.test(html), "no scripts or external resources");
    assert.ok(html.includes("@media print"));
  });

  it("keeps a heading hierarchy without skipped levels", () => {
    const levels = [...html.matchAll(/<h([1-6])>/g)].map((match) => Number(match[1]));
    for (let index = 1; index < levels.length; index++) assert.ok(levels[index] <= levels[index - 1] + 1);
  });

  it("escapes text and italicises reference titles", () => {
    assert.ok(html.includes("doesn&#39;t choose a methodology"));
    assert.ok(html.includes("Glaser and Strauss&#39;s original grounded theory"));
    assert.ok(html.includes("<i>Constructing grounded theory</i> (2nd ed.). SAGE."));
    assert.ok(!html.includes("*"));
  });

  it("links DOIs", () => {
    assert.ok(
      toPrintHtml(small).includes(
        '<i>Realism and social science</i>. SAGE. <a href="https://doi.org/10.4135/9781446218730">https://doi.org/10.4135/9781446218730</a>',
      ),
    );
  });
});

describe("escapeHtml", () => {
  it("escapes every character with meaning in HTML", () => {
    assert.equal(escapeHtml(`<a href="x">Tom & Jerry's</a>`), "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;");
    assert.equal(escapeHtml("plain"), "plain");
  });
});
