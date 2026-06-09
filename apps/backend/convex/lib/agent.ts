import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import { type LanguageModel, type ToolSet } from "ai";
import { webSearch } from "./tools";

export const buildUserAgent = (
  languageModel: LanguageModel,
  mcpTools: ToolSet = {}
) =>
  new Agent(components.agent, {
    name: "Chat agent",
    languageModel,
    instructions: "",
    // MCP tools add extra round trips, so allow more steps than the
    // single-tool baseline.
    maxSteps: Object.keys(mcpTools).length > 0 ? 10 : 3,
    tools: { webSearch, ...mcpTools },
  });
