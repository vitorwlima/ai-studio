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
};

export const ChatComposer = ({
  threadId,
  selectedModelCode,
  onSelectedModelChange,
  onSend,
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
  const userSubscription = useQuery(api.stripe.getUserSubscription);
  const isProUser = userSubscription?.status === "active";
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
    async (e?: React.SubmitEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (
        !input.trim() ||
        !selectedModelCode ||
        hasApiKey !== true ||
        isStreaming ||
        !isProUser
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
      isProUser,
    ]
  );

  const inputDisabled = hasApiKey === false;
  const canSend =
    !!input.trim() &&
    hasApiKey === true &&
    !!selectedModelCode &&
    !isStreaming &&
    isProUser;
  const inputPlaceholder =
    hasApiKey === false
      ? "Add an API key in settings to start chatting..."
      : !isProUser
      ? "Subscription required to send messages..."
      : selectedModelCode
      ? "Your prompt here..."
      : "Select a model to start chatting...";

  return (
    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-full max-w-3xl px-2 md:px-0">
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
            aria-label="Send message"
            className="shrink-0 ml-auto size-9 flex items-center justify-center rounded-full border border-white/30 bg-linear-to-br from-zinc-50 to-zinc-200 text-zinc-900 shadow-[0_8px_22px_-12px_rgba(255,255,255,0.95)] transition-all duration-200 enabled:cursor-pointer enabled:hover:from-white enabled:hover:to-zinc-100 enabled:hover:shadow-[0_12px_30px_-14px_rgba(255,255,255,1)] enabled:active:translate-y-0 enabled:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
          >
            <LucideArrowUp className="size-4.5" strokeWidth={2.25} />
          </button>
        </div>
      </form>
    </div>
  );
};
