import { useParams } from "react-router";
import { useState } from "react";
import { ChatSidebar } from "src/components/common/chat-sidebar";
import { ChatContainer } from "src/components/common/chat/chat-container";

export const Chat = () => {
  const { threadId } = useParams<{ threadId: string | undefined }>();
  const [lastSelectedModelCode, setLastSelectedModelCode] = useState<
    string | null
  >(null);

  return (
    <main className="h-dvh flex p-4 gap-4">
      <ChatSidebar />
      <ChatContainer
        key={threadId ?? "new"}
        threadId={threadId}
        selectedModelCode={lastSelectedModelCode}
        onSelectModelCode={setLastSelectedModelCode}
      />
    </main>
  );
};
