import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMlaDate, MLA_MONTHS } from "./dates";
import { parentheticalAuthors, proseAuthors, worksCitedAuthors, type NamedContributor } from "./names";
import { formatMlaPages } from "./numbers";

// Expected values are written out by hand from the MLA 9 rules cited in each module.

describe("MLA dates", () => {
  it("abbreviates months longer than four letters, and only those", () => {
    assert.deepEqual(MLA_MONTHS, ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."]);
  });

  it("writes day, month, year", () => {
    assert.deepEqual(formatMlaDate({ year: 2016, month: 3, day: 2 }), { text: "2 Mar. 2016" });
    assert.deepEqual(formatMlaDate({ year: 2004, month: 10 }), { text: "Oct. 2004" });
    assert.deepEqual(formatMlaDate({ year: 1959, month: 9 }), { text: "Sept. 1959" });
    assert.deepEqual(formatMlaDate({ year: 2021 }), { text: "2021" });
  });

  it("returns nothing for a missing date, never n.d.", () => {
    assert.deepEqual(formatMlaDate({}), { text: null });
    assert.deepEqual(formatMlaDate(undefined), { text: null });
  });

  it("keeps only the valid part of an impossible date and reports it", () => {
    assert.deepEqual(formatMlaDate({ year: 2023, month: 2, day: 29 }), { text: "Feb. 2023", problem: "invalid-date" });
    assert.deepEqual(formatMlaDate({ year: 2024, month: 2, day: 29 }), { text: "29 Feb. 2024" });
    assert.deepEqual(formatMlaDate({ year: 2020, month: 13 }), { text: "2020", problem: "invalid-date" });
    assert.deepEqual(formatMlaDate({ year: Number.NaN }), { text: null, problem: "invalid-date" });
    assert.deepEqual(formatMlaDate({ month: 3 }), { text: null, problem: "invalid-date" });
  });

  it("uses only the year when a day comes without a month", () => {
    assert.deepEqual(formatMlaDate({ year: 2020, day: 4 }), { text: "2020", problem: "day-without-month" });
  });
});

describe("MLA inclusive page ranges", () => {
  it("gives the second number in full up to 99", () => {
    assert.deepEqual(formatMlaPages("11-14"), { text: "11–14", range: true, shortened: false });
    assert.deepEqual(formatMlaPages("96-101"), { text: "96–101", range: true, shortened: false });
  });

  it("gives only the last two digits of larger numbers, unless more are needed", () => {
    assert.equal(formatMlaPages("103-104").text, "103–04");
    assert.equal(formatMlaPages("250-258").text, "250–58");
    assert.equal(formatMlaPages("436–444").text, "436–44");
    assert.equal(formatMlaPages("395-401").text, "395–401");
    assert.equal(formatMlaPages("1608-1774").text, "1608–774");
    assert.equal(formatMlaPages("1003-1005").text, "1003–05");
    assert.equal(formatMlaPages("250-258").shortened, true);
  });

  it("keeps anything that isn't two plain ascending numbers as typed, normalising only the dash", () => {
    assert.deepEqual(formatMlaPages("436-44"), { text: "436–44", range: true, shortened: false });
    assert.deepEqual(formatMlaPages("xii-xv"), { text: "xii–xv", range: true, shortened: false });
    assert.deepEqual(formatMlaPages("A1-A4"), { text: "A1–A4", range: true, shortened: false });
    assert.deepEqual(formatMlaPages("1,608-774"), { text: "1,608–774", range: true, shortened: false });
  });

  it("recognises a single page", () => {
    assert.deepEqual(formatMlaPages(" 49 "), { text: "49", range: false, shortened: false });
  });
});

describe("MLA author names", () => {
  const smith: NamedContributor = { kind: "person", family: "Smith", given: "Jane" };
  const jones: NamedContributor = { kind: "person", family: "Jones", given: "John" };
  const lee: NamedContributor = { kind: "person", family: "Lee", given: "Min-jun" };
  const who: NamedContributor = { kind: "organization", name: "World Health Organization" };
  const plato: NamedContributor = { kind: "person", family: "Plato", given: "" };

  it("inverts only the first author in the works-cited list", () => {
    assert.equal(worksCitedAuthors([smith]), "Smith, Jane");
    assert.equal(worksCitedAuthors([smith, jones]), "Smith, Jane, and John Jones");
    assert.equal(worksCitedAuthors([smith, jones, lee]), "Smith, Jane, et al.");
  });

  it("uses a comma before 'and' or et al. only after an inverted name", () => {
    assert.equal(worksCitedAuthors([who]), "World Health Organization");
    assert.equal(worksCitedAuthors([plato, smith, jones]), "Plato et al.");
    assert.equal(worksCitedAuthors([who, smith]), "World Health Organization and Jane Smith");
  });

  it("names surnames in parenthetical citations", () => {
    assert.equal(parentheticalAuthors([smith]), "Smith");
    assert.equal(parentheticalAuthors([smith, jones]), "Smith and Jones");
    assert.equal(parentheticalAuthors([smith, jones, lee]), "Smith et al.");
    assert.equal(parentheticalAuthors([who]), "World Health Organization");
  });

  it("gives full names at first mention in prose, and never et al.", () => {
    assert.deepEqual(proseAuthors([smith]), { first: "Jane Smith", later: "Smith" });
    assert.deepEqual(proseAuthors([smith, jones]), { first: "Jane Smith and John Jones", later: "Smith and Jones" });
    assert.deepEqual(proseAuthors([smith, jones, lee]), { first: "Jane Smith and others", later: "Smith and others" });
  });
});
