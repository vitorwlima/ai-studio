import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  // todo: get from user
  apiKey:
    "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",
});

export const agent = new Agent(components.agent, {
  name: "Chat agent",
  // todo: get from selected model
  languageModel: openrouter.chat("moonshotai/kimi-k2.5"),
  instructions: "",
  maxSteps: 1,
});
