import type {
  OAuthClientInformation,
  OAuthClientMetadata,
  OAuthClientProvider,
  OAuthTokens,
} from "@ai-sdk/mcp";
import type { ActionCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { decrypt, encrypt } from "./crypto";

const CLIENT_NAME = "AI Studio";

export type StoredOAuth = {
  scope?: string;
  redirectUri?: string;
  clientInfo?: string; // JSON-encoded OAuthClientInformation
  codeVerifier?: string;
  encryptedTokens?: string;
};

export async function decodeStoredTokens(
  encryptedTokens: string | undefined
): Promise<OAuthTokens | undefined> {
  if (!encryptedTokens) return undefined;
  try {
    return JSON.parse(await decrypt(encryptedTokens)) as OAuthTokens;
  } catch {
    return undefined;
  }
}

type ProviderOptions = {
  ctx: ActionCtx;
  serverId: Id<"mcpServers">;
  redirectUri: string;
  scope?: string;
  /** Loaded initial state from the DB row. */
  initial: {
    clientInfo?: string;
    codeVerifier?: string;
    tokens?: OAuthTokens;
  };
  /** Invoked when the SDK wants to send the user to the authorization URL. */
  onRedirect: (url: URL) => void;
  /** CSRF state value embedded in the authorization request. */
  stateValue?: string;
};

/**
 * An OAuthClientProvider whose persistence is backed by the mcpServers row.
 * Reads come from an in-memory snapshot that is kept in sync with each save so
 * the same `auth()` call sees its own writes; writes are persisted to Convex.
 */
export function createDbOAuthProvider(
  opts: ProviderOptions
): OAuthClientProvider {
  const mem: {
    clientInfo?: OAuthClientInformation;
    codeVerifier?: string;
    tokens?: OAuthTokens;
  } = {
    clientInfo: opts.initial.clientInfo
      ? (JSON.parse(opts.initial.clientInfo) as OAuthClientInformation)
      : undefined,
    codeVerifier: opts.initial.codeVerifier,
    tokens: opts.initial.tokens,
  };

  return {
    get redirectUrl() {
      return opts.redirectUri;
    },

    get clientMetadata(): OAuthClientMetadata {
      return {
        client_name: CLIENT_NAME,
        redirect_uris: [opts.redirectUri],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
        ...(opts.scope ? { scope: opts.scope } : {}),
      };
    },

    state() {
      return opts.stateValue ?? "";
    },

    clientInformation() {
      return mem.clientInfo;
    },

    async saveClientInformation(info) {
      mem.clientInfo = info;
      await opts.ctx.runMutation(internal.mcp.persistOAuthClientInfo, {
        serverId: opts.serverId,
        clientInfo: JSON.stringify(info),
      });
    },

    tokens() {
      return mem.tokens;
    },

    async saveTokens(tokens) {
      mem.tokens = tokens;
      await opts.ctx.runMutation(internal.mcp.persistOAuthTokens, {
        serverId: opts.serverId,
        encryptedTokens: await encrypt(JSON.stringify(tokens)),
      });
    },

    async saveCodeVerifier(codeVerifier) {
      mem.codeVerifier = codeVerifier;
      await opts.ctx.runMutation(internal.mcp.persistOAuthCodeVerifier, {
        serverId: opts.serverId,
        codeVerifier,
      });
    },

    codeVerifier() {
      if (!mem.codeVerifier) {
        throw new Error("No PKCE code verifier saved for this MCP server");
      }
      return mem.codeVerifier;
    },

    redirectToAuthorization(authorizationUrl) {
      opts.onRedirect(authorizationUrl);
    },
  };
}
