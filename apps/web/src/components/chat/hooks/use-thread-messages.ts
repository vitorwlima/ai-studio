import { api } from "@convex/api";
import { useUIMessages } from "@convex-dev/agent/react";
import type { ChatMessage } from "../types";

type UseThreadMessagesOptions = {
  threadId: string | undefined;
};

export const useThreadMessages = ({ threadId }: UseThreadMessagesOptions) => {
  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 9999, stream: true }
  );

  if (!threadId) {
    return {
      messages: [],
      lastUserMessageIndex: -1,
      isStreaming: false,
    }
  }

  const messages = (messagesResult?.results ?? []) as ChatMessage[];
  const isStreaming = messages.some(
    (message) => message.status === "streaming"
  );

  const lastUserMessageIndex = messages.reduce(
    (lastIndex, message, index) =>
      message.role === "user" ? index : lastIndex,
    -1
  );

  return {
    messages,
    lastUserMessageIndex,
    isStreaming,
  };
};
