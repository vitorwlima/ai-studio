import { useSmoothText } from "@convex-dev/agent/react";
import { Check, ChevronRight, Copy } from "lucide-react";
import { useCallback, useState, type RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "../markdown-components";
import type { ChatMessage } from "../types";
import { WebSearchSources } from "./web-search-part";

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
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = useCallback(async () => {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.text]);

  if (isUser) {
    return (
      <div
        ref={isLastUserMessage ? lastUserMessageRef : null}
        className="flex justify-end"
      >
        <div className="rounded-2xl rounded-br-md bg-zinc-800 text-zinc-100 px-4 py-2.5 text-sm leading-relaxed max-w-[75%]">
          <div className="space-y-2">
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm]}
            >
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
      className="group/message flex justify-start"
    >
      <div className="min-w-0 text-sm leading-relaxed text-zinc-800">
        {reasoning?.text && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setReasoningOpen((v) => !v)}
              className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-all cursor-pointer"
            >
              <ChevronRight
                className={`size-3 transition-transform duration-200 ${
                  reasoningOpen ? "rotate-90" : ""
                }`}
              />
              Reasoning
            </button>
            {reasoningOpen && (
              <div className="mt-2 border-l-2 border-zinc-300 pl-4 py-2 text-xs text-zinc-500 space-y-2">
                <ReactMarkdown
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                >
                  {visibleReasoningText}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
          >
            {visibleText}
          </ReactMarkdown>
          {message.status === "streaming" && (
            <span className="inline-block w-1.5 h-4 bg-zinc-400 rounded-sm animate-pulse" />
          )}
        </div>

        {(message.error || message.status === "failed") && (
          <p className="mt-2 whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
            {message.error ?? "The model request failed."}
          </p>
        )}

        {(() => {
          const hasWebSources = message.parts.some(
            (p) => p.type === "tool-webSearch"
          );
          const hasModel = !!message.modelCode;
          const hasFooterContent = hasWebSources || hasModel;
          if (!hasFooterContent) return null;

          return (
            <div className="mt-3 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200">
                {hasModel && (
                  <span className="text-[11px] text-zinc-400 select-none">
                    {message.reasoningEffort
                      ? `${message.modelCode} (${message.reasoningEffort})`
                      : message.modelCode}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void handleCopyMessage()}
                  className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
              {hasWebSources && <WebSearchSources parts={message.parts} />}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
