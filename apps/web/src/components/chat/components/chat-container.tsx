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
  onSendReady: (onSend: () => void) => void;
};

export const ChatContainer = ({
  threadId,
  selectedModelCode,
  onSendReady,
}: ChatContainerProps) => {
  const hasApiKey = useQuery(api.settings.hasApiKey);
  const userSubscription = useQuery(api.stripe.getUserSubscription);
  const isProUser = userSubscription?.status === "active";
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
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-2 pb-32 md:px-1">
      {showEmptyState && (
        <ChatEmptyState
          hasApiKey={hasApiKey}
          selectedModelCode={selectedModelCode}
          isProUser={isProUser}
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
