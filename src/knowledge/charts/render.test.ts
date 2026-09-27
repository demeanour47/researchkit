import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderChart } from "./render";
import { textWidth, type Scene, type SceneItem } from "./scene";
import { parseTable } from "./table";
import { CHART_TYPES, CHART_TYPE_INFO, DEFAULT_OPTIONS, FIGURE_SIZES, getChartType, type ChartOptions, type ChartType } from "./types";
import { CATEGORICAL, GRAYS } from "./palette";

const draw = (type: ChartType, options: Partial<ChartOptions> = {}, text = CHART_TYPE_INFO[type].example) => renderChart(parseTable(text).table, { ...DEFAULT_OPTIONS, title: `${CHART_TYPE_INFO[type].label} title`, ...options, type });
const scene = (...args: Parameters<typeof draw>): Scene => {
  const result = draw(...args);
  assert.ok(result.scene, JSON.stringify(result.issues));
  return result.scene;
};
const texts = (value: Scene) => value.items.filter((item): item is Extract<SceneItem, { type: "text" }> => item.type === "text").map((item) => item.text);
const numbers = (item: SceneItem): number[] => {
  switch (item.type) {
    case "rect":
      return [item.x, item.y, item.width, item.height];
    case "line":
      return [item.x1, item.y1, item.x2, item.y2];
    case "path":
      return item.commands.flatMap((command) => command.slice(1) as number[]);
    case "text":
      return [item.x, item.y, item.size];
  }
};
const fills = (value: Scene) => new Set(value.items.flatMap((item) => (item.type === "rect" || item.type === "path" ? [item.fill] : [])));

describe("renderChart: every chart type", () => {
  for (const type of CHART_TYPES) {
    const label = CHART_TYPE_INFO[type].label.toLowerCase();
    it(`draws the ${label} example with finite coordinates`, () => {
      const drawn = scene(type);
      assert.ok(drawn.items.length > 5);
      assert.ok(drawn.items.flatMap(numbers).every(Number.isFinite));
    });
    it(`keeps the ${label} inside the figure`, () => {
      const drawn = scene(type);
      for (const item of drawn.items) {
        if (item.type === "text") continue;
        for (const [index, value] of numbers(item).entries()) {
          if (item.type === "rect" && index >= 2) continue;
          assert.ok(value >= -1 && value <= Math.max(drawn.width, drawn.height) + 1, `${item.type} at ${value}`);
        }
      }
    });
    it(`titles the ${label} inside the figure in the standard style`, () => {
      assert.ok(texts(scene(type)).includes(`${CHART_TYPE_INFO[type].label} title`));
    });
    it(`leaves the ${label} title to the caption in APA style`, () => {
      assert.ok(!texts(scene(type, { style: "apa" })).includes(`${CHART_TYPE_INFO[type].label} title`));
    });
    it(`draws the ${label} in grayscale IEEE style with only grays`, () => {
      const drawn = scene(type, { style: "ieee", palette: "grayscale", fontSize: 9 });
      for (const fill of fills(drawn)) if (fill) assert.ok(!CATEGORICAL.includes(fill as never), `${fill} is a colour`);
      assert.match(drawn.fontFamily, /Times/);
    });
    it(`embeds a text alternative in the ${label}`, () => {
      const drawn = scene(type);
      assert.equal(drawn.title, `${CHART_TYPE_INFO[type].label} title`);
      assert.match(drawn.description, new RegExp(`^${CHART_TYPE_INFO[type].label}`));
    });
  }
});

