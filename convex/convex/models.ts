import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listUserModels = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const models = await ctx.db
      .query("userModels")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    return models.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const saveUserModel = mutation({
  args: { modelCode: v.string() },
  handler: async (ctx, { modelCode }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const normalizedModelCode = modelCode.trim();
    if (!normalizedModelCode) {
      throw new Error("Model code is required.");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("userModels")
      .withIndex("by_userId_modelCode", (q) =>
        q.eq("userId", identity.subject).eq("modelCode", normalizedModelCode)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: now });
      return;
    }

    await ctx.db.insert("userModels", {
      userId: identity.subject,
      modelCode: normalizedModelCode,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteUserModel = mutation({
  args: { modelCode: v.string() },
  handler: async (ctx, { modelCode }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const normalizedModelCode = modelCode.trim();
    if (!normalizedModelCode) return;

    const existing = await ctx.db
      .query("userModels")
      .withIndex("by_userId_modelCode", (q) =>
        q.eq("userId", identity.subject).eq("modelCode", normalizedModelCode)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
