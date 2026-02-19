import { useCallback, useState } from "react";
import { useParams } from "react-router";
import { ChatContainer, ChatSidebar } from "src/components/chat";
import { ChatComposer } from "src/components/chat/components/chat-composer";

export const Chat = () => {
  const { threadId } = useParams<{ threadId: string | undefined }>();
  const [onSend, setOnSend] = useState<() => void>(() => () => {});
  const [selectSuggestion, setSelectSuggestion] = useState<
    (suggestion: string) => void
  >(() => () => {});
  const [selectedModelCode, setSelectedModelCode] = useState<string | null>(
    null
  );

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
