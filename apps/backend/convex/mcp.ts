import "./lib/polyfills";
import { auth } from "@ai-sdk/mcp";
import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { encrypt, maskApiKey } from "./lib/crypto";
import { buildMcpClient } from "./lib/mcp";
import { createDbOAuthProvider } from "./lib/mcpOAuth";

const transportValidator = v.union(v.literal("http"), v.literal("sse"));
const authTypeValidator = v.union(
  v.literal("none"),
  v.literal("bearer"),
  v.literal("oauth")
);

function requireHttpUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid server URL");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Server URL must be http(s)");
  }
}

// ---------------------------------------------------------------------------
// Public queries / mutations
// ---------------------------------------------------------------------------

export const listServers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const servers = await ctx.db
      .query("mcpServers")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    return servers
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((s) => ({
        _id: s._id,
        name: s.name,
        url: s.url,
        transport: s.transport,
        authType: s.authType,
        enabled: s.enabled,
        hasToken: !!s.encryptedToken,
        maskedToken: s.maskedToken ?? null,
        oauthConnected: !!s.oauthConnected,
        createdAt: s.createdAt,
      }));
  },
});

export const setEnabled = mutation({
  args: { serverId: v.id("mcpServers"), enabled: v.boolean() },
  handler: async (ctx, { serverId, enabled }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const server = await ctx.db.get(serverId);
    if (!server || server.userId !== identity.subject) {
      throw new Error("Not found");
    }
    await ctx.db.patch(serverId, { enabled, updatedAt: Date.now() });
  },
});

export const removeServer = mutation({
  args: { serverId: v.id("mcpServers") },
  handler: async (ctx, { serverId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const server = await ctx.db.get(serverId);
    if (!server || server.userId !== identity.subject) {
      throw new Error("Not found");
    }
    await ctx.db.delete(serverId);
  },
});

// ---------------------------------------------------------------------------
// Public actions (need crypto / network)
// ---------------------------------------------------------------------------

export const addServer = action({
  args: {
    name: v.string(),
    url: v.string(),
    transport: transportValidator,
    authType: authTypeValidator,
    token: v.optional(v.string()),
    oauthScope: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ serverId: Id<"mcpServers"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    requireHttpUrl(args.url);

    const token = args.authType === "bearer" ? args.token?.trim() : undefined;
    const encryptedToken = token ? await encrypt(token) : undefined;
    const maskedToken = token ? maskApiKey(token) : undefined;

    const serverId: Id<"mcpServers"> = await ctx.runMutation(
      internal.mcp.insertServer,
      {
        userId: identity.subject,
        name: args.name.trim(),
        url: args.url.trim(),
        transport: args.transport,
        authType: args.authType,
        encryptedToken,
        maskedToken,
        oauthScope: args.oauthScope?.trim() || undefined,
      }
    );
    return { serverId };
  },
});

export const updateServer = action({
  args: {
    serverId: v.id("mcpServers"),
    name: v.string(),
    url: v.string(),
    transport: transportValidator,
    authType: authTypeValidator,
    token: v.optional(v.string()), // only set when changing the bearer token
    oauthScope: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    requireHttpUrl(args.url);

    const server = await ctx.runQuery(internal.mcp.getServerForUser, {
      serverId: args.serverId,
      userId: identity.subject,
    });
    if (!server) throw new Error("Not found");

    const token = args.authType === "bearer" ? args.token?.trim() : undefined;
    const authTypeChanged = server.authType !== args.authType;

    await ctx.runMutation(internal.mcp.applyServerUpdate, {
      serverId: args.serverId,
      name: args.name.trim(),
      url: args.url.trim(),
      transport: args.transport,
      authType: args.authType,
      // re-encrypt only when a new token is supplied
      encryptedToken: token ? await encrypt(token) : undefined,
      maskedToken: token ? maskApiKey(token) : undefined,
      oauthScope: args.oauthScope?.trim() || undefined,
      // dropping oauth resets any stored connection
      clearOAuth: authTypeChanged && server.authType === "oauth",
    });
  },
});

export const testConnection = action({
  args: { serverId: v.id("mcpServers") },
  handler: async (
    ctx,
    { serverId }
  ): Promise<
    { ok: true; toolCount: number } | { ok: false; error: string }
  > => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const server = await ctx.runQuery(internal.mcp.getServerForUser, {
      serverId,
      userId: identity.subject,
    });
    if (!server) throw new Error("Not found");

    try {
      const client = await buildMcpClient(ctx, server);
      try {
        const tools = await client.tools();
        return { ok: true, toolCount: Object.keys(tools).length };
      } finally {
        await client.close().catch(() => undefined);
      }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
});

export const startOAuth = action({
  args: { serverId: v.id("mcpServers"), redirectUri: v.string() },
  handler: async (
    ctx,
    { serverId, redirectUri }
  ): Promise<{ authorizationUrl: string | null; connected: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const server = await ctx.runQuery(internal.mcp.getServerForUser, {
      serverId,
      userId: identity.subject,
    });
    if (!server) throw new Error("Not found");
    if (server.authType !== "oauth") {
      throw new Error("Server is not configured for OAuth");
    }

    const state = crypto.randomUUID();
    await ctx.runMutation(internal.mcp.setOAuthPending, {
      serverId,
      redirectUri,
      state,
    });

    let authorizationUrl: string | null = null;
    const provider = createDbOAuthProvider({
      ctx,
      serverId,
      redirectUri,
      scope: server.oauthScope,
      // start a fresh authorization (reuse client registration if present)
      initial: { clientInfo: server.oauthClientInfo },
      stateValue: state,
      onRedirect: (url) => {
        authorizationUrl = url.toString();
      },
    });

    const result = await auth(provider, {
      serverUrl: server.url,
      ...(server.oauthScope ? { scope: server.oauthScope } : {}),
    });

    if (result === "AUTHORIZED") {
      await ctx.runMutation(internal.mcp.markOAuthConnected, { serverId });
      return { authorizationUrl: null, connected: true };
    }

    return { authorizationUrl, connected: false };
  },
});

export const completeOAuth = action({
  args: { state: v.string(), code: v.string() },
  handler: async (ctx, { state, code }): Promise<{ ok: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const server = await ctx.runQuery(internal.mcp.getServerByState, { state });
    if (!server || server.userId !== identity.subject) {
      throw new Error("Invalid or expired authorization state");
    }

    const provider = createDbOAuthProvider({
      ctx,
      serverId: server._id,
      redirectUri: server.oauthRedirectUri ?? "",
      scope: server.oauthScope,
      initial: {
        clientInfo: server.oauthClientInfo,
        codeVerifier: server.oauthCodeVerifier,
      },
      stateValue: state,
      onRedirect: () => {
        throw new Error("Unexpected redirect during token exchange");
      },
    });

    const result = await auth(provider, {
      serverUrl: server.url,
      authorizationCode: code,
      ...(server.oauthScope ? { scope: server.oauthScope } : {}),
    });

    if (result !== "AUTHORIZED") {
      throw new Error("Authorization did not complete");
    }

    await ctx.runMutation(internal.mcp.markOAuthConnected, {
      serverId: server._id,
    });
    return { ok: true };
  },
});

// ---------------------------------------------------------------------------
// Internal queries / mutations
// ---------------------------------------------------------------------------

export const getEnabledServers = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("mcpServers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("enabled"), true))
      .collect();
  },
});

