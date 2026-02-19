import { v } from "convex/values";

export const REASONING_EFFORT_SIGNATURE = "ai-studio.reasoning-effort";

export const reasoningEffortValidator = v.union(
  v.literal("off"),
  v.literal("low"),
  v.literal("medium"),
  v.literal("high")
);

export type ReasoningEffort = "off" | "low" | "medium" | "high";

export const reasoningEffortDetails = (
  reasoningEffort: ReasoningEffort
): Array<{ signature: string; text: string; type: "text" }> => [
  {
    signature: REASONING_EFFORT_SIGNATURE,
    text: reasoningEffort,
    type: "text",
  },
];

const isReasoningEffort = (value: string): value is ReasoningEffort =>
  value === "off" ||
  value === "low" ||
  value === "medium" ||
  value === "high";

export const parseReasoningEffortFromDetails = (
  reasoningDetails:
    | Array<{ signature?: string; text?: string; type: string }>
    | undefined
): ReasoningEffort | null => {
  if (!reasoningDetails) return null;

  const effortDetail = reasoningDetails.find(
    (detail) =>
      detail.type === "text" &&
      detail.signature === REASONING_EFFORT_SIGNATURE &&
      typeof detail.text === "string" &&
      isReasoningEffort(detail.text)
  );

  const effort = effortDetail?.text;
  if (typeof effort !== "string" || !isReasoningEffort(effort)) {
    return null;
  }

  return effort;
};
