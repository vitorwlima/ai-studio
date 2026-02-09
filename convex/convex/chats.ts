import { query } from "./_generated/server";
import { v } from "convex/values";

export const getChats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});
