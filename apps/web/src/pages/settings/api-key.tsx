import { api } from "@convex/api";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  LucideCheck,
  LucideExternalLink,
  LucideKey,
  LucidePencil,
  LucideTrash2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "src/lib/utils";
import { SettingsLayout } from "./layout";

export const ApiKeySettings = () => {
  const maskedKey = useQuery(api.settings.getMaskedApiKey);
  const saveApiKey = useAction(api.settings.saveApiKey);
  const removeApiKey = useMutation(api.settings.removeApiKey);

  const [isEditing, setIsEditing] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const hasKey = !!maskedKey;

  const handleSave = async () => {
    if (!keyInput.trim()) return;
    setIsSaving(true);
    try {
      await saveApiKey({ apiKey: keyInput.trim() });
      setKeyInput("");
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    await removeApiKey();
    setIsEditing(false);
    setKeyInput("");
  };

  return (
    <SettingsLayout>
      <h1 className="text-xl font-semibold text-zinc-900">API Key</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Connect your own OpenRouter key for model access.
      </p>

      <div className="mt-6 rounded-xl bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100">
            <LucideKey className="size-4 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-900">
              OpenRouter API Key
            </h2>
            <p className="text-xs text-zinc-500">
              Used to authenticate requests to AI models
            </p>
          </div>
        </div>

        <div className="p-5">
          {hasKey && !isEditing ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LucideCheck className="size-3.5 text-emerald-600" />
                <code className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm text-zinc-600">
                  {maskedKey}
                </code>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                >
                  <LucidePencil className="size-3.5" />
                  Change
                </button>
                <button
                  onClick={handleRemove}
                  className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <LucideTrash2 className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-or-v1-..."
                  autoComplete="off"
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition-colors focus:border-zinc-400 focus:bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSave();
                  }}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between">
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700"
                >
                  Get a key at openrouter.ai
                  <LucideExternalLink className="size-3" />
                </a>
                <div className="flex items-center gap-2">
                  {hasKey && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setKeyInput("");
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      void handleSave();
                    }}
                    disabled={!keyInput.trim() || isSaving}
                    className={cn(
                      "rounded-lg bg-zinc-900 px-4 py-1.5 text-sm text-white transition-colors cursor-pointer",
                      "hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-default"
                    )}
                  >
                    {isSaving ? "Saving..." : "Save key"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsLayout>
  );
};
