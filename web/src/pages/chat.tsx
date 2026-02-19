import { LucideArrowUp } from "lucide-react";
import { useCallback, useState } from "react";
import { useParams } from "react-router";
import { ChatContainer, ChatSidebar } from "src/components/chat";
import { ModelPicker } from "src/components/chat/components/model-picker";
import { ReasoningSelect } from "src/components/chat/components/reasoning-select";
import { useChatComposer } from "src/components/chat/hooks/use-chat-composer";

export const Chat = () => {
  const { threadId } = useParams<{ threadId: string | undefined }>();
  const [onSend, setOnSend] = useState<() => void>(() => () => {});

  const onSendReady = useCallback((nextOnSend: () => void) => {
    setOnSend(() => nextOnSend);
  }, []);

  const {
    selectedModelCode,
    selectedModelIsSaved,
    isSavingSelectedModel,
    modelsForMenu,
    savedModelCodes,
    savedModelsLoaded,
    isSavingModel,
    deletingModelCode,
    addModel,
    deleteModel,
    saveSelectedModel,
    selectModel,
    selectedReasoningEffort,
    setSelectedReasoningEffort,
    input,
    setInput,
    canSend,
    inputDisabled,
    inputPlaceholder,
    textareaRef,
    resizeTextarea,
    hasApiKey,
    handleSubmit,
    selectSuggestion,
  } = useChatComposer({ threadId, onSend });

  return (
    <main className="h-dvh flex relative">
      <ChatSidebar />

      <div className="h-full flex-1 flex flex-col bg-white">
        <ChatContainer
          key={threadId ?? "new-thread"}
          threadId={threadId}
          hasApiKey={hasApiKey}
          selectedModelCode={selectedModelCode}
          onSuggestionSelect={selectSuggestion}
          onSendReady={onSendReady}
        />

        <div className="shrink-0 px-4 pb-4 pt-2 relative">
          <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-white to-transparent" />

          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
            className="max-w-3xl mx-auto flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm focus-within:border-zinc-300 focus-within:shadow-md transition-all"
          >
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 resize-none max-h-48 overflow-y-auto disabled:opacity-50"
              placeholder={inputPlaceholder}
              rows={1}
              value={input}
              disabled={inputDisabled}
              onChange={(event) => {
                setInput(event.target.value);
                resizeTextarea();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
            />

            <div className="flex items-center gap-2 pt-1">
              <ModelPicker
                selectedModelCode={selectedModelCode}
                modelsForMenu={modelsForMenu}
                savedModelCodes={savedModelCodes}
                savedModelsLoaded={savedModelsLoaded}
                isSavingModel={isSavingModel}
                deletingModelCode={deletingModelCode}
                addModel={addModel}
                selectModel={selectModel}
                deleteModel={deleteModel}
              />

              <ReasoningSelect
                selectedReasoningEffort={selectedReasoningEffort}
                onReasoningChange={setSelectedReasoningEffort}
              />

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
        </div>
      </div>
    </main>
  );
};
