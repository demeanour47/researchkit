import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chicagoDate, fullDate } from "./dates";
import { listAuthors, textAuthors, type NamedContributor } from "./names";
import { formatChicagoPages } from "./numbers";

// Expected values are written out by hand from the Chicago rules cited in each module.

describe("Chicago inclusive numbers", () => {
  const short = (range: string) => formatChicagoPages(range).text;

  it("uses all digits up to 100 and for multiples of 100", () => {
    for (const [typed, expected] of [["3-10", "3–10"], ["71-72", "71–72"], ["96-117", "96–117"], ["100-104", "100–104"], ["1100-1113", "1100–1113"]]) assert.equal(short(typed), expected, typed);
  });

  it("shows only the changed part for 101 through 109", () => {
    for (const [typed, expected] of [["101-108", "101–8"], ["808-833", "808–33"], ["1103-1104", "1103–4"]]) assert.equal(short(typed), expected, typed);
  });

  it("otherwise uses two digits, or more when needed", () => {
    for (const [typed, expected] of [["321-328", "321–28"], ["498-532", "498–532"], ["1087-1089", "1087–89"], ["1496-1500", "1496–500"], ["11564-11615", "11564–615"], ["12991-13001", "12991–3001"]]) {
      assert.equal(short(typed), expected, typed);
    }
  });

  it("matches the CMOS 18 sample citations", () => {
    assert.equal(short("117-118"), "117–18");
    assert.equal(short("471-485"), "471–85");
    assert.equal(short("1818-1859"), "1818–59");
    assert.equal(short("9-10"), "9–10");
  });

  it("keeps roman numerals, article IDs, commas and already-shortened ranges as typed", () => {
    assert.deepEqual(formatChicagoPages("xxv-xxviii"), { text: "xxv–xxviii", range: true, shortened: false });
    assert.deepEqual(formatChicagoPages("e0318239"), { text: "e0318239", range: false, shortened: false });
    assert.deepEqual(formatChicagoPages("12,991-13,001"), { text: "12,991–13,001", range: true, shortened: false });
    assert.deepEqual(formatChicagoPages("471-85"), { text: "471–85", range: true, shortened: false });
    assert.deepEqual(formatChicagoPages("24, 36"), { text: "24, 36", range: false, shortened: false });
  });
});

describe("Chicago author names", () => {
  const person = (family: string, given: string): NamedContributor => ({ kind: "person", family, given });
  const binder = person("Binder", "Amy J.");
  const kidder = person("Kidder", "Jeffrey L.");
  const many = ["Snyder:Carl D.", "Bedrossian:Manuel", "Barr:Casey", "Four:Author", "Five:Author", "Six:Author", "Seven:Author"].map((entry) => person(...(entry.split(":") as [string, string])));

  it("inverts only the first author and puts and before the last", () => {
    assert.equal(listAuthors([person("Yu", "Charles")]), "Yu, Charles");
    assert.equal(listAuthors([binder, kidder]), "Binder, Amy J., and Jeffrey L. Kidder");
    assert.equal(listAuthors(many.slice(0, 3)), "Snyder, Carl D., Manuel Bedrossian, and Casey Barr");
    assert.equal(listAuthors(many.slice(0, 6)), "Snyder, Carl D., Manuel Bedrossian, Casey Barr, Author Four, Author Five, and Author Six");
  });

  it("lists the first three and et al. for more than six authors", () => {
    assert.equal(listAuthors(many), "Snyder, Carl D., Manuel Bedrossian, Casey Barr, et al.");
  });

  it("names one or two authors in text, and the first with et al. from three", () => {
    assert.equal(textAuthors([binder]), "Binder");
    assert.equal(textAuthors([binder, kidder]), "Binder and Kidder");
    assert.equal(textAuthors(many.slice(0, 3)), "Snyder et al.");
    assert.equal(textAuthors([{ kind: "organization", name: "Yale University" }]), "Yale University");
  });
});

describe("Chicago dates", () => {
  it("writes months in full, month before day", () => {
    assert.deepEqual(chicagoDate({ year: 2023, month: 11, day: 15 }), { year: 2023, monthDay: "November 15" });
    assert.equal(fullDate(chicagoDate({ year: 2022, month: 3, day: 8 })), "March 8, 2022");
    assert.equal(fullDate(chicagoDate({ year: 2022, month: 3 })), "March 2022");
    assert.equal(fullDate(chicagoDate({ year: 2022 })), "2022");
  });

  it("keeps only valid parts and reports the rest", () => {
    assert.deepEqual(chicagoDate({}), { year: null, monthDay: null });
    assert.deepEqual(chicagoDate({ year: 2023, month: 2, day: 30 }), { year: 2023, monthDay: "February", problem: "invalid-date" });
    assert.deepEqual(chicagoDate({ year: 2023, day: 4 }), { year: 2023, monthDay: null, problem: "day-without-month" });
    assert.deepEqual(chicagoDate({ month: 4 }), { year: null, monthDay: null, problem: "invalid-date" });
  });
});
