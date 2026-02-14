import { query } from "./_generated/server";

export const getChats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});
