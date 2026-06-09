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

  mcpServers: defineTable({
    userId: v.string(),
    name: v.string(),
    url: v.string(),
    transport: v.union(v.literal("http"), v.literal("sse")),
    authType: v.union(
      v.literal("none"),
      v.literal("bearer"),
      v.literal("oauth")
    ),
    enabled: v.boolean(),

    // bearer auth
    encryptedToken: v.optional(v.string()),
    maskedToken: v.optional(v.string()),

    // oauth state (persisted across the redirect flow + for refresh)
    oauthScope: v.optional(v.string()),
    oauthRedirectUri: v.optional(v.string()),
    oauthClientInfo: v.optional(v.string()), // JSON OAuthClientInformation
    oauthCodeVerifier: v.optional(v.string()),
    oauthEncryptedTokens: v.optional(v.string()),
    oauthState: v.optional(v.string()), // CSRF state, correlates the callback
    oauthConnected: v.optional(v.boolean()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_oauthState", ["oauthState"]),
});

export default schema;
