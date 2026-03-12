import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import { type LanguageModel } from "ai";
import { webSearch } from "./tools";

export const buildUserAgent = (languageModel: LanguageModel) =>
  new Agent(components.agent, {
    name: "Chat agent",
    languageModel,
    instructions: "",
    maxSteps: 3,
    tools: { webSearch },
  });
