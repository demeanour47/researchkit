import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { CONTRAST_REQUIREMENTS, DARK, LIGHT, type ColorRole } from "./colors";
import { contrastRatio, luminance } from "./contrast";
import { ICONS, SEMANTIC_ICONS } from "./icons";
import { findOffScaleSpacing } from "./spacing";
import { THEME_SCRIPT, THEME_STORAGE_KEY, themeStyleSheet } from "./theme";
import { BREAKPOINTS } from "./tokens";

// Compiled to .test-dist/src/ui/design; the token style sheets are in the source tree.
const ROOT = path.resolve(__dirname, "../../../..");
const tokenCss = (file: string) => fs.readFileSync(path.join(ROOT, "src/ui/tokens", file), "utf8");
const TOKEN_FILES = fs.readdirSync(path.join(ROOT, "src/ui/tokens")).filter((file) => file.endsWith(".css"));

describe("contrast", () => {
  it("computes WCAG ratios for known pairs", () => {
    assert.equal(contrastRatio("#000000", "#ffffff"), 21);
    assert.equal(contrastRatio("#777777", "#777777"), 1);
    assert.ok(Math.abs(contrastRatio("#767676", "#ffffff") - 4.54) < 0.01);
    assert.equal(luminance("#ffffff"), 1);
    assert.throws(() => luminance("red"));
  });

  for (const [scheme, palette] of [["light", LIGHT], ["dark", DARK]] as const)
    for (const requirement of CONTRAST_REQUIREMENTS)
      it(`keeps ${requirement.foreground} at ${requirement.minimum}:1 or more in the ${scheme} scheme`, () => {
        for (const background of requirement.backgrounds) {
          const ratio = contrastRatio(palette[requirement.foreground], palette[background]);
          assert.ok(ratio >= requirement.minimum, `${requirement.foreground} on ${background}: ${ratio.toFixed(2)}`);
        }
      });
});

describe("palettes", () => {
  it("designs the dark scheme separately, rather than reusing light values", () => {
    const shared = (Object.keys(LIGHT) as ColorRole[]).filter((role) => LIGHT[role] === DARK[role]);
    assert.deepEqual(shared, ["paper", "on-paper"]);
  });
  it("orders surfaces by depth in both schemes: dark surfaces lighten as they come forward", () => {
    assert.ok(luminance(DARK.sunken) < luminance(DARK.canvas));
    assert.ok(luminance(DARK.canvas) < luminance(DARK.surface));
    assert.ok(luminance(DARK.surface) < luminance(DARK.raised));
    assert.ok(luminance(LIGHT.sunken) < luminance(LIGHT.canvas));
    assert.ok(luminance(LIGHT.canvas) < luminance(LIGHT.surface));
  });
  it("keeps every hex value well formed", () => {
    for (const value of [...Object.values(LIGHT), ...Object.values(DARK)]) assert.match(value, /^#[0-9a-f]{6}$/);
  });
});

describe("the Tailwind roles and the design tokens agree", () => {
  const sheet = themeStyleSheet();
  const defined = new Set([...sheet.matchAll(/(--rk-[a-z0-9-]+):/g)].map((match) => match[1]));

  it("defines every --rk property the style sheets read", () => {
    for (const file of TOKEN_FILES)
      for (const match of tokenCss(file).matchAll(/var\((--rk-[a-z0-9-]+)\)/g)) assert.ok(defined.has(match[1]), `${file} reads ${match[1]}, which theme.ts doesn't define`);
  });

  it("gives Tailwind a utility for every colour role", () => {
    const css = tokenCss("color.css");
    for (const role of Object.keys(LIGHT)) assert.ok(css.includes(`--color-${role}: var(--rk-color-${role});`), role);
  });

  it("repeats the breakpoints exactly", () => {
    const css = tokenCss("layout.css");
    for (const [name, value] of Object.entries(BREAKPOINTS)) assert.ok(css.includes(`--breakpoint-${name}: ${value};`), name);
  });

  it("writes no raw colours in the token style sheets", () => {
    for (const file of TOKEN_FILES) assert.doesNotMatch(tokenCss(file).replace(/\/\*[\s\S]*?\*\//g, ""), /#[0-9a-f]{3,8}\b|rgb\(/i, file);
  });

  it("stops every duration under reduced motion and in print", () => {
    const reduced = /@media \(prefers-reduced-motion:reduce\)\{:root\{([^}]*)\}\}/.exec(sheet);
    assert.ok(reduced);
    for (const name of ["instant", "quick", "moderate"]) assert.ok(reduced[1].includes(`--duration-${name}:0ms`));
    assert.match(sheet, /@media print\{:root\{--shadow-tint-soft:transparent/);
  });

  it("defines the keyframes behind every animation", () => {
    for (const match of sheet.matchAll(/--rk-animate-[a-z-]+:(rk-[a-z-]+) /g)) assert.ok(sheet.includes(`@keyframes ${match[1]}{`), match[1]);
  });
});

describe("theme script", () => {
  it("only ever applies a known theme", () => {
    assert.ok(THEME_SCRIPT.includes(JSON.stringify(THEME_STORAGE_KEY)));
    assert.match(THEME_SCRIPT, /t==="light"\|\|t==="dark"/);
    assert.match(THEME_SCRIPT, /try\{/);
  });
});

describe("icons", () => {
  it("has a drawing for every research concept", () => {
    for (const name of Object.values(SEMANTIC_ICONS)) assert.ok(ICONS[name].length > 0, name);
  });
  it("uses only plain SVG shapes", () => {
    for (const [name, nodes] of Object.entries(ICONS))
      for (const [tag] of nodes) assert.ok(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse"].includes(tag), `${name}: ${tag}`);
  });
});

describe("spacing scale", () => {
  it("reports off-scale spacing and accepts the scale", () => {
    assert.deepEqual(findOffScaleSpacing("p-4 gap-6 md:px-8 mt-5 lg:gap-7 p-gutter w-full"), ["mt-5", "lg:gap-7"]);
    assert.deepEqual(findOffScaleSpacing("py-0.5 px-2.5 -mt-1"), []);
  });
});
