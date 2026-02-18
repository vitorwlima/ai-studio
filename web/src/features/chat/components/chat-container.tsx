import { api } from "@convex/api";
import { useUIMessages } from "@convex-dev/agent/react";
import { useEffect } from "react";
import type { ChatMessage } from "../types";
import { useAutoScroll } from "../hooks/use-auto-scroll";
import { useChat, useChatOnSendRef } from "../context/chat-context";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatForm } from "./chat-form";
import { MessageList } from "./message-list";

type ChatContainerProps = {
  threadId: string | undefined;
};

export const ChatContainer = ({ threadId }: ChatContainerProps) => {
  const { hasApiKey, selectedModelCode } = useChat();
  const onSendRef = useChatOnSendRef();

  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 9999, stream: true }
  );

  const results = (messagesResult?.results ?? []) as ChatMessage[];

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

  // Register onSend with the context so handleSubmit can call it
  useEffect(() => {
    onSendRef.current = onSend;
  }, [onSend, onSendRef]);

  const showEmptyState = !threadId && results.length === 0;

  return (
    <div className="h-full flex-1 flex flex-col bg-white">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4"
      >
        {showEmptyState && (
          <ChatEmptyState
            hasApiKey={hasApiKey}
            selectedModelCode={selectedModelCode}
          />
        )}
        <MessageList
          messages={results}
          lastUserMessageIndex={lastUserMessageIndex}
          scrollContentRef={scrollContentRef}
          lastUserMessageRef={lastUserMessageRef}
          needsScrollSpacer={needsScrollSpacer}
        />
      </div>

      <div className="shrink-0 px-4 pb-4 pt-2 relative">
        <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-white to-transparent" />
        <ChatForm />
      </div>
    </div>
  );
};
