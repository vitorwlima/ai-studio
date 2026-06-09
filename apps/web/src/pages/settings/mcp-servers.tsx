import { api } from "@convex/api";
import type { Id } from "@convex/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  LucideCheck,
  LucideLink,
  LucideLoader2,
  LucidePencil,
  LucidePlug,
  LucidePlus,
  LucideTrash2,
  LucideTriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { cn } from "src/lib/utils";
import { SettingsLayout } from "./layout";

type AuthType = "none" | "bearer" | "oauth";
type Transport = "http" | "sse";

type ServerListItem = {
  _id: Id<"mcpServers">;
  name: string;
  url: string;
  transport: Transport;
  authType: AuthType;
  enabled: boolean;
  hasToken: boolean;
  maskedToken: string | null;
  oauthConnected: boolean;
};

type FormState = {
  name: string;
  url: string;
  transport: Transport;
  authType: AuthType;
  token: string;
  oauthScope: string;
};

const emptyForm: FormState = {
  name: "",
  url: "",
  transport: "http",
  authType: "none",
  token: "",
  oauthScope: "",
};

const oauthRedirectUri = () => `${window.location.origin}/settings/mcp/callback`;

export const McpServersSettings = () => {
  const servers = useQuery(api.mcp.listServers) as ServerListItem[] | undefined;
  const [showAdd, setShowAdd] = useState(false);

  return (
    <SettingsLayout>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">MCP Servers</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Connect remote Model Context Protocol servers to give the chat extra
            tools. Enabled servers are available in every conversation.
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-800 cursor-pointer"
          >
            <LucidePlus className="size-4" />
            Add server
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mt-6">
          <ServerForm
            onDone={() => setShowAdd(false)}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {servers === undefined ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <LucideLoader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : servers.length === 0 && !showAdd ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white/50 px-5 py-10 text-center">
            <LucidePlug className="mx-auto size-6 text-zinc-400" />
            <p className="mt-2 text-sm text-zinc-500">
              No MCP servers yet. Add one to extend the chat with custom tools.
            </p>
          </div>
        ) : (
          servers.map((server) => (
            <ServerCard key={server._id} server={server} />
          ))
        )}
      </div>
    </SettingsLayout>
  );
};

