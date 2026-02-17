import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import { userOpenRouter } from "./openrouter";

export const agent = new Agent(components.agent, {
  name: "Chat agent",
  // todo: get from selected model
  languageModel: userOpenRouter.chat("openai/gpt-oss-120b", {
    reasoning: { effort: "low" },
  }),
  instructions: "",
  maxSteps: 1,
});
