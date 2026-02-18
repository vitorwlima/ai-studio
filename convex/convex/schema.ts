import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  threadMetadata: defineTable({
    threadId: v.string(),
    updatedAt: v.number(),
    lastModelCode: v.optional(v.string()),
    lastReasoningEffort: v.optional(
      v.union(
        v.literal("off"),
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      )
    ),
  }).index("by_threadId", ["threadId"]),

  userSettings: defineTable({
    userId: v.string(),
    encryptedOpenRouterKey: v.string(),
    maskedKey: v.string(),
  }).index("by_userId", ["userId"]),

  userModels: defineTable({
    userId: v.string(),
    modelCode: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_modelCode", ["userId", "modelCode"]),
});

export default schema;
