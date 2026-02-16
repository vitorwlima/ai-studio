import { useParams } from "react-router";
import { ChatSidebar } from "src/components/common/chat-sidebar";
import { ChatContainer } from "src/components/common/chat/chat-container";

export const Chat = () => {
  const { threadId } = useParams<{ threadId: string | undefined }>();

  return (
    <main className="h-screen flex p-4 gap-4">
      <ChatSidebar />
      <ChatContainer threadId={threadId} />
    </main>
  );
};
