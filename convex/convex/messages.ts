import {
  createThread,
  saveMessage,
  updateThreadMetadata,
} from "@convex-dev/agent";
import {
  internalAction,
  internalMutation,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { buildUserAgent } from "./lib/agent";
import { generateText } from "ai";
import { aiStudioOpenRouter, createUserOpenRouter } from "./lib/openrouter";
import { decrypt } from "./lib/crypto";
import {
  reasoningEffortDetails,
  reasoningEffortValidator,
} from "./lib/reasoning";

export const sendMessage = mutation({
  args: {
    prompt: v.string(),
    threadId: v.optional(v.string()),
    modelCode: v.string(),
    reasoningEffort: reasoningEffortValidator,
  },
  handler: async (ctx, { prompt, modelCode, reasoningEffort, ...args }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;
    const isNewThread = !args.threadId;
    const threadId = isNewThread
      ? await createThread(ctx, components.agent, { userId })
      : args.threadId!;

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      userId,
      prompt,
      metadata: {
        model: modelCode,
        provider: "openrouter",
        reasoningDetails: reasoningEffortDetails(reasoningEffort),
      },
    });

    await ctx.scheduler.runAfter(0, internal.messages.generateResponse, {
      threadId,
      userId,
      promptMessageId: messageId,
      modelCode,
      reasoningEffort,
    });

    const existingMeta = await ctx.db
      .query("threadMetadata")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .unique();

    if (existingMeta) {
      await ctx.db.patch(existingMeta._id, {
        updatedAt: Date.now(),
        lastModelCode: modelCode,
        lastReasoningEffort: reasoningEffort,
      });
    } else {
      await ctx.db.insert("threadMetadata", {
        threadId,
        updatedAt: Date.now(),
        lastModelCode: modelCode,
        lastReasoningEffort: reasoningEffort,
      });
    }

    if (isNewThread) {
      await ctx.scheduler.runAfter(0, internal.messages.generateTitle, {
        threadId,
        prompt,
      });
    }

    return { threadId };
  },
});

export const generateResponse = internalAction({
  args: {
    threadId: v.string(),
    userId: v.string(),
    promptMessageId: v.string(),
    modelCode: v.string(),
    reasoningEffort: reasoningEffortValidator,
  },
  handler: async (
    ctx,
    { threadId, userId, promptMessageId, modelCode, reasoningEffort }
  ) => {
    const settings = await ctx.runQuery(internal.settings.getUserSettings, {
      userId,
    });
    if (!settings?.encryptedOpenRouterKey) {
      throw new Error("No user OpenRouter key configured.");
    }

    const userOpenRouterKey = await decrypt(settings.encryptedOpenRouterKey);

    const reasoning =
      reasoningEffort === "off"
        ? { enabled: false, effort: "low" as const }
        : { enabled: true, effort: reasoningEffort };

    const model = createUserOpenRouter(userOpenRouterKey).chat(modelCode, {
      reasoning,
    });

    const agent = buildUserAgent(model);

    const result = await agent.streamText(
      ctx,
      { threadId, userId },
      { promptMessageId },
      {
        saveStreamDeltas: true,
      }
    );

    await result.consumeStream();

    await ctx.runMutation(internal.messages.touchThread, {
      threadId,
      modelCode,
      reasoningEffort,
    });
  },
});

export const generateTitle = internalAction({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    const { text } = await generateText({
      model: aiStudioOpenRouter.chat(
        "google/gemini-2.5-flash-lite-preview-09-2025",
        {
          reasoning: { enabled: false, effort: "low" },
        }
      ),
      system:
        "Generate a short, concise title (max 6 words) for a chat conversation based on the user's first message. Reply with only the title, no quotes or punctuation.",
      prompt,
    });

    await updateThreadMetadata(ctx, components.agent, {
      threadId,
      patch: { title: text.trim() },
    });
  },
});

export const touchThread = internalMutation({
  args: {
    threadId: v.string(),
    modelCode: v.string(),
    reasoningEffort: reasoningEffortValidator,
  },
  handler: async (ctx, { threadId, modelCode, reasoningEffort }) => {
    const existing = await ctx.db
      .query("threadMetadata")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: Date.now(),
        lastModelCode: modelCode,
        lastReasoningEffort: reasoningEffort,
      });
    } else {
      await ctx.db.insert("threadMetadata", {
        threadId,
        updatedAt: Date.now(),
        lastModelCode: modelCode,
        lastReasoningEffort: reasoningEffort,
      });
    }
  },
});