describe("renderChart: options", () => {
  it("uses the chart type's name when there is no title", () => {
    assert.equal(scene("bar", { title: "" }).title, "Bar chart");
  });
  it("sizes the scene from the options", () => {
    const drawn = scene("bar", { width: 800, height: 500 });
    assert.deepEqual([drawn.width, drawn.height], [800, 500]);
  });
  it("draws the subtitle in the standard style", () => {
    assert.ok(texts(scene("bar", { subtitle: "Fictional data" })).includes("Fictional data"));
  });
  it("draws axis titles", () => {
    const labels = texts(scene("bar", { xTitle: "Faculty name", yTitle: "Students" }));
    assert.ok(labels.includes("Faculty name") && labels.includes("Students"));
  });
  it("rotates the y-axis title", () => {
    const drawn = scene("bar", { yTitle: "Students" });
    const title = drawn.items.find((item) => item.type === "text" && item.text === "Students");
    assert.equal(title?.type === "text" && title.rotate, -90);
  });
  it("labels bars with their values when asked", () => {
    const labels = texts(scene("bar", { dataLabels: true }));
    for (const value of ["24", "41", "36", "48", "15"]) assert.ok(labels.includes(value), value);
  });
  it("omits data labels by default, keeping labels selective", () => {
    assert.ok(!texts(scene("bar")).includes("41"));
  });
  it("labels bars as percentages when asked", () => {
    const labels = texts(scene("bar", { dataLabels: true, percentages: true }, "F,n\nA,1\nB,3"));
    assert.ok(labels.includes("25%") && labels.includes("75%"));
  });
  it("follows the data's decimals when label decimals are automatic", () => {
    const labels = texts(scene("mean-comparison", { dataLabels: true }));
    assert.ok(labels.includes("3.4"));
  });
  it("uses the chosen label decimals", () => {
    assert.ok(texts(scene("bar", { dataLabels: true, labelDecimals: 2 })).includes("41.00"));
  });
  it("uses the chosen axis decimals", () => {
    assert.ok(texts(scene("bar", { axisDecimals: 1 })).includes("10.0"));
  });
  it("sorts bars when asked", () => {
    const labels = texts(scene("bar", { sort: "descending" }, "F,n\nA,1\nB,3\nC,2"));
    const order = ["B", "C", "A"].map((name) => labels.indexOf(name));
    assert.deepEqual([...order].sort((a, b) => a - b), order);
  });
  it("draws gridlines only when asked", () => {
    const lines = (value: Scene) => value.items.filter((item) => item.type === "line" && item.stroke === "#e1e0d9").length;
    assert.ok(lines(scene("bar", { gridlines: true })) > lines(scene("bar", { gridlines: false })));
  });
  it("shows a legend automatically for two or more series", () => {
    assert.ok(texts(scene("grouped-bar")).includes("Female"));
  });
  it("hides the legend when asked", () => {
    assert.ok(!texts(scene("grouped-bar", { legend: "hide" })).includes("Female"));
  });
  it("shows a one-series legend when asked", () => {
    assert.ok(texts(scene("bar", { legend: "show" })).includes("Participants"));
  });
  it("scales text with the font size", () => {
    const largest = (value: Scene) => Math.max(...value.items.map((item) => (item.type === "text" ? item.size : 0)));
    assert.ok(largest(scene("bar", { fontSize: 16 })) > largest(scene("bar", { fontSize: 8 })));
  });
  it("rotates category labels when asked", () => {
    const drawn = scene("bar", { rotateLabels: 45 });
    const arts = drawn.items.find((item) => item.type === "text" && item.text === "Arts");
    assert.equal(arts?.type === "text" && arts.rotate, -45);
  });
  it("rotates crowded category labels by itself, with a note", () => {
    const text = ["Faculty,n", ...Array.from({ length: 12 }, (_, index) => `Faculty of subject ${index + 1},${index + 1}`)].join("\n");
    const drawn = scene("bar", {}, text);
    assert.ok(drawn.notes.some((note) => /rotated/i.test(note)));
  });
  it("uses the categorical palette in order", () => {
    const drawn = scene("grouped-bar");
    assert.ok(fills(drawn).has(CATEGORICAL[0]) && fills(drawn).has(CATEGORICAL[1]));
  });
  it("hatches grayscale series after the first", () => {
    const drawn = scene("grouped-bar", { palette: "grayscale" });
    assert.ok(fills(drawn).has(GRAYS[0]) && fills(drawn).has(GRAYS[1]));
    assert.ok(drawn.items.filter((item) => item.type === "line" && item.strokeWidth === 0.6).length > 10);
  });
  it("uses square bar ends in the publication styles", () => {
    const curved = (value: Scene) => value.items.some((item) => item.type === "path" && item.commands.some((command) => command[0] === "C"));
    assert.equal(curved(scene("bar", { style: "standard" })), true);
    assert.equal(curved(scene("bar", { style: "apa" })), false);
  });
});

