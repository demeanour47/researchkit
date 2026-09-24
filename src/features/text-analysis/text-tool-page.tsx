import { ToolPageLayout, type ToolPageLayoutProps } from "@/features/tool";
import { TextAnalysisInput, type TextAnalysisInputProps } from "./text-analysis-input";

export interface TextToolPageProps extends Omit<ToolPageLayoutProps, "children" | "noScript"> {
  noScript: string;
  input: TextAnalysisInputProps;
}

/** A text-analysis tool page: the shared tool layout around the live text input. */
export function TextToolPage({ input, ...layout }: TextToolPageProps) {
  return (
    <ToolPageLayout {...layout}>
      <TextAnalysisInput {...input} />
    </ToolPageLayout>
  );
}
