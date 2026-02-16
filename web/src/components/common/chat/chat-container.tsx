import { api } from "@convex/api";
import { useMutation } from "convex/react";
import { LucideArrowUp } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useUIMessages } from "@convex-dev/agent/react";
import { cn } from "src/lib/utils";

type Props = {
  threadId: string | undefined;
};

export const ChatContainer: React.FC<Props> = ({ threadId }) => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useMutation(api.messages.sendMessage);
  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 9999, stream: true }
  );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = input;
    setInput("");

    const result = await sendMessage({
      prompt: message,
      threadId,
    });

    if (!threadId && result?.threadId) {
      navigate(`/chat/${result.threadId}`);
    }
  };

  const isStreaming = messagesResult?.results?.some(
    (m) => m.role === "assistant" && m.status === "pending"
  );

  return (
    <div className="h-full relative flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {messagesResult?.results?.map((messageResult) => {
            const isUser = messageResult.role === "user";
            const reasoning = messageResult.parts.find(
              (part) => part.type === "reasoning"
            );

            return (
              <div
                key={messageResult.key}
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

          {isStreaming && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 px-4 py-3">
                <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 pb-4 px-4">
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
