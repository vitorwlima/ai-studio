import { v } from "convex/values";
import {
  action,
  internalMutation,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import { components, internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import {
  listMessages,
  syncStreams,
  toUIMessages,
  vStreamArgs,
} from "@convex-dev/agent";
import {
  parseReasoningEffortFromDetails,
  type ReasoningEffort,
} from "./lib/reasoning";

const requireOwnedThread = async (
  ctx: Pick<QueryCtx, "auth" | "runQuery">,
  threadId: string
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  const thread = await ctx.runQuery(components.agent.threads.getThread, {
    threadId,
  });
  if (!thread) {
    throw new Error("Thread not found.");
  }

  if (thread.userId !== identity.subject) {
    throw new Error("Forbidden");
  }

  return thread;
};

type StreamArgs =
  | { kind: "list"; startOrder?: number }
  | { kind: "deltas"; cursors: Array<{ streamId: string; cursor: number }> }
  | undefined;

const emptyStreamPayload = (streamArgs: StreamArgs) => {
  if (!streamArgs || streamArgs.kind === "list") {
    return { kind: "list" as const, messages: [] };
  }
  return { kind: "deltas" as const, deltas: [] };
};

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
        streams: emptyStreamPayload(args.streamArgs),
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
        streams: emptyStreamPayload(args.streamArgs),
      };
    }

    const listedMessages = await listMessages(ctx, components.agent, args);
    const modelCodeByMessageId = new Map(
      listedMessages.page.map((message) => [message._id, message.model])
    );
    const modelCodeByOrder = new Map<number, string>();
    const reasoningEffortByOrder = new Map<number, ReasoningEffort>();
    const reasoningEffortByMessageId = new Map<string, ReasoningEffort>();
    const errorByOrder = new Map<number, string>();
    let activeReasoningEffort: ReasoningEffort = "low";
    const orderedMessages = [...listedMessages.page].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.stepOrder - b.stepOrder;
    });

    for (const message of orderedMessages) {
      const messageReasoningEffort = parseReasoningEffortFromDetails(
        message.reasoningDetails
      );
      const messageRole = message.message?.role;

      if (message.model && !modelCodeByOrder.has(message.order)) {
        modelCodeByOrder.set(message.order, message.model);
      }

      if (messageRole === "user" && messageReasoningEffort) {
        activeReasoningEffort = messageReasoningEffort;
        reasoningEffortByOrder.set(message.order, messageReasoningEffort);
        continue;
      }

      if (messageRole === "assistant") {
        const resolvedReasoningEffort =
          messageReasoningEffort ??
          reasoningEffortByOrder.get(message.order) ??
          activeReasoningEffort;
        activeReasoningEffort = resolvedReasoningEffort;
        reasoningEffortByMessageId.set(message._id, resolvedReasoningEffort);

        if (message.status === "failed" && message.error) {
          errorByOrder.set(message.order, message.error);
        }
      }
    }

    const uiMessages = toUIMessages(listedMessages.page).map((message) => ({
      ...message,
      modelCode:
        modelCodeByMessageId.get(message.id) ?? modelCodeByOrder.get(message.order),
      reasoningEffort: reasoningEffortByMessageId.get(message.id),
      error: message.role === "assistant" ? errorByOrder.get(message.order) : undefined,
    }));
    const streams = await syncStreams(ctx, components.agent, args);

    return {
      ...listedMessages,
      page: uiMessages,
      streams: streams ?? emptyStreamPayload(args.streamArgs),
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

export const getThreadLastReasoningEffort = query({
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

    return meta?.lastReasoningEffort ?? null;
  },
});

export const renameThreadTitle = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, { threadId, title }) => {
    await requireOwnedThread(ctx, threadId);

    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      throw new Error("Title is required.");
    }

    await ctx.runMutation(components.agent.threads.updateThread, {
      threadId,
      patch: { title: normalizedTitle },
    });

    return {
      threadId,
      title: normalizedTitle,
    };
  },
});

export const deleteThreadMetadataInternal = internalMutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, { threadId }) => {
    const meta = await ctx.db
      .query("threadMetadata")
      .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
      .unique();

    if (meta) {
      await ctx.db.delete(meta._id);
    }
  },
});

export const deleteThread = action({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, { threadId }) => {
    await requireOwnedThread(ctx, threadId);

    await ctx.runAction(components.agent.threads.deleteAllForThreadIdSync, {
      threadId,
    });

    await ctx.runMutation(internal.threads.deleteThreadMetadataInternal, {
      threadId,
    });

    return { success: true as const };
  },
});