const ServerForm = ({
  initial,
  serverId,
  onDone,
  onCancel,
}: {
  initial?: FormState;
  serverId?: Id<"mcpServers">;
  onDone: () => void;
  onCancel: () => void;
}) => {
  const addServer = useAction(api.mcp.addServer);
  const updateServer = useAction(api.mcp.updateServer);
  const [form, setForm] = useState<FormState>(initial ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!serverId;
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateServer({
          serverId,
          name: form.name,
          url: form.url,
          transport: form.transport,
          authType: form.authType,
          token: form.token.trim() ? form.token.trim() : undefined,
          oauthScope: form.oauthScope.trim() || undefined,
        });
      } else {
        await addServer({
          name: form.name,
          url: form.url,
          transport: form.transport,
          authType: form.authType,
          token: form.token.trim() ? form.token.trim() : undefined,
          oauthScope: form.oauthScope.trim() || undefined,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <Field label="Name">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Linear"
            className={inputClass}
            autoFocus
          />
        </Field>

        <Field label="Server URL">
          <input
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://mcp.example.com/sse"
            autoComplete="off"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Transport">
            <select
              value={form.transport}
              onChange={(e) => set("transport", e.target.value as Transport)}
              className={inputClass}
            >
              <option value="http">Streamable HTTP</option>
              <option value="sse">SSE</option>
            </select>
          </Field>

          <Field label="Authentication">
            <select
              value={form.authType}
              onChange={(e) => set("authType", e.target.value as AuthType)}
              className={inputClass}
            >
              <option value="none">None</option>
              <option value="bearer">Bearer token</option>
              <option value="oauth">OAuth</option>
            </select>
          </Field>
        </div>

        {form.authType === "bearer" && (
          <Field label={isEdit ? "Bearer token (leave blank to keep)" : "Bearer token"}>
            <input
              type="password"
              value={form.token}
              onChange={(e) => set("token", e.target.value)}
              placeholder="••••••••"
              autoComplete="off"
              className={inputClass}
            />
          </Field>
        )}

        {form.authType === "oauth" && (
          <Field label="OAuth scope (optional)">
            <input
              value={form.oauthScope}
              onChange={(e) => set("oauthScope", e.target.value)}
              placeholder="read write"
              autoComplete="off"
              className={inputClass}
            />
          </Field>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <LucideTriangleAlert className="size-3.5" />
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={!form.name.trim() || !form.url.trim() || saving}
            className={cn(
              "rounded-lg bg-zinc-900 px-4 py-1.5 text-sm text-white transition-colors cursor-pointer",
              "hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-default"
            )}
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add server"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ServerCard = ({ server }: { server: ServerListItem }) => {
  const setEnabled = useMutation(api.mcp.setEnabled);
  const removeServer = useMutation(api.mcp.removeServer);
  const testConnection = useAction(api.mcp.testConnection);
  const startOAuth = useAction(api.mcp.startOAuth);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<null | "test" | "connect">(null);
  const [result, setResult] = useState<
    { ok: true; message: string } | { ok: false; message: string } | null
  >(null);

  if (editing) {
    return (
      <ServerForm
        serverId={server._id}
        initial={{
          name: server.name,
          url: server.url,
          transport: server.transport,
          authType: server.authType,
          token: "",
          oauthScope: "",
        }}
        onDone={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const handleTest = async () => {
    setBusy("test");
    setResult(null);
    try {
      const res = await testConnection({ serverId: server._id });
      setResult(
        res.ok
          ? { ok: true, message: `Connected — ${res.toolCount} tool(s)` }
          : { ok: false, message: res.error }
      );
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Test failed",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleConnect = async () => {
    setBusy("connect");
    setResult(null);
    try {
      const res = await startOAuth({
        serverId: server._id,
        redirectUri: oauthRedirectUri(),
      });
      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
        return;
      }
      if (res.connected) {
        setResult({ ok: true, message: "Already authorized" });
      }
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Failed to start OAuth",
      });
    } finally {
      setBusy(null);
    }
  };

  const needsAuth = server.authType === "oauth" && !server.oauthConnected;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-medium text-zinc-900">
              {server.name}
            </h2>
            <Badge>{server.transport === "http" ? "HTTP" : "SSE"}</Badge>
            <Badge>
              {server.authType === "none"
                ? "No auth"
                : server.authType === "bearer"
                  ? "Bearer"
                  : "OAuth"}
            </Badge>
            {server.authType === "oauth" &&
              (server.oauthConnected ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <LucideCheck className="size-3" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <LucideTriangleAlert className="size-3" />
                  Needs authorization
                </span>
              ))}
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{server.url}</p>
        </div>

        <Toggle
          checked={server.enabled}
          onChange={(enabled) =>
            void setEnabled({ serverId: server._id, enabled })
          }
        />
      </div>

      {result && (
        <p
          className={cn(
            "mt-3 flex items-center gap-1.5 text-sm",
            result.ok ? "text-emerald-600" : "text-red-600"
          )}
        >
          {result.ok ? (
            <LucideCheck className="size-3.5" />
          ) : (
            <LucideTriangleAlert className="size-3.5" />
          )}
          {result.message}
        </p>
      )}

      <div className="mt-4 flex items-center gap-1 border-t border-zinc-100 pt-3">
        {needsAuth && (
          <button
            onClick={() => void handleConnect()}
            disabled={busy !== null}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
          >
            {busy === "connect" ? (
              <LucideLoader2 className="size-3.5 animate-spin" />
            ) : (
              <LucideLink className="size-3.5" />
            )}
            Connect
          </button>
        )}
        <button
          onClick={() => void handleTest()}
          disabled={busy !== null}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 cursor-pointer"
        >
          {busy === "test" ? (
            <LucideLoader2 className="size-3.5 animate-spin" />
          ) : (
            <LucidePlug className="size-3.5" />
          )}
          Test
        </button>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
        >
          <LucidePencil className="size-3.5" />
          Edit
        </button>
        <div className="flex-1" />
        <button
          onClick={() => void removeServer({ serverId: server._id })}
          className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
        >
          <LucideTrash2 className="size-4" />
        </button>
      </div>
    </div>
  );
};

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-zinc-400 focus:bg-white";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium text-zinc-600">{label}</span>
    {children}
  </label>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
    {children}
  </span>
);

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer",
      checked ? "bg-zinc-900" : "bg-zinc-300"
    )}
  >
    <span
      className={cn(
        "inline-block size-3.5 transform rounded-full bg-white transition-transform",
        checked ? "translate-x-[18px]" : "translate-x-1"
      )}
    />
  </button>
);
