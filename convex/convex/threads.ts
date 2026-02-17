import { v } from "convex/values";
import { query } from "./_generated/server";
import { components } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import {
  listMessages,
  syncStreams,
  toUIMessages,
  vStreamArgs,
} from "@convex-dev/agent";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const result = await ctx.runQuery(
      components.agent.threads.listThreadsByUserId,
      {
        userId: identity.subject,
        order: "desc",
      }
    );

    const threadsWithMeta = await Promise.all(
      result.page.map(async (thread) => {
        const meta = await ctx.db
          .query("threadMetadata")
          .withIndex("by_threadId", (q) => q.eq("threadId", thread._id))
          .unique();

        return {
          ...thread,
          updatedAt: meta?.updatedAt ?? thread._creationTime,
        };
      })
    );

    threadsWithMeta.sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      ...result,
      page: threadsWithMeta,
    };
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
        streams: undefined,
      };
    }

    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: args.threadId,
    });

    if (!thread || thread.userId !== identity.subject) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
        streams: undefined,
      };
    }

    const listedMessages = await listMessages(ctx, components.agent, args);
    const modelCodeByMessageId = new Map(
      listedMessages.page.map((message) => [message._id, message.model])
    );
    const uiMessages = toUIMessages(listedMessages.page).map((message) => ({
      ...message,
      modelCode: modelCodeByMessageId.get(message.id),
    }));
    const streams = await syncStreams(ctx, components.agent, args);

    return {
      ...listedMessages,
      page: uiMessages,
      streams,
    };
  },
});

export const getThreadLastModelCode = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId,
    });
    if (!thread || thread.userId !== identity.subject) {
      return null;
    }

    const meta = await ctx.db
      .query("threadMetadata")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .unique();

    return meta?.lastModelCode ?? null;
  },
});
