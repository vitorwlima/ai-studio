import { useParams } from "react-router";
import { ChatContainer, ChatSidebar } from "src/features/chat";
import { ChatProvider } from "src/features/chat/context/chat-context";

export const Chat = () => {
  const { threadId } = useParams<{ threadId: string | undefined }>();

  return (
    <main className="h-dvh flex relative">
      <ChatSidebar />
      <ChatProvider key={threadId ?? "new"} threadId={threadId}>
        <ChatContainer threadId={threadId} />
      </ChatProvider>
    </main>
  );
};
