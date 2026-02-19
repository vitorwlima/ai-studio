import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { ChatContainer, ChatSidebar } from "src/components/chat";
import { ChatComposer } from "src/components/chat/components/chat-composer";

export const Chat = () => {
  const { threadId } = useParams<{ threadId: string | undefined }>();
  const threads = useQuery(api.threads.list);
  const [onSend, setOnSend] = useState<() => void>(() => () => {});
  const [selectSuggestion, setSelectSuggestion] = useState<
    (suggestion: string) => void
  >(() => () => {});
  const [selectedModelCode, setSelectedModelCode] = useState<string | null>(
    null
  );

  const pageTitle = useMemo(() => {
    if (!threadId) return "AI Studio";
    if (threads === undefined) return "AI Studio";

    const thread = threads.page.find((item) => item._id === threadId);
    if (!thread) return "AI Studio";

    const threadName = thread?.title?.trim() || "New Chat";

    return `${threadName} - AI Studio`;
  }, [threadId, threads]);

  useEffect(() => {
    document.title = pageTitle;

    return () => {
      document.title = "AI Studio";
    };
  }, [pageTitle]);

  const onSendReady = useCallback((nextOnSend: () => void) => {
    setOnSend(() => nextOnSend);
  }, []);

  const onSuggestionHandlerReady = useCallback(
    (nextSelectSuggestion: (suggestion: string) => void) => {
      setSelectSuggestion(() => nextSelectSuggestion);
    },
    []
  );

  return (
    <main className="h-dvh flex relative">
      <ChatSidebar />

      <div className="h-full flex-1 flex flex-col bg-white">
        <ChatContainer
          key={threadId ?? "new-thread"}
          threadId={threadId}
          selectedModelCode={selectedModelCode}
          onSuggestionSelect={selectSuggestion}
          onSendReady={onSendReady}
        />

        <ChatComposer
          threadId={threadId}
          selectedModelCode={selectedModelCode}
          onSelectedModelChange={setSelectedModelCode}
          onSend={onSend}
          onSuggestionHandlerReady={onSuggestionHandlerReady}
        />
      </div>
    </main>
  );
};
