import { api } from "@convex/api";
import { useAction } from "convex/react";
import {
  LucideCheck,
  LucideLoader2,
  LucideTriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { SettingsLayout } from "./layout";

type Status =
  | { kind: "working" }
  | { kind: "done" }
  | { kind: "error"; message: string };

const initialStatus = (params: URLSearchParams): Status => {
  const oauthError = params.get("error");
  if (oauthError) {
    return {
      kind: "error",
      message: params.get("error_description") ?? oauthError,
    };
  }
  if (!params.get("code") || !params.get("state")) {
    return { kind: "error", message: "Missing authorization code" };
  }
  return { kind: "working" };
};

export const McpOAuthCallback = () => {
  const completeOAuth = useAction(api.mcp.completeOAuth);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>(() => initialStatus(params));
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const state = params.get("state");
    if (!code || !state) return; // initial status already reflects the error

    completeOAuth({ code, state })
      .then(() => {
        setStatus({ kind: "done" });
        setTimeout(() => navigate("/settings/mcp", { replace: true }), 1200);
      })
      .catch((err: unknown) => {
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "Authorization failed",
        });
      });
  }, [completeOAuth, navigate, params]);

  return (
    <SettingsLayout>
      <h1 className="text-xl font-semibold text-zinc-900">Connecting…</h1>
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        {status.kind === "working" && (
          <p className="flex items-center gap-2 text-sm text-zinc-600">
            <LucideLoader2 className="size-4 animate-spin" />
            Finishing authorization…
          </p>
        )}
        {status.kind === "done" && (
          <p className="flex items-center gap-2 text-sm text-emerald-600">
            <LucideCheck className="size-4" />
            Connected. Redirecting…
          </p>
        )}
        {status.kind === "error" && (
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm text-red-600">
              <LucideTriangleAlert className="size-4" />
              {status.message}
            </p>
            <button
              onClick={() => navigate("/settings/mcp", { replace: true })}
              className="self-start rounded-lg bg-zinc-900 px-4 py-1.5 text-sm text-white transition-colors hover:bg-zinc-800 cursor-pointer"
            >
              Back to MCP servers
            </button>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};
