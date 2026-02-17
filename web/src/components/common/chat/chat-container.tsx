import { api } from "@convex/api";
import { useMutation, useQuery } from "convex/react";
import { LucideArrowUp, LucideKey, LucideMessageSquare } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useUIMessages } from "@convex-dev/agent/react";
import { cn } from "src/lib/utils";
import { useAutoScroll } from "./use-auto-scroll";

type Props = {
  threadId: string | undefined;
};

export const ChatContainer: React.FC<Props> = ({ threadId }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const sendMessage = useMutation(api.messages.sendMessage);
  const hasApiKey = useQuery(api.settings.hasApiKey);
  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 9999, stream: true }
  );

  const results = messagesResult?.results ?? [];
  // const isStreaming = results.some((m) => m.id.includes("stream:"));

  const { scrollContainerRef, lastUserMessageRef, needsScrollSpacer, onSend } =
    useAutoScroll({ messageCount: results.length });

  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const message = input;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    onSend();

    const result = await sendMessage({
      prompt: message,
      threadId,
    });

    if (!threadId && result?.threadId) {
      navigate(`/chat/${result.threadId}`);
    }
  };

  const showEmptyState = !threadId && results.length === 0;
  const inputDisabled = hasApiKey === false;

  return (
    <div className="h-full relative flex-1 flex flex-col">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-20"
      >
        {showEmptyState && (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              {hasApiKey === false ? (
                <>
                  <LucideKey className="size-8 text-zinc-300" />
                  <p className="text-sm text-zinc-500">
                    Add your OpenRouter API key to get started
                  </p>
                  <Link
                    to="/settings"
                    className="text-sm bg-zinc-800 text-white px-4 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    Add API key
                  </Link>
                </>
              ) : (
                <>
                  <LucideMessageSquare className="size-8 text-zinc-300" />
                  <p className="text-sm text-zinc-500">
                    Start a conversation
                  </p>
                  <p className="text-xs text-zinc-400">
                    Type a message below to begin
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {results.map((messageResult, index) => {
            const isUser = messageResult.role === "user";
            const reasoning = messageResult.parts.find(
              (part) => part.type === "reasoning"
            );
            const isLastUserMessage =
              isUser &&
              [results.length - 1, results.length - 2].includes(index);

            return (
              <div
                key={messageResult.key}
                ref={isLastUserMessage ? lastUserMessageRef : null}
                className={cn("flex", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "bg-zinc-800 text-zinc-100 max-w-[85%]"
                      : "text-zinc-800"
                  )}
                >
                  {!isUser && reasoning?.text && (
                    <details className="mb-2 text-xs text-zinc-400">
                      <summary className="cursor-pointer select-none font-medium">
                        Reasoning
                      </summary>
                      <p className="mt-1 whitespace-pre-wrap">
                        {reasoning.text}
                      </p>
                    </details>
                  )}
                  <p className="whitespace-pre-wrap">{messageResult.text}</p>
                </div>
              </div>
            );
          })}

          {needsScrollSpacer && (
            <div className="min-h-[calc(100dvh-8rem)]" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="absolute w-full bottom-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-end gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-2 shadow-sm focus-within:border-zinc-400 transition-colors"
        >
          <textarea
            ref={textareaRef}
            className="flex-1 self-center bg-transparent text-sm outline-none placeholder:text-zinc-400 resize-none max-h-48 overflow-y-auto disabled:opacity-50"
            placeholder={inputDisabled ? "Add an API key in settings to start chatting..." : "Your prompt here..."}
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
                handleSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || inputDisabled}
            className="shrink-0 size-8 mb-0.5 flex items-center justify-center rounded-full bg-zinc-800 text-white disabled:opacity-30 cursor-pointer transition-opacity"
          >
            <LucideArrowUp className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
