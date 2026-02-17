import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  threadMetadata: defineTable({
    threadId: v.string(),
    updatedAt: v.number(),
  }).index("by_threadId", ["threadId"]),

  userSettings: defineTable({
    userId: v.string(),
    encryptedOpenRouterKey: v.string(),
    maskedKey: v.string(),
  }).index("by_userId", ["userId"]),
});

export default schema;
