import * as Popover from "@radix-ui/react-popover";
import {
  LucideCheck,
  LucideChevronDown,
  LucidePlus,
  LucideTrash2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "src/lib/utils";

type ModelPickerProps = {
  selectedModelCode: string | null;
  modelsForMenu: string[];
  savedModelCodes: string[];
  savedModelsLoaded: boolean;
  isSavingModel: boolean;
  deletingModelCode: string | null;
  addModel: (modelCode: string) => void;
  selectModel: (modelCode: string) => void;
  deleteModel: (modelCode: string) => void;
};

export const ModelPicker = ({
  selectedModelCode,
  modelsForMenu,
  savedModelCodes,
  savedModelsLoaded,
  isSavingModel,
  deletingModelCode,
  addModel,
  selectModel,
  deleteModel,
}: ModelPickerProps) => {
  const [modelInput, setModelInput] = useState("");
  const [open, setOpen] = useState(false);
  const label = selectedModelCode ?? "Select model";

  const handleAddModel = () => {
    const normalized = modelInput.trim();
    if (!normalized || isSavingModel) return;
    addModel(normalized);
    setModelInput("");
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="max-w-72 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <span className="truncate">{label}</span>
          <LucideChevronDown className="size-3 shrink-0 text-zinc-400" />
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
            {!savedModelsLoaded ? (
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
                        selectModel(modelCode);
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
                        onClick={() => deleteModel(modelCode)}
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
  );
};
