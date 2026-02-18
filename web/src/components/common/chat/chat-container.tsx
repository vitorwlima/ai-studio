import { api } from "@convex/api";
import { useMutation, useQuery } from "convex/react";
import {
  LucideArrowUp,
  LucideCheck,
  LucideChevronDown,
  LucideKey,
  LucideMessageSquare,
  LucidePlus,
  LucideTrash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useUIMessages } from "@convex-dev/agent/react";
import ReactMarkdown from "react-markdown";
import { cn } from "src/lib/utils";
import { useAutoScroll } from "./use-auto-scroll";

type Props = {
  threadId: string | undefined;
  selectedModelCode: string | null;
  onSelectModelCode: (modelCode: string | null) => void;
};

type ChatMessage = {
  key: string;
  id: string;
  role: string;
  text: string;
  parts: Array<{ type: string; text?: string }>;
  modelCode?: string;
};

type SavedModel = {
  modelCode: string;
};

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="whitespace-pre-wrap break-words">{children}</p>
  ),
  a: ({
    href,
    children,
  }: {
    href?: string;
    children?: React.ReactNode;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="underline underline-offset-2"
    >
      {children}
    </a>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="overflow-x-auto rounded-lg bg-zinc-900/90 p-3 text-zinc-100">
      {children}
    </pre>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-zinc-200 px-1 py-0.5 text-[12px]">
      {children}
    </code>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-5">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-5">{children}</ol>
  ),
};

