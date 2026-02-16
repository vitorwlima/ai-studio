import { v } from "convex/values";
import { query } from "./_generated/server";
import { components } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { listUIMessages, syncStreams, vStreamArgs } from "@convex-dev/agent";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    return await ctx.runQuery(components.agent.threads.listThreadsByUserId, {
      userId: identity.subject,
      order: "desc",
    });
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

    const listMessages = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(
      ctx,
      components.agent,
      args
    );

    return {
      ...listMessages,
      streams,
    };
  },
});
