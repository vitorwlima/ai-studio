import { useSmoothText } from "@convex-dev/agent/react";
import { BrainCircuit, Check, ChevronRight, Copy } from "lucide-react";
import { useCallback, useRef, useState, type RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "src/lib/utils";
import { markdownComponents } from "../markdown-components";
import type { ChatMessage } from "../types";
import { WebSearchIndicator } from "./web-search-indicator";
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

  const isStreaming = message.status === "streaming";
  const isReasoningInProgress = !!visibleReasoningText && !message.text;
  const hasWebSearch = message.parts.some((p) => p.type === "tool-webSearch");
  const isWebSearching = hasWebSearch && !visibleText;
  const showLoadingDots =
    isStreaming && !visibleText && !isReasoningInProgress && !isWebSearching;

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
            isStreaming={isWebSearching ? false : isStreaming}
            isActivelyReasoning={isWebSearching ? false : isReasoningInProgress}
            isOpen={reasoningOpen}
            onToggle={() => setReasoningOpen((v) => !v)}
          />
        )}

        {isWebSearching && <WebSearchIndicator />}

        <div className="space-y-2">
          <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
          >
            {visibleText}
          </ReactMarkdown>
          {showLoadingDots && (
            <span className="inline-flex items-center gap-1 h-5">
              <span className="size-1.5 rounded-full bg-zinc-400 animate-[bounce_1.4s_ease-in-out_infinite]" />
              <span className="size-1.5 rounded-full bg-zinc-400 animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
              <span className="size-1.5 rounded-full bg-zinc-400 animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
            </span>
          )}
        </div>

        {(message.error || message.status === "failed") && (
          <p className="mt-2 whitespace-pre-wrap rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
            {message.error ?? "The model request failed."}
          </p>
        )}

        {(() => {
          const showSources = hasWebSearch && !!visibleText;
          const showMeta = !isStreaming && !!message.modelCode;
          if (!showSources && !showMeta) return null;

          return (
            <div className="mt-3 flex items-center gap-2 justify-between">
              {showMeta ? (
                <div className="flex items-center gap-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200">
                  <span className="text-[11px] text-zinc-400 select-none">
                    {message.reasoningEffort && message.reasoningEffort !== "off"
                      ? `${message.modelCode} (${message.reasoningEffort})`
                      : message.modelCode}
                  </span>
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
              ) : (
                <div />
              )}
              {showSources && <WebSearchSources parts={message.parts} />}
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
  isActivelyReasoning,
  isOpen,
  onToggle,
}: {
  text: string;
  isStreaming: boolean;
  isActivelyReasoning: boolean;
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
        {isActivelyReasoning && (
          <span className="inline-flex items-center gap-0.5 ml-0.5">
            <span className="size-1 rounded-full bg-violet-400 animate-[bounce_1.4s_ease-in-out_infinite]" />
            <span className="size-1 rounded-full bg-violet-400 animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
            <span className="size-1 rounded-full bg-violet-400 animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
          </span>
        )}
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
