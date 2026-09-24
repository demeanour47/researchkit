"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../primitives/button";
import { Icon } from "../primitives/icon";
import { VisuallyHidden } from "../primitives/visually-hidden";
import { copyText } from "./clipboard";

export type CopyResult = "copied" | "failed";

export interface CopyButtonProps {
  /** Plain text to copy. */
  text: string;
  /** What is copied, completing the accessible name: "Copy" + " reference". */
  subject: string;
  /**
   * The id of the element showing the text. If copying fails, its contents are
   * selected so the reader can copy with the keyboard instead.
   */
  selectOnFailure?: string;
  onResult?: (result: CopyResult) => void;
  copyLabel?: string;
  copiedLabel?: string;
  /** How long "Copied" is shown before the label returns. */
  resetAfterMs?: number;
}

function selectContents(id: string) {
  const element = document.getElementById(id);
  const selection = window.getSelection();
  if (element && selection) selection.selectAllChildren(element);
}

/** Copies plain text, confirms it on the button for a moment, and reports the result. */
export function CopyButton({
  text,
  subject,
  selectOnFailure,
  onResult,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  resetAfterMs = 2000,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    const succeeded = await copyText(text);
    clearTimeout(timer.current);
    setCopied(succeeded);
    if (succeeded) {
      timer.current = setTimeout(() => setCopied(false), resetAfterMs);
    } else if (selectOnFailure) {
      selectContents(selectOnFailure);
    }
    onResult?.(succeeded ? "copied" : "failed");
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleClick} className="min-w-24">
      <Icon name={copied ? "check" : "copy"} />
      {copied ? copiedLabel : copyLabel}
      <VisuallyHidden> {subject}</VisuallyHidden>
    </Button>
  );
}