describe("renderChart: chart-specific drawing", () => {
  it("draws a pie slice per part, labelled with its share", () => {
    const drawn = scene("pie", { dataLabels: false }, "P,n\nA,1\nB,3");
    assert.ok(texts(drawn).includes("A: 25%") && texts(drawn).includes("B: 75%"));
  });
  it("labels pie parts with values when data labels are on", () => {
    assert.ok(texts(scene("pie", { dataLabels: true }, "P,n\nA,1\nB,3")).includes("B: 3"));
  });
  it("labels the Pareto bars with their shares", () => {
    const labels = texts(scene("pareto", { dataLabels: true }, "C,n\nA,10\nB,30\nC,60"));
    assert.ok(labels.includes("60%") && labels.includes("30%") && labels.includes("10%"));
  });
  it("draws the Pareto chart on one percentage axis", () => {
    assert.ok(texts(scene("pareto")).includes("100%"));
  });
  it("labels the Likert centre with percentages either side", () => {
    const labels = texts(scene("likert"));
    assert.ok(labels.includes("0%"));
    assert.ok(labels.includes("Percentage of responses"));
  });
  it("keeps the Likert axis close to the data", () => {
    const labels = texts(scene("likert", {}, "Item,D,A\nx,30,40"));
    assert.ok(!labels.includes("100%"));
  });
  it("uses fewer Likert ticks in a narrow figure", () => {
    const ticks = (width: number) => texts(scene("likert", { width, height: 300 })).filter((label) => /%$/.test(label)).length;
    assert.ok(ticks(336) < ticks(600));
  });
  it("notes how the Likert neutral level is placed", () => {
    assert.ok(scene("likert").notes.some((note) => /neutral/i.test(note)));
  });
  it("labels both pyramid sides with positive numbers", () => {
    const labels = texts(scene("population-pyramid"));
    assert.ok(!labels.some((label) => label.startsWith("−")));
  });
  it("draws box plot outliers as separate marks", () => {
    const withOutlier = scene("box-plot", {}, "A\n10\n11\n12\n13\n14\n90");
    const without = scene("box-plot", {}, "A\n10\n11\n12\n13\n14\n15");
    assert.ok(withOutlier.items.length > without.items.length);
  });
  it("notes what the error bars show", () => {
    assert.ok(scene("mean-comparison").notes.some((note) => /^Error bars show/.test(note)));
  });
  it("draws error bars without bars in an error bar chart", () => {
    const labels = texts(scene("error-bar", { dataLabels: true }));
    assert.ok(labels.includes("62.4"));
  });
  it("labels only the last point of each line", () => {
    const labels = texts(scene("line", { dataLabels: true }, "Week,n\nW1,15\nW2,16\nW3,17"));
    assert.ok(labels.includes("17"));
    assert.ok(!labels.includes("15") && !labels.includes("16"));
  });
  it("shows every radar dimension", () => {
    const labels = texts(scene("radar"));
    for (const name of ["Writing", "Analysis", "Presenting", "Teamwork", "Research"]) assert.ok(labels.includes(name), name);
  });
  it("fills a single radar profile but not several", () => {
    const filled = (value: Scene) => value.items.filter((item) => item.type === "path" && item.fill !== null && item.fill !== "#ffffff" && item.commands.length === 6 && item.commands.filter((command) => command[0] === "L").length === 4).length;
    assert.ok(filled(scene("radar", {}, "Skill,A\nX,1\nY,2\nZ,3\nW,4\nV,5")) >= 1);
    assert.equal(filled(scene("radar")), 0);
  });
  it("sizes bubbles by area", () => {
    const drawn = scene("bubble", { dataLabels: false }, "x,y,s\n1,1,1\n2,2,4\n3,3,1\n4,4,1\n5,5,1");
    const radii = drawn.items.flatMap((item) => (item.type === "path" && item.stroke !== null && item.commands.length === 6 && item.commands[0][0] === "M" ? [Math.abs((item.commands[0][1] as number) - (item.commands[2][5] as number))] : []));
    const [small, large] = [Math.min(...radii), Math.max(...radii)];
    assert.ok(Math.abs(large / small - 2) < 0.05, `${large / small}`);
  });
});

describe("renderChart: problems", () => {
  it("returns no scene when the data can't be drawn", () => {
    const result = draw("scatter", {}, "Name\nA");
    assert.equal(result.scene, null);
    assert.equal(result.data, null);
    assert.ok(result.issues.some((issue) => issue.severity === "problem"));
  });
  it("returns warnings alongside a scene", () => {
    const result = draw("mean-comparison", {}, "G,M\nA,1\nB,2");
    assert.ok(result.scene);
    assert.ok(result.issues.some((issue) => issue.severity === "warning"));
  });
  it("returns no scene for empty data", () => {
    assert.equal(draw("bar", {}, "").scene, null);
  });
  it("draws negative bars below zero", () => {
    const labels = texts(scene("bar", {}, "F,n\nA,-10\nB,20"));
    assert.ok(labels.includes("−10"));
  });
  it("draws a chart with missing values", () => {
    assert.ok(draw("grouped-bar", {}, "F,a,b\nX,1,\nY,,2").scene);
  });
  it("draws category names containing markup safely as text", () => {
    assert.ok(texts(scene("bar", {}, "F,n\n<b>A</b>,1\nB,2")).includes("<b>A</b>"));
  });
});

describe("getChartType", () => {
  it("returns a type's information", () => {
    assert.equal(getChartType("pie").label, "Pie chart");
  });
  it("refuses unknown types", () => {
    assert.throws(() => getChartType("sankey" as never), /Unknown chart type: sankey/);
  });
});

describe("renderChart: figure sizes", () => {
  for (const size of FIGURE_SIZES)
    for (const type of CHART_TYPES)
      it(`draws the ${CHART_TYPE_INFO[type].label.toLowerCase()} at ${size.id} size within its bounds`, () => {
        const drawn = scene(type, { width: size.width, height: size.height, style: size.id === "column" ? "ieee" : "standard", fontSize: size.id === "column" ? 8 : 11 });
        assert.deepEqual([drawn.width, drawn.height], [size.width, size.height]);
        for (const item of drawn.items) {
          if (item.type === "text") {
            if (item.rotate !== 0) continue;
            const half = item.anchor === "middle" ? 0.5 : item.anchor === "end" ? 1 : 0;
            const width = textWidth(item.text, item.size, drawn.widthFactor);
            assert.ok(item.x - width * half >= -1 && item.x + width * (1 - half) <= drawn.width + 1, `“${item.text}” overflows at x ${item.x}`);
            assert.ok(item.y >= 0 && item.y <= drawn.height + 1, `“${item.text}” overflows at y ${item.y}`);
          }
        }
      });
});
