import { api } from "@convex/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { LucideExternalLink, LucideKey, LucideTrash2 } from "lucide-react";
import { useState } from "react";
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
    <SettingsLayout
      title="Settings"
      description="Configure your OpenRouter API key."
    >
      <div className="border border-zinc-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <LucideKey className="size-4 text-zinc-500" />
          <h2 className="font-medium text-zinc-900">OpenRouter API Key</h2>
        </div>

        {hasKey && !isEditing ? (
          <div className="flex items-center justify-between">
            <code className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
              {maskedKey}
            </code>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-100"
              >
                Change
              </button>
              <button
                onClick={handleRemove}
                className="text-sm text-red-600 hover:text-red-700 cursor-pointer transition-colors p-1.5 rounded-lg hover:bg-red-50"
              >
                <LucideTrash2 className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave();
              }}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1 transition-colors"
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
                    className="text-sm text-zinc-500 hover:text-zinc-700 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={!keyInput.trim() || isSaving}
                  className="text-sm bg-zinc-800 text-white px-4 py-1.5 rounded-lg disabled:opacity-30 cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};
