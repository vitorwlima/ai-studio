import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { encrypt, maskApiKey } from "./lib/crypto";

export const hasApiKey = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    return !!settings?.encryptedOpenRouterKey;
  },
});

export const getMaskedApiKey = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    return settings?.maskedKey ?? null;
  },
});

export const saveApiKey = action({
  args: { apiKey: v.string() },
  handler: async (ctx, { apiKey }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const encryptedOpenRouterKey = await encrypt(apiKey);
    const maskedKey = maskApiKey(apiKey);

    await ctx.runMutation(internal.settings.saveApiKeyInternal, {
      userId: identity.subject,
      encryptedOpenRouterKey,
      maskedKey,
    });
  },
});

export const saveApiKeyInternal = internalMutation({
  args: {
    userId: v.string(),
    encryptedOpenRouterKey: v.string(),
    maskedKey: v.string(),
  },
  handler: async (ctx, { userId, encryptedOpenRouterKey, maskedKey }) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { encryptedOpenRouterKey, maskedKey });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        encryptedOpenRouterKey,
        maskedKey,
      });
    }
  },
});

export const removeApiKey = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (settings) {
      await ctx.db.delete(settings._id);
    }
  },
});

export const getUserSettings = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
