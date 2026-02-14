import { useParams } from "react-router";
import { ChatSidebar } from "src/components/common/chat-sidebar";

export const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();

  return (
    <main className="h-screen flex p-4 gap-4">
      <ChatSidebar />
      <div>chatId: {chatId}</div>
    </main>
  );
};
