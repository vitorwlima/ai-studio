import "./polyfills";
import { experimental_createMCPClient } from "@ai-sdk/mcp";
import type { ToolSet } from "ai";
import type { ActionCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { decrypt } from "./crypto";
import { createDbOAuthProvider, decodeStoredTokens } from "./mcpOAuth";

type McpClient = Awaited<ReturnType<typeof experimental_createMCPClient>>;
type McpServer = Doc<"mcpServers">;

/** Sanitize a server name into a safe tool-name prefix. */
function toolSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  return slug || "mcp";
}

function uniqueKey(base: string, taken: Record<string, unknown>): string {
  if (!(base in taken)) return base;
  let i = 2;
  while (`${base}_${i}` in taken) i++;
  return `${base}_${i}`;
}

/**
 * Build an MCP client for a single server. The OAuth path is non-interactive:
 * if the server needs (re)authorization it throws rather than redirecting,
 * since there's no user present during chat/testing.
 */
export async function buildMcpClient(
  ctx: ActionCtx,
  server: McpServer
): Promise<McpClient> {
  const base = { type: server.transport, url: server.url } as const;

  if (server.authType === "bearer") {
    const token = server.encryptedToken
      ? await decrypt(server.encryptedToken)
      : undefined;
    return experimental_createMCPClient({
      transport: {
        ...base,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    });
  }

  if (server.authType === "oauth") {
    const tokens = await decodeStoredTokens(server.oauthEncryptedTokens);
    if (!tokens) {
      throw new Error(`MCP server "${server.name}" is not authorized`);
    }
    const authProvider = createDbOAuthProvider({
      ctx,
      serverId: server._id,
      redirectUri: server.oauthRedirectUri ?? "",
      scope: server.oauthScope,
      initial: {
        clientInfo: server.oauthClientInfo,
        codeVerifier: server.oauthCodeVerifier,
        tokens,
      },
      onRedirect: () => {
        throw new Error(`MCP server "${server.name}" needs to be re-authorized`);
      },
    });
    return experimental_createMCPClient({
      transport: { ...base, authProvider },
    });
  }

  return experimental_createMCPClient({ transport: base });
}

/**
 * Connect to all of a user's enabled MCP servers and collect their tools,
 * namespaced by server so names from different servers don't collide.
 * Returns a `closeAll` that must be called after streaming completes.
 */
export async function loadMcpTools(
  ctx: ActionCtx,
  userId: string
): Promise<{ tools: ToolSet; closeAll: () => Promise<void> }> {
  const servers = await ctx.runQuery(internal.mcp.getEnabledServers, { userId });
  const clients: McpClient[] = [];
  const tools: ToolSet = {};

  for (const server of servers) {
    try {
      const client = await buildMcpClient(ctx, server);
      const serverTools = await client.tools();
      clients.push(client);
      const slug = toolSlug(server.name);
      for (const [name, tool] of Object.entries(serverTools)) {
        tools[uniqueKey(`${slug}_${name}`, tools)] = tool as ToolSet[string];
      }
    } catch (err) {
      console.error(`MCP server "${server.name}" failed to load:`, err);
    }
  }

  return {
    tools,
    closeAll: async () => {
      await Promise.all(clients.map((c) => c.close().catch(() => undefined)));
    },
  };
}
