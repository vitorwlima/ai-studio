import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import { userOpenRouter } from "./openrouter";

export const agent = new Agent(components.agent, {
  name: "Chat agent",
  // todo: get from selected model
  languageModel: userOpenRouter.chat("moonshotai/kimi-k2.5"),
  instructions: "",
  maxSteps: 1,
});
