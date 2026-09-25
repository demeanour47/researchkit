"use client";

import type { ReactNode } from "react";
import { RadioGroup, TextField, cx } from "@/ui";
import { questionLine, type Answer, type DocumentBlock, type PdfPage } from "@/knowledge/research";
import { steps } from "./copy";

type QuestionBlock = Extract<DocumentBlock, { kind: "question" }>;

const placeholderClass = (placeholder: boolean) => (placeholder ? "italic text-text-muted" : undefined);

/** Instructions and help for a question, read out after its label. */
function Guidance({ id, block }: { id: string; block: QuestionBlock }) {
  return (
    <span id={id} className="grid text-small text-text-muted">
      <span>{block.instruction}</span>
      {block.helpText && <span>{block.helpText}</span>}
    </span>
  );
}

/** One question as an online form would show it, with native controls. Nothing entered is kept. */
function FormQuestion({ block, prefix }: { block: QuestionBlock; prefix: string }) {
  const id = `${prefix}-${block.id}`;
  const guidanceId = `${id}-guidance`;
  const label = <span className={cx("font-medium", placeholderClass(block.placeholder))}>{questionLine(block)}</span>;
  const answer: Answer = block.answer;

  switch (answer.kind) {
    case "choices":
      if (!answer.multiple)
        return <RadioGroup name={id} legend={label} hint={<Guidance id={`${id}-g`} block={block} />} variant="inline" options={answer.options.map((option, index) => ({ value: String(index), label: <span className={placeholderClass(option.placeholder)}>{option.text}</span> }))} />;
      return (
        <fieldset className="grid gap-1" aria-describedby={guidanceId}>
          <legend className="mb-1">{label}</legend>
          <Guidance id={guidanceId} block={block} />
          <div className="flex flex-wrap gap-x-6">
            {answer.options.map((option, index) => (
              <label key={index} className="flex min-h-control cursor-pointer items-center gap-3 has-[:checked]:font-medium">
                <input type="checkbox" name={id} value={index} className="size-4 shrink-0 accent-action focus-ring" />
                <span className={placeholderClass(option.placeholder)}>{option.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "ranking":
      return (
        <fieldset className="grid gap-2" aria-describedby={guidanceId}>
          <legend className="mb-1">{label}</legend>
          <Guidance id={guidanceId} block={block} />
          {answer.options.map((option, index) => (
            <div key={index} className="grid max-w-md grid-cols-[5rem_1fr] items-center gap-3">
              <TextField id={`${id}-rank-${index}`} label={`Rank for ${option.text}`} hideLabel inputMode="numeric" autoComplete="off" />
              <span aria-hidden="true" className={placeholderClass(option.placeholder)}>
                {option.text}
              </span>
            </div>
          ))}
        </fieldset>
      );
    case "scale":
      if (!answer.rows) return <RadioGroup name={id} legend={label} hint={<Guidance id={`${id}-g`} block={block} />} variant="inline" options={answer.labels.map((text, index) => ({ value: String(index), label: text }))} />;
      return (
        <div className="grid gap-2">
          <p id={`${id}-label`}>{label}</p>
          <Guidance id={guidanceId} block={block} />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-small" aria-labelledby={`${id}-label`} aria-describedby={guidanceId}>
              <thead>
                <tr className="border-b border-border-control">
                  <th scope="col" className="px-2 py-2 text-start font-semibold">
                    Statement
                  </th>
                  {answer.labels.map((text) => (
                    <th key={text} scope="col" className="min-w-16 px-2 py-2 text-center font-semibold">
                      {text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {answer.rows.map((row) => (
                  <tr key={row.number} className="border-b border-border">
                    <th scope="row" className={cx("px-2 py-2 text-start font-normal", placeholderClass(row.text.placeholder))}>
                      {row.number}. {row.text.text}
                    </th>
                    {answer.labels.map((text, index) => (
                      <td key={text} className="px-2 py-2 text-center">
                        <input type="radio" name={`${id}-${row.number}`} value={index} aria-label={`${row.number}: ${text}`} className="size-4 accent-action focus-ring" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "differential":
      return (
        <RadioGroup
          name={id}
          legend={label}
          hint={
            <>
              <Guidance id={`${id}-g`} block={block} />
              <span className="block">{`From ${answer.left} (${answer.points[0]}) to ${answer.right} (${answer.points[answer.points.length - 1]}).`}</span>
            </>
          }
          variant="inline"
          options={answer.points.map((point) => ({ value: point, label: point }))}
        />
      );
    case "lines":
      return answer.count > 1 ? (
        <TextField id={id} label={label} hint={<Guidance id={`${id}-g`} block={block} />} multiline rows={answer.count + 1} autoComplete="off" />
      ) : (
        <TextField id={id} label={label} hint={<Guidance id={`${id}-g`} block={block} />} autoComplete="off" />
      );
    case "number":
      return <TextField id={id} label={label} hint={<Guidance id={`${id}-g`} block={block} />} inputMode="decimal" autoComplete="off" />;
    case "date":
    case "time":
      return <TextField id={id} label={label} hint={<Guidance id={`${id}-g`} block={block} />} type={answer.kind} autoComplete="off" />;
    case "file":
      return <TextField id={id} label={label} hint={<Guidance id={`${id}-g`} block={block} />} type="file" disabled />;
  }
}

/** The questionnaire as an online form. Headings sit below the page's own. */
export function FormPreview({ blocks, prefix }: { blocks: readonly DocumentBlock[]; prefix: string }) {
  return (
    <div className="grid gap-6">
      <p className="text-small text-text-muted">{steps.formNote}</p>
      {blocks.map((block, index) => {
        if (block.kind === "title") return <h3 key={index} className={cx("text-heading font-semibold", placeholderClass(block.placeholder))}>{block.text}</h3>;
        if (block.kind === "heading") return <h4 key={index} className="border-t border-border pt-6 text-subheading font-semibold">{block.text}</h4>;
        if (block.kind === "paragraph") return <p key={index} className={cx("whitespace-pre-line", placeholderClass(block.placeholder))}>{block.text}</p>;
        if (block.kind === "page-break") return null;
        return <FormQuestion key={block.id} block={block} prefix={prefix} />;
      })}
    </div>
  );
}

const BOX = "☐";

/** A question as printed: number, wording, guidance, and boxes or lines to fill in. */
function PaperQuestion({ block }: { block: QuestionBlock }) {
  const answer = block.answer;
  const body: ReactNode = (() => {
    switch (answer.kind) {
      case "lines":
        return Array.from({ length: answer.count }, (_, index) => <span key={index} aria-hidden="true" className="block h-6 border-b border-foreground/60" />);
      case "choices":
      case "ranking":
        return (
          <ul className="grid gap-1">
            {answer.options.map((option, index) => (
              <li key={index} className="flex gap-2">
                <span aria-hidden="true">{answer.kind === "ranking" ? "____" : answer.multiple ? BOX : "○"}</span>
                <span className={placeholderClass(option.placeholder)}>{option.text}</span>
              </li>
            ))}
          </ul>
        );
      case "scale":
      case "differential": {
        const labels = answer.kind === "scale" ? answer.labels : answer.points;
        const rows = answer.kind === "scale" ? (answer.rows ?? [{ number: "", text: { text: "", placeholder: false } }]) : [{ number: "", text: { text: `${answer.left} … ${answer.right}`, placeholder: false } }];
        const statements = answer.kind === "differential" || (answer.kind === "scale" && answer.rows !== null);
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-small">
              <thead>
                <tr className="border-b border-foreground/60">
                  {statements && (
                    <th scope="col" className="px-2 py-1 text-start font-semibold">
                      {answer.kind === "differential" ? "Ends" : "Statement"}
                    </th>
                  )}
                  {labels.map((text) => (
                    <th key={text} scope="col" className="px-2 py-1 text-center font-semibold">
                      {text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-b border-foreground/30">
                    {statements && (
                      <th scope="row" className={cx("px-2 py-1 text-start font-normal", placeholderClass(row.text.placeholder))}>
                        {row.number ? `${row.number}. ` : ""}
                        {row.text.text}
                      </th>
                    )}
                    {labels.map((text) => (
                      <td key={text} className="px-2 py-1 text-center" aria-label={`Box for ${text}`}>
                        <span aria-hidden="true">{BOX}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "number":
        return <p>Answer: __________</p>;
      case "date":
        return <p>Day: ____ Month: ____ Year: ______</p>;
      case "time":
        return <p>Hours: ____ Minutes: ____</p>;
      case "file":
        return <p className="italic">[File upload: online versions only]</p>;
    }
  })();
  return (
    <div className="grid gap-1">
      <p className={cx("font-semibold", placeholderClass(block.placeholder))}>{questionLine(block)}</p>
      <p className="text-small italic text-text-muted">{block.instruction}</p>
      {block.helpText && <p className="text-small">{block.helpText}</p>}
      <div className="ps-6">{body}</div>
    </div>
  );
}

function PaperBlock({ block }: { block: DocumentBlock }) {
  if (block.kind === "title") return <h3 className={cx("text-heading font-semibold", placeholderClass(block.placeholder))}>{block.text}</h3>;
  if (block.kind === "heading") return <h4 className="pt-2 text-subheading font-semibold">{block.text}</h4>;
  if (block.kind === "paragraph") return <p className={cx("whitespace-pre-line", placeholderClass(block.placeholder))}>{block.text}</p>;
  if (block.kind === "page-break") return null;
  return <PaperQuestion block={block} />;
}

/** A sheet of paper: A4 proportions on wide screens, labelled with its page number. */
function Sheet({ label, children, note }: { label: string; children: ReactNode; note?: string }) {
  return (
    <section aria-label={label} className="grid gap-2">
      <p className="text-small font-medium text-text-muted">{label}</p>
      <div className="grid content-start gap-4 rounded-panel border border-border-control bg-background p-6 shadow-sm sm:min-h-[36rem] sm:p-10">
        {children}
        {note && <p className="text-small text-text-muted">{note}</p>}
      </div>
    </section>
  );
}

/** The printed questionnaire, page by page, as laid out in the PDF. A block is shown on the page where it starts. */
export function PrintPreview({ blocks, pages }: { blocks: readonly DocumentBlock[]; pages: readonly PdfPage[] }) {
  const started = new Set<number>();
  return (
    <div className="grid gap-6">
      {pages.map((page, index) => {
        const starting = page.blocks.filter((block) => !started.has(block));
        starting.forEach((block) => started.add(block));
        const continues = pages[index + 1]?.blocks.some((block) => starting.includes(block));
        return (
          <Sheet key={index} label={steps.pageLabel(index + 1, pages.length)} note={continues ? steps.continues : undefined}>
            {starting.map((block) => (
              <PaperBlock key={block} block={blocks[block]} />
            ))}
          </Sheet>
        );
      })}
    </div>
  );
}

/** The Word document: its fixed page breaks only, since Word lays out the rest itself. */
export function WordPreview({ blocks }: { blocks: readonly DocumentBlock[] }) {
  const parts: DocumentBlock[][] = [[]];
  for (const block of blocks) {
    if (block.kind === "page-break") parts.push([]);
    else parts[parts.length - 1].push(block);
  }
  return (
    <div className="grid gap-6">
      <p className="text-small text-text-muted">{steps.wordNote}</p>
      {parts.map((part, index) => (
        <Sheet key={index} label={index === 0 ? "Word document: cover page" : `Word document: after page break ${index}`}>
          {part.map((block, at) => (
            <PaperBlock key={at} block={block} />
          ))}
        </Sheet>
      ))}
    </div>
  );
}
