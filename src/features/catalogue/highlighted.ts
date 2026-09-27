import { TOOLS, type ToolEntry } from "@/domains/catalogue";

export type AvailableTool = Extract<ToolEntry, { status: "available" }>;

/** The available tools with these ids, in the order given. Unknown or unpublished ids are skipped. */
export function availableTools(ids: readonly string[]): AvailableTool[] {
  return ids.flatMap((id) => {
    const tool = TOOLS.find((entry) => entry.id === id);
    return tool?.status === "available" ? [tool] : [];
  });
}