export const getServerForUser = internalQuery({
  args: { serverId: v.id("mcpServers"), userId: v.string() },
  handler: async (ctx, { serverId, userId }) => {
    const server = await ctx.db.get(serverId);
    if (!server || server.userId !== userId) return null;
    return server;
  },
});

export const getServerByState = internalQuery({
  args: { state: v.string() },
  handler: async (ctx, { state }) => {
    return await ctx.db
      .query("mcpServers")
      .withIndex("by_oauthState", (q) => q.eq("oauthState", state))
      .unique();
  },
});

export const insertServer = internalMutation({
  args: {
    userId: v.string(),
    name: v.string(),
    url: v.string(),
    transport: transportValidator,
    authType: authTypeValidator,
    encryptedToken: v.optional(v.string()),
    maskedToken: v.optional(v.string()),
    oauthScope: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("mcpServers", {
      ...args,
      enabled: true,
      oauthConnected: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const applyServerUpdate = internalMutation({
  args: {
    serverId: v.id("mcpServers"),
    name: v.string(),
    url: v.string(),
    transport: transportValidator,
    authType: authTypeValidator,
    encryptedToken: v.optional(v.string()),
    maskedToken: v.optional(v.string()),
    oauthScope: v.optional(v.string()),
    clearOAuth: v.boolean(),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      name: args.name,
      url: args.url,
      transport: args.transport,
      authType: args.authType,
      oauthScope: args.oauthScope,
      updatedAt: Date.now(),
    };
    if (args.encryptedToken) {
      patch.encryptedToken = args.encryptedToken;
      patch.maskedToken = args.maskedToken;
    }
    if (args.authType !== "bearer") {
      patch.encryptedToken = undefined;
      patch.maskedToken = undefined;
    }
    if (args.clearOAuth) {
      patch.oauthConnected = false;
      patch.oauthClientInfo = undefined;
      patch.oauthCodeVerifier = undefined;
      patch.oauthEncryptedTokens = undefined;
      patch.oauthState = undefined;
    }
    await ctx.db.patch(args.serverId, patch);
  },
});

export const setOAuthPending = internalMutation({
  args: {
    serverId: v.id("mcpServers"),
    redirectUri: v.string(),
    state: v.string(),
  },
  handler: async (ctx, { serverId, redirectUri, state }) => {
    await ctx.db.patch(serverId, {
      oauthRedirectUri: redirectUri,
      oauthState: state,
      oauthCodeVerifier: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const markOAuthConnected = internalMutation({
  args: { serverId: v.id("mcpServers") },
  handler: async (ctx, { serverId }) => {
    await ctx.db.patch(serverId, {
      oauthConnected: true,
      oauthState: undefined,
      oauthCodeVerifier: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const persistOAuthClientInfo = internalMutation({
  args: { serverId: v.id("mcpServers"), clientInfo: v.string() },
  handler: async (ctx, { serverId, clientInfo }) => {
    await ctx.db.patch(serverId, {
      oauthClientInfo: clientInfo,
      updatedAt: Date.now(),
    });
  },
});

export const persistOAuthCodeVerifier = internalMutation({
  args: { serverId: v.id("mcpServers"), codeVerifier: v.string() },
  handler: async (ctx, { serverId, codeVerifier }) => {
    await ctx.db.patch(serverId, {
      oauthCodeVerifier: codeVerifier,
      updatedAt: Date.now(),
    });
  },
});

export const persistOAuthTokens = internalMutation({
  args: { serverId: v.id("mcpServers"), encryptedTokens: v.string() },
  handler: async (ctx, { serverId, encryptedTokens }) => {
    await ctx.db.patch(serverId, {
      oauthEncryptedTokens: encryptedTokens,
      updatedAt: Date.now(),
    });
  },
});
