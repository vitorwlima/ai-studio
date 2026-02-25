import { api } from "@convex/api";
import { useMutation, useQuery } from "convex/react";
import { LucideArrowUp } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router";
import { useThreadMessages } from "../hooks/use-thread-messages";
import type { ReasoningEffort, ThreadItem } from "../types";
import { ModelPicker } from "./model-picker";
import { ReasoningSelect } from "./reasoning-select";

type ChatComposerProps = {
  threadId: string | undefined;
  selectedModelCode: string | null;
  onSelectedModelChange: (modelCode: string | null) => void;
  onSend: () => void;
  onSuggestionHandlerReady: (fn: (suggestion: string) => void) => void;
};

export const ChatComposer = ({
  threadId,
  selectedModelCode,
  onSelectedModelChange,
  onSend,
  onSuggestionHandlerReady,
}: ChatComposerProps) => {
  const [selectedReasoningEffort, setSelectedReasoningEffort] = useReducer(
    (_previous: ReasoningEffort, next: ReasoningEffort) => next,
    "low" as ReasoningEffort
  );
  const [input, setInput] = useState("");
  const initializedReasoningRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const navigate = useNavigate();
  const sendMessage = useMutation(api.messages.sendMessage);

  const hasApiKey = useQuery(api.settings.hasApiKey);
  const { isStreaming } = useThreadMessages({ threadId });
  const threads = useQuery(api.threads.list);
  const threadItems = useMemo(
    () => (threads?.page ?? []) as ThreadItem[],
    [threads?.page]
  );
  const activeThread = useMemo(
    () => threadItems.find((thread) => thread._id === threadId),
    [threadItems, threadId]
  );

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    initializedReasoningRef.current = false;
  }, [threadId]);

  useEffect(() => {
    if (initializedReasoningRef.current) return;
    if (threadId && threads === undefined) return;

    let nextReasoningEffort = selectedReasoningEffort;
    if (threadId && activeThread?.lastReasoningEffort) {
      nextReasoningEffort = activeThread.lastReasoningEffort;
    }

    if (nextReasoningEffort !== selectedReasoningEffort) {
      setSelectedReasoningEffort(nextReasoningEffort);
    }

    initializedReasoningRef.current = true;
  }, [threads, activeThread, selectedReasoningEffort, threadId]);

  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (
        !input.trim() ||
        !selectedModelCode ||
        hasApiKey !== true ||
        isStreaming
      ) {
        return;
      }

      const message = input;
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      onSend();

      const result = await sendMessage({
        prompt: message,
        threadId,
        modelCode: selectedModelCode,
        reasoningEffort: selectedReasoningEffort,
      });

      if (!threadId && result?.threadId) {
        navigate(`/chat/${result.threadId}`);
      }
    },
    [
      input,
      selectedModelCode,
      hasApiKey,
      isStreaming,
      onSend,
      sendMessage,
      threadId,
      selectedReasoningEffort,
      navigate,
    ]
  );

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      setInput(suggestion);
      textareaRef.current?.focus();
      resizeTextarea();
    },
    [resizeTextarea]
  );

  useEffect(() => {
    onSuggestionHandlerReady(selectSuggestion);
  }, [onSuggestionHandlerReady, selectSuggestion]);

  const inputDisabled = hasApiKey === false;
  const canSend =
    !!input.trim() &&
    hasApiKey === true &&
    !!selectedModelCode &&
    !isStreaming;
  const inputPlaceholder =
    hasApiKey === false
      ? "Add an API key in settings to start chatting..."
      : selectedModelCode
        ? "Your prompt here..."
        : "Select a model to start chatting...";

  return (
    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-full max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto flex flex-col gap-1 rounded-2xl bg-zinc-900/95 px-4 py-3 transition-all"
      >
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-400/75 resize-none max-h-48 overflow-y-auto disabled:opacity-50"
          placeholder={inputPlaceholder}
          rows={2}
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

        <div className="flex items-center gap-1.5 pt-1">
          <ModelPicker
            threadId={threadId}
            selectedModelCode={selectedModelCode}
            onSelectedModelChange={onSelectedModelChange}
          />

          <ReasoningSelect
            selectedReasoningEffort={selectedReasoningEffort}
            onReasoningChange={setSelectedReasoningEffort}
          />

          <button
            type="submit"
            disabled={!canSend}
            className="shrink-0 ml-auto size-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-900 disabled:opacity-40 disabled:cursor-default cursor-pointer transition-colors hover:bg-white"
          >
            <LucideArrowUp className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
