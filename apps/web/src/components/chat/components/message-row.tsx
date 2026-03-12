import { useSmoothText } from "@convex-dev/agent/react";
import { BrainCircuit, Check, ChevronRight, Copy } from "lucide-react";
import { useCallback, useRef, useState, type RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "src/lib/utils";
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
          <ReasoningBlock
            text={visibleReasoningText}
            isStreaming={message.status === "streaming"}
            isOpen={reasoningOpen}
            onToggle={() => setReasoningOpen((v) => !v)}
          />
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
                    {message.reasoningEffort && message.reasoningEffort !== "off"
                      ? `${message.modelCode} (${message.reasoningEffort})`
                      : message.modelCode}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleCopyMessage()}
                  className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
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

const ReasoningBlock = ({
  text,
  isStreaming,
  isOpen,
  onToggle,
}: {
  text: string;
  isStreaming: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const isThinking = isStreaming && !text;

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "group/reasoning flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all duration-200 cursor-pointer",
          "border border-zinc-200/80 hover:border-zinc-300",
          isOpen
            ? "bg-zinc-100 text-zinc-700"
            : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-600"
        )}
      >
        <BrainCircuit
          className={cn(
            "size-3.5 shrink-0 transition-colors",
            isThinking && "animate-pulse text-violet-400",
            isOpen ? "text-violet-500" : "text-zinc-400 group-hover/reasoning:text-violet-400"
          )}
        />
        <span className="font-medium">
          {isThinking ? "Thinking..." : "Reasoning"}
        </span>
        <ChevronRight
          className={cn(
            "size-3 ml-0.5 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-250 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div
            ref={contentRef}
            className="mt-2 ml-1 rounded-lg border border-zinc-200/60 bg-gradient-to-b from-zinc-50/80 to-white px-4 py-3 text-xs leading-relaxed text-zinc-500 space-y-2"
          >
            <ReactMarkdown
              components={markdownComponents}
              remarkPlugins={[remarkGfm]}
            >
              {text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
