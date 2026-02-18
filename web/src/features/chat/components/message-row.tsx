import { useSmoothText } from "@convex-dev/agent/react";
import { useState, type RefObject } from "react";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "../markdown-components";
import type { ChatMessage } from "../types";

type MessageRowProps = {
  message: ChatMessage;
  isLastUserMessage: boolean;
  lastUserMessageRef: RefObject<HTMLDivElement | null>;
};

export const MessageRow = ({
  message,
  isLastUserMessage,
  lastUserMessageRef,
}: MessageRowProps) => {
  const isUser = message.role === "user";
  const reasoning = message.parts.find((part) => part.type === "reasoning");
  const reasoningText = reasoning?.text ?? "";
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });
  const [visibleReasoningText] = useSmoothText(reasoningText, {
    startStreaming: message.status === "streaming",
  });
  const [reasoningOpen, setReasoningOpen] = useState(false);

  if (isUser) {
    return (
      <div
        ref={isLastUserMessage ? lastUserMessageRef : null}
        className="flex justify-end"
      >
        <div className="rounded-2xl rounded-br-md bg-zinc-800 text-zinc-100 px-4 py-2.5 text-sm leading-relaxed max-w-[75%]">
          <div className="space-y-2">
            <ReactMarkdown components={markdownComponents}>
              {visibleText}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={isLastUserMessage ? lastUserMessageRef : null}
      className="flex justify-start"
    >
      <div className="min-w-0 text-sm leading-relaxed text-zinc-800">
        {reasoning?.text && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setReasoningOpen((v) => !v)}
              className="text-xs text-zinc-500 hover:text-zinc-700 cursor-pointer transition-colors font-medium"
            >
              {reasoningOpen ? "Hide reasoning" : "View reasoning"}
            </button>
            {reasoningOpen && (
              <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500 space-y-2">
                <ReactMarkdown components={markdownComponents}>
                  {visibleReasoningText}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <ReactMarkdown components={markdownComponents}>
            {visibleText}
          </ReactMarkdown>
          {message.status === "streaming" && (
            <span className="inline-block w-1.5 h-4 bg-zinc-400 rounded-sm animate-pulse" />
          )}
        </div>

        {(message.error || message.status === "failed") && (
          <p className="mt-2 whitespace-pre-wrap break-words rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
            {message.error ?? "The model request failed."}
          </p>
        )}

        {message.modelCode && (
          <p className="mt-2 text-[11px] text-zinc-400">
            {message.reasoningEffort
              ? `${message.modelCode} (${message.reasoningEffort})`
              : message.modelCode}
          </p>
        )}
      </div>
    </div>
  );
};