export const ChatContainer: React.FC<Props> = ({
  threadId,
  selectedModelCode,
  onSelectModelCode,
}) => {
  const [input, setInput] = useState("");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [modelInput, setModelInput] = useState("");
  const [isSavingModel, setIsSavingModel] = useState(false);
  const [isSavingSelectedModel, setIsSavingSelectedModel] = useState(false);
  const [deletingModelCode, setDeletingModelCode] = useState<string | null>(
    null
  );
  const initializedSelectionRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const sendMessage = useMutation(api.messages.sendMessage);
  const saveUserModel = useMutation(api.models.saveUserModel);
  const deleteUserModel = useMutation(api.models.deleteUserModel);
  const hasApiKey = useQuery(api.settings.hasApiKey);
  const savedModels = useQuery(api.models.listUserModels) as
    | SavedModel[]
    | undefined;
  const threadLastModelCode = useQuery(
    api.threads.getThreadLastModelCode,
    threadId ? { threadId } : "skip"
  );
  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 9999, stream: true }
  );

  const results = (messagesResult?.results ?? []) as ChatMessage[];
  const savedModelCodes = (savedModels ?? []).map((model) => model.modelCode);
  const selectedModelIsSaved = selectedModelCode
    ? savedModelCodes.includes(selectedModelCode)
    : false;

  const lastUserMessageIndex = results.reduce(
    (lastIndex, message, index) => (message.role === "user" ? index : lastIndex),
    -1
  );

  const {
    scrollContainerRef,
    scrollContentRef,
    lastUserMessageRef,
    needsScrollSpacer,
    onSend,
  } = useAutoScroll({ messageCount: results.length });

  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);

  useEffect(() => {
    initializedSelectionRef.current = false;
  }, [threadId]);

  useEffect(() => {
    if (initializedSelectionRef.current) return;
    if (savedModels === undefined) return;
    if (threadId && threadLastModelCode === undefined) return;

    const firstSavedModelCode = savedModels[0]?.modelCode ?? null;
    let nextSelection = selectedModelCode;

    if (threadId) {
      if (threadLastModelCode) {
        nextSelection = threadLastModelCode;
      } else if (!nextSelection) {
        nextSelection = firstSavedModelCode;
      }
    } else if (!nextSelection) {
      nextSelection = firstSavedModelCode;
    }

    if (nextSelection !== selectedModelCode) {
      onSelectModelCode(nextSelection);
    }

    initializedSelectionRef.current = true;
  }, [
    savedModels,
    selectedModelCode,
    onSelectModelCode,
    threadId,
    threadLastModelCode,
  ]);

  const handleSelectModel = (modelCode: string) => {
    onSelectModelCode(modelCode);
    setIsModelMenuOpen(false);
  };

  const handleAddModel = async () => {
    const normalizedModelCode = modelInput.trim();
    if (!normalizedModelCode) return;

    setIsSavingModel(true);
    try {
      await saveUserModel({ modelCode: normalizedModelCode });
      onSelectModelCode(normalizedModelCode);
      setModelInput("");
    } finally {
      setIsSavingModel(false);
    }
  };

  const handleDeleteModel = async (modelCode: string) => {
    setDeletingModelCode(modelCode);
    try {
      await deleteUserModel({ modelCode });
    } finally {
      setDeletingModelCode(null);
    }
  };

  const handleSaveSelectedModel = async () => {
    if (!selectedModelCode) return;

    setIsSavingSelectedModel(true);
    try {
      await saveUserModel({ modelCode: selectedModelCode });
    } finally {
      setIsSavingSelectedModel(false);
    }
  };

  const handleSubmit = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || !selectedModelCode || hasApiKey !== true) return;

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
    });

    if (!threadId && result?.threadId) {
      navigate(`/chat/${result.threadId}`);
    }
  };

  const showEmptyState = !threadId && results.length === 0;
  const inputDisabled = hasApiKey === false;
  const canSend =
    !!input.trim() && hasApiKey === true && !!selectedModelCode;
  const modelPickerLabel = selectedModelCode ?? "Select model";
  const modelInputPlaceholder =
    hasApiKey === false
      ? "Add an API key in settings to start chatting..."
      : selectedModelCode
        ? "Your prompt here..."
        : "Select a model to start chatting...";
  const modelsForMenu = selectedModelCode && !selectedModelIsSaved
    ? [selectedModelCode, ...savedModelCodes]
    : savedModelCodes;

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
              ) : !selectedModelCode ? (
                <>
                  <LucideMessageSquare className="size-8 text-zinc-300" />
                  <p className="text-sm text-zinc-500">Select a model</p>
                  <p className="text-xs text-zinc-400">
                    Choose an OpenRouter model in the composer below
                  </p>
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
        <div ref={scrollContentRef} className="max-w-3xl mx-auto flex flex-col gap-4">
          {results.map((messageResult, index) => {
            const isUser = messageResult.role === "user";
            const reasoning = messageResult.parts.find(
              (part) => part.type === "reasoning"
            );
            const isLastUserMessage = isUser && index === lastUserMessageIndex;

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
                      <div className="mt-1 space-y-2">
                        <ReactMarkdown components={markdownComponents}>
                          {reasoning.text}
                        </ReactMarkdown>
                      </div>
                    </details>
                  )}
                  <div className="space-y-2">
                    <ReactMarkdown components={markdownComponents}>
                      {messageResult.text}
                    </ReactMarkdown>
                  </div>
                  {!isUser && messageResult.modelCode && (
                    <p className="mt-2 text-[11px] text-zinc-400">
                      {messageResult.modelCode}
                    </p>
                  )}
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
          className="max-w-3xl mx-auto flex flex-col gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-2 shadow-sm focus-within:border-zinc-400 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelMenuOpen((prev) => !prev)}
                className="max-w-72 flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <span className="truncate">{modelPickerLabel}</span>
                <LucideChevronDown className="size-3.5 shrink-0 text-zinc-500" />
              </button>

              {isModelMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 z-20 w-[28rem] max-w-[calc(100vw-4rem)] rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Saved Models
                  </div>

                  <div className="max-h-44 overflow-y-auto pr-1 space-y-1">
                    {savedModels === undefined ? (
                      <p className="text-xs text-zinc-500 px-1 py-1">Loading models...</p>
                    ) : modelsForMenu.length === 0 ? (
                      <p className="text-xs text-zinc-500 px-1 py-1">
                        No saved models yet.
                      </p>
                    ) : (
                      modelsForMenu.map((modelCode) => {
                        const isSelected = selectedModelCode === modelCode;
                        const isSaved = savedModelCodes.includes(modelCode);

                        return (
                          <div key={modelCode} className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSelectModel(modelCode)}
                              className={cn(
                                "flex-1 min-w-0 flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                                isSelected
                                  ? "bg-zinc-100 text-zinc-900"
                                  : "hover:bg-zinc-100 text-zinc-700"
                              )}
                            >
                              <span className="truncate">{modelCode}</span>
                              <span className="shrink-0 ml-2 flex items-center gap-1 text-[11px] text-zinc-500">
                                {!isSaved && "Not saved"}
                                {isSelected && <LucideCheck className="size-3" />}
                              </span>
                            </button>

                            {isSaved && (
                              <button
                                type="button"
                                onClick={() => handleDeleteModel(modelCode)}
                                disabled={deletingModelCode === modelCode}
                                className="p-1.5 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                                aria-label={`Delete ${modelCode}`}
                              >
                                <LucideTrash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-200 space-y-2">
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      Add model by code
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={modelInput}
                        onChange={(e) => setModelInput(e.target.value)}
                        placeholder="openai/gpt-oss-120b"
                        className="flex-1 min-w-0 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs outline-none focus:border-zinc-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddModel();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddModel}
                        disabled={!modelInput.trim() || isSavingModel}
                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs text-white disabled:opacity-30 cursor-pointer"
                      >
                        <LucidePlus className="size-3.5" />
                        {isSavingModel ? "Saving..." : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedModelCode && !selectedModelIsSaved && (
              <>
                <span className="text-[11px] text-amber-700">Not saved</span>
                <button
                  type="button"
                  onClick={handleSaveSelectedModel}
                  disabled={isSavingSelectedModel}
                  className="text-[11px] px-2 py-1 rounded-md border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingSelectedModel ? "Saving..." : "Save model"}
                </button>
              </>
            )}
          </div>

          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              className="flex-1 self-center bg-transparent text-sm outline-none placeholder:text-zinc-400 resize-none max-h-48 overflow-y-auto disabled:opacity-50"
              placeholder={modelInputPlaceholder}
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
              disabled={!canSend}
              className="shrink-0 size-8 mb-0.5 flex items-center justify-center rounded-full bg-zinc-800 text-white disabled:opacity-30 cursor-pointer transition-opacity"
            >
              <LucideArrowUp className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
