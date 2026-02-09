import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  chats: defineTable({
    userId: v.string(),
    title: v.string(),
    generatedChatId: v.string(),
    model: v.string(),
    status: v.union(
      v.literal("streaming"),
      v.literal("done"),
      v.literal("error")
    ),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_generatedChatId", ["generatedChatId"]),
  messages: defineTable({
    content: v.string(),
    reasoning: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("assistant")),
    generatedChatId: v.string(),
    generatedMessageId: v.string(),
    model: v.string(),
  })
    .index("by_generatedChatId", ["generatedChatId"])
    .index("by_generatedMessageId", ["generatedMessageId"]),
});

export default schema;
