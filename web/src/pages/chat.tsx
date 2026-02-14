import { useParams } from "react-router";

export const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();

  return (
    <div>
      <h1>Chat</h1>
      <p>Chat ID: {chatId}</p>
    </div>
  );
};
