import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { useAutoScroll } from "../hooks/use-auto-scroll";
import { useThreadMessages } from "../hooks/use-thread-messages";
import { ChatEmptyState } from "./chat-empty-state";
import { MessageList } from "./message-list";

type ChatContainerProps = {
  threadId: string | undefined;
  selectedModelCode: string | null;
  onSuggestionSelect: (suggestion: string) => void;
  onSendReady: (onSend: () => void) => void;
};

export const ChatContainer = ({
  threadId,
  selectedModelCode,
  onSuggestionSelect,
  onSendReady,
}: ChatContainerProps) => {
  const hasApiKey = useQuery(api.settings.hasApiKey);
  const { messages, lastUserMessageIndex } = useThreadMessages({ threadId });

  const {
    scrollContainerRef,
    scrollContentRef,
    lastUserMessageRef,
    needsScrollSpacer,
    onSend,
  } = useAutoScroll({ messageCount: messages.length });

  useEffect(() => {
    onSendReady(onSend);
  }, [onSend, onSendReady]);

  const showEmptyState = !threadId && messages.length === 0;

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4">
      {showEmptyState && (
        <ChatEmptyState
          hasApiKey={hasApiKey}
          selectedModelCode={selectedModelCode}
          onSuggestionSelect={onSuggestionSelect}
        />
      )}
      <MessageList
        messages={messages}
        lastUserMessageIndex={lastUserMessageIndex}
        scrollContentRef={scrollContentRef}
        lastUserMessageRef={lastUserMessageRef}
        needsScrollSpacer={needsScrollSpacer}
      />
    </div>
  );
};
