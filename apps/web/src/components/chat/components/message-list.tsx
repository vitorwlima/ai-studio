import type { RefObject } from "react";
import type { ChatMessage } from "../types";
import { MessageRow } from "./message-row";

type MessageListProps = {
  messages: ChatMessage[];
  lastUserMessageIndex: number;
  scrollContentRef: RefObject<HTMLDivElement | null>;
  lastUserMessageRef: RefObject<HTMLDivElement | null>;
  needsScrollSpacer: boolean;
};

export const MessageList = ({
  messages,
  lastUserMessageIndex,
  scrollContentRef,
  lastUserMessageRef,
  needsScrollSpacer,
}: MessageListProps) => {
  return (
    <div ref={scrollContentRef} className="max-w-3xl mx-auto flex flex-col gap-5 py-2">
      {messages.map((message, index) => {
        const isLastUserMessage =
          message.role === "user" && index === lastUserMessageIndex;

        return (
          <MessageRow
            key={message.key}
            message={message}
            isLastUserMessage={isLastUserMessage}
            lastUserMessageRef={lastUserMessageRef}
          />
        );
      })}

      {needsScrollSpacer && (
        <div className="min-h-[calc(100dvh-8rem)]" aria-hidden="true" />
      )}
    </div>
  );
};
