import { createThread, saveMessage } from "@convex-dev/agent";
import { internalAction, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { agent } from "./lib/agent";

export const sendMessage = mutation({
  args: { prompt: v.string(), threadId: v.optional(v.string()) },
  handler: async (ctx, { prompt, threadId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;
    const threadIdToUse =
      threadId ?? (await createThread(ctx, components.agent, { userId }));

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: threadIdToUse,
      userId,
      prompt,
    });

    await ctx.scheduler.runAfter(0, internal.messages.generateResponse, {
      threadId: threadIdToUse,
      userId,
      promptMessageId: messageId,
    });

    return { threadId: threadIdToUse };
  },
});

export const generateResponse = internalAction({
  args: {
    threadId: v.string(),
    userId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (ctx, { threadId, userId, promptMessageId }) => {
    const result = await agent.streamText(
      ctx,
      { threadId, userId },
      { promptMessageId },
      { saveStreamDeltas: true }
    );

    await result.consumeStream();
  },
});
