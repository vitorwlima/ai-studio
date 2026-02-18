import { LucideArrowUp } from "lucide-react";
import { useChat } from "../context/chat-context";
import { ModelPicker } from "./model-picker";
import { ReasoningSelect } from "./reasoning-select";

export const ChatForm = () => {
  const {
    input,
    setInput,
    canSend,
    inputDisabled,
    inputPlaceholder,
    textareaRef,
    resizeTextarea,
    handleSubmit,
    selectedModelCode,
    selectedModelIsSaved,
    isSavingSelectedModel,
    saveSelectedModel,
  } = useChat();

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm focus-within:border-zinc-300 focus-within:shadow-md transition-all"
    >
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 resize-none max-h-48 overflow-y-auto disabled:opacity-50"
        placeholder={inputPlaceholder}
        rows={1}
        value={input}
        disabled={inputDisabled}
        onChange={(e) => {
          setInput(e.target.value);
          resizeTextarea();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSubmit();
          }
        }}
      />

      <div className="flex items-center gap-2 pt-1">
        <ModelPicker />
        <ReasoningSelect />

        {selectedModelCode && !selectedModelIsSaved && (
          <button
            type="button"
            onClick={saveSelectedModel}
            disabled={isSavingSelectedModel}
            className="text-[11px] px-2 py-1 rounded-md text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSavingSelectedModel ? "Saving..." : "Save model"}
          </button>
        )}

        <button
          type="submit"
          disabled={!canSend}
          className="shrink-0 ml-auto size-8 flex items-center justify-center rounded-full bg-zinc-800 text-white disabled:opacity-30 cursor-pointer transition-opacity hover:bg-zinc-700"
        >
          <LucideArrowUp className="size-4" />
        </button>
      </div>
    </form>
  );
};
