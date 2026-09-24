import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { copyText, type ClipboardWriter } from "./clipboard";

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
