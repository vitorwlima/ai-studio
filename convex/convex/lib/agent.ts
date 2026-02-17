import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import { aiStudioOpenRouter } from "./openrouter";

export const agent = new Agent(components.agent, {
  name: "Chat agent",
  languageModel: aiStudioOpenRouter.chat("openai/gpt-oss-120b", {
    reasoning: { effort: "low" },
  }),
  instructions: "",
  maxSteps: 1,
});
