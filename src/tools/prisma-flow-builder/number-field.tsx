"use client";

import { useState } from "react";
import { TextField } from "@/ui";

/** A typed count: blank is null, commas and spaces are ignored, and anything else that isn't a number is kept as NaN for the checks to explain. */
export function parseCount(text: string): number | null {
  const cleaned = text.replace(/[,\s]/g, "");
  if (!cleaned) return null;
  return /^-?\d+(\.\d+)?$/.test(cleaned) ? Number(cleaned) : Number.NaN;
}

const format = (value: number | null) => (value === null || Number.isNaN(value) ? "" : String(value));

export interface NumberFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  error?: string;
}

/** A count field that keeps what was typed, and follows the value when it is filled in from elsewhere, such as counted files. */
export function NumberField({ id, label, hint, value, onChange, placeholder, error }: NumberFieldProps) {
  const [text, setText] = useState(format(value));
  const [seen, setSeen] = useState(value);
  // Adjusting state when a prop changes: only a value set from elsewhere replaces the typed text.
  if (!Object.is(seen, value)) {
    setSeen(value);
    if (!Object.is(parseCount(text), value)) setText(format(value));
  }
  return (
    <TextField
      id={id}
      label={label}
      hint={hint}
      error={error}
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(parseCount(event.target.value));
      }}
    />
  );
}
