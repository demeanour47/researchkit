import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { copyRich, copyText, type ClipboardWriter, type RichClipboardWriter } from "./clipboard";

function recordingClipboard(): ClipboardWriter & { written: string[] } {
  const written: string[] = [];
  return { written, writeText: async (text) => void written.push(text) };
}

describe("copyText", () => {
  it("writes exactly the given text and reports success", async () => {
    const clipboard = recordingClipboard();
    const text = "LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. Nature, 521(7553), 436–444.";
    assert.equal(await copyText(text, clipboard), true);
    assert.deepEqual(clipboard.written, [text]);
  });

  it("reports failure when the browser refuses", async () => {
    const refusing: ClipboardWriter = { writeText: () => Promise.reject(new Error("NotAllowedError")) };
    assert.equal(await copyText("text", refusing), false);
  });

  it("reports failure when there is no Clipboard API", async () => {
    assert.equal(await copyText("text", undefined), false);
    assert.equal(await copyText("text", {} as ClipboardWriter), false);
  });
});

describe("copyRich", () => {
  const item = (data: Record<string, Blob>) => data as unknown as ClipboardItem;
  it("writes HTML with a plain-text alternative", async () => {
    const items: unknown[] = [];
    const clipboard: RichClipboardWriter = { writeText: async () => undefined, write: async (written) => void items.push(...written) };
    assert.equal(await copyRich("<table></table>", "plain", clipboard, item), true);
    const [data] = items as Record<string, Blob>[];
    assert.deepEqual(Object.keys(data), ["text/html", "text/plain"]);
    assert.equal(await data["text/html"].text(), "<table></table>");
    assert.equal(await data["text/plain"].text(), "plain");
  });
  it("falls back to plain text when rich copying is refused", async () => {
    const written: string[] = [];
    const clipboard: RichClipboardWriter = { writeText: async (text) => void written.push(text), write: () => Promise.reject(new Error("NotAllowedError")) };
    assert.equal(await copyRich("<b>x</b>", "x", clipboard, item), true);
    assert.deepEqual(written, ["x"]);
  });
  it("falls back to plain text when rich copying isn't available", async () => {
    const written: string[] = [];
    assert.equal(await copyRich("<b>x</b>", "x", { writeText: async (text) => void written.push(text) }, undefined), true);
    assert.deepEqual(written, ["x"]);
  });
  it("reports failure when nothing can be copied", async () => {
    assert.equal(await copyRich("<b>x</b>", "x", undefined, undefined), false);
  });
});
