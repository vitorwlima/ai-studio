import * as Popover from "@radix-ui/react-popover";
import { api } from "@convex/api";
import { useMutation, useQuery } from "convex/react";
import {
  LucideCheck,
  LucideChevronDown,
  LucidePlus,
  LucideTrash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "src/lib/utils";
import type { SavedModel, ThreadItem } from "../types";

type ModelPickerProps = {
  threadId: string | undefined;
  selectedModelCode: string | null;
  onSelectedModelChange: (modelCode: string | null) => void;
};

export const ModelPicker = ({
  threadId,
  selectedModelCode,
  onSelectedModelChange,
}: ModelPickerProps) => {
  const [modelInput, setModelInput] = useState("");
  const [open, setOpen] = useState(false);
  const [isSavingModel, setIsSavingModel] = useState(false);
  const [isSavingSelectedModel, setIsSavingSelectedModel] = useState(false);
  const [deletingModelCode, setDeletingModelCode] = useState<string | null>(
    null
  );
  const initializedSelectionRef = useRef(false);

  const saveUserModel = useMutation(api.models.saveUserModel);
  const deleteUserModel = useMutation(api.models.deleteUserModel);
  const threads = useQuery(api.threads.list);
  const savedModels = useQuery(api.models.listUserModels) as
    | SavedModel[]
    | undefined;

  const threadItems = useMemo(
    () => (threads?.page ?? []) as ThreadItem[],
    [threads?.page]
  );
  const activeThread = useMemo(
    () => threadItems.find((thread) => thread._id === threadId),
    [threadItems, threadId]
  );

  const savedModelCodes = useMemo(
    () => (savedModels ?? []).map((model) => model.modelCode),
    [savedModels]
  );

  const selectedModelIsSaved = selectedModelCode
    ? savedModelCodes.includes(selectedModelCode)
    : false;

  const modelsForMenu =
    selectedModelCode && !selectedModelIsSaved
      ? [selectedModelCode, ...savedModelCodes]
      : savedModelCodes;

  useEffect(() => {
    initializedSelectionRef.current = false;
  }, [threadId]);

  useEffect(() => {
    if (initializedSelectionRef.current) return;
    if (savedModels === undefined) return;
    if (threadId && threads === undefined) return;

    const firstSavedModelCode = savedModels[0]?.modelCode ?? null;
    let nextSelectedModelCode = selectedModelCode;

    if (threadId) {
      if (activeThread?.lastModelCode) {
        nextSelectedModelCode = activeThread.lastModelCode;
      } else if (!nextSelectedModelCode) {
        nextSelectedModelCode = firstSavedModelCode;
      }
    } else if (!nextSelectedModelCode) {
      nextSelectedModelCode = firstSavedModelCode;
    }

    if (nextSelectedModelCode !== selectedModelCode) {
      onSelectedModelChange(nextSelectedModelCode);
    }

    initializedSelectionRef.current = true;
  }, [
    savedModels,
    threads,
    activeThread,
    selectedModelCode,
    threadId,
    onSelectedModelChange,
  ]);

  const addModel = useCallback(
    async (modelCode: string) => {
      setIsSavingModel(true);
      try {
        await saveUserModel({ modelCode });
        onSelectedModelChange(modelCode);
      } finally {
        setIsSavingModel(false);
      }
    },
    [saveUserModel, onSelectedModelChange]
  );

  const deleteModel = useCallback(
    async (modelCode: string) => {
      setDeletingModelCode(modelCode);
      try {
        await deleteUserModel({ modelCode });
      } finally {
        setDeletingModelCode(null);
      }
    },
    [deleteUserModel]
  );

  const saveSelectedModel = useCallback(async () => {
    if (!selectedModelCode) return;
    setIsSavingSelectedModel(true);
    try {
      await saveUserModel({ modelCode: selectedModelCode });
    } finally {
      setIsSavingSelectedModel(false);
    }
  }, [selectedModelCode, saveUserModel]);

  const label = selectedModelCode ?? "Select model";

  const handleAddModel = () => {
    const normalized = modelInput.trim();
    if (!normalized || isSavingModel) return;
    void addModel(normalized);
    setModelInput("");
  };

  return (
    <div className="flex items-center gap-2">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="max-w-72 flex items-center gap-1.5 rounded-lg px-1 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <span className="truncate">{label}</span>
            <LucideChevronDown className="size-3 shrink-0 text-zinc-500" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="top"
            align="start"
            sideOffset={8}
            className="z-50 w-[28rem] max-w-[calc(100vw-4rem)] rounded-xl border border-zinc-200 bg-white p-3 shadow-lg animate-fade-in"
          >
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Saved Models
            </div>

            <div className="max-h-44 overflow-y-auto pr-1 space-y-1">
              {savedModels === undefined ? (
                <p className="text-xs text-zinc-500 px-1 py-1">Loading models...</p>
              ) : modelsForMenu.length === 0 ? (
                <p className="text-xs text-zinc-500 px-1 py-1">
                  No saved models yet.
                </p>
              ) : (
                modelsForMenu.map((modelCode) => {
                  const isSelected = selectedModelCode === modelCode;
                  const isSaved = savedModelCodes.includes(modelCode);

                  return (
                    <div key={modelCode} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectedModelChange(modelCode);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex-1 min-w-0 flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                          isSelected
                            ? "bg-zinc-100 text-zinc-900"
                            : "hover:bg-zinc-100 text-zinc-700"
                        )}
                      >
                        <span className="truncate">{modelCode}</span>
                        <span className="shrink-0 ml-2 flex items-center gap-1 text-[11px] text-zinc-500">
                          {!isSaved && "Not saved"}
                          {isSelected && <LucideCheck className="size-3" />}
                        </span>
                      </button>

                      {isSaved && (
                        <button
                          type="button"
                          onClick={() => {
                            void deleteModel(modelCode);
                          }}
                          disabled={deletingModelCode === modelCode}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                          aria-label={`Delete ${modelCode}`}
                        >
                          <LucideTrash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-200 space-y-2">
              <label className="block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Add model by code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={modelInput}
                  onChange={(event) => setModelInput(event.target.value)}
                  placeholder="openai/gpt-oss-120b"
                  className="flex-1 min-w-0 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs outline-none focus:border-zinc-400 transition-colors"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddModel();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddModel}
                  disabled={!modelInput.trim() || isSavingModel}
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs text-white disabled:opacity-30 cursor-pointer hover:bg-zinc-800 transition-colors"
                >
                  <LucidePlus className="size-3.5" />
                  {isSavingModel ? "Saving..." : "Add"}
                </button>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {selectedModelCode && !selectedModelIsSaved && (
        <button
          type="button"
          onClick={() => {
            void saveSelectedModel();
          }}
          disabled={isSavingSelectedModel}
          className="text-[11px] px-2 py-1 rounded-md text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isSavingSelectedModel ? "Saving..." : "Save model"}
        </button>
      )}
    </div>
  );
};
