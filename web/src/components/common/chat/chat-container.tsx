import { api } from "@convex/api";
import { useMutation } from "convex/react";
import { LucideArrowUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useUIMessages } from "@convex-dev/agent/react";
import { cn } from "src/lib/utils";
import { useAutoScroll } from "./use-auto-scroll";

type Props = {
  threadId: string | undefined;
};

export const ChatContainer: React.FC<Props> = ({ threadId }) => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const sendMessage = useMutation(api.messages.sendMessage);
  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 9999, stream: true }
  );

  const results = messagesResult?.results ?? [];
  // const isStreaming = results.some((m) => m.id.includes("stream:"));

  const { scrollContainerRef, lastUserMessageRef, needsScrollSpacer, onSend } =
    useAutoScroll({ messageCount: results.length });

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = input;
    setInput("");
    onSend();

    const result = await sendMessage({
      prompt: message,
      threadId,
    });

    if (!threadId && result?.threadId) {
      navigate(`/chat/${result.threadId}`);
    }
  };

  return (
    <div className="h-full relative flex-1 flex flex-col">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-20"
      >
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
          className="max-w-3xl mx-auto flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-2 shadow-sm focus-within:border-zinc-400 transition-colors"
        >
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
            placeholder="Message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="shrink-0 size-8 flex items-center justify-center rounded-full bg-zinc-800 text-white disabled:opacity-30 cursor-pointer transition-opacity"
          >
            <LucideArrowUp className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
