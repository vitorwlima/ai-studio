import { useParams } from "react-router";
import { useState } from "react";
import { ChatSidebar } from "src/components/common/chat-sidebar";
import {
  ChatContainer,
  type ReasoningEffort,
} from "src/components/common/chat/chat-container";

export const Chat = () => {
  const { threadId } = useParams<{ threadId: string | undefined }>();
  const [lastSelectedModelCode, setLastSelectedModelCode] = useState<
    string | null
  >(null);
  const [selectedReasoningEffort, setSelectedReasoningEffort] =
    useState<ReasoningEffort>("low");

  return (
    <main className="h-dvh flex p-4 gap-4">
      <ChatSidebar />
      <ChatContainer
        key={threadId ?? "new"}
        threadId={threadId}
        selectedModelCode={lastSelectedModelCode}
        onSelectModelCode={setLastSelectedModelCode}
        selectedReasoningEffort={selectedReasoningEffort}
        onSelectReasoningEffort={setSelectedReasoningEffort}
      />
    </main>
  );
};
