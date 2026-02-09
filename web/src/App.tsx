import { useQuery } from "convex/react";
import { api } from "@convex/api";

export const App = () => {
  const chats = useQuery(api.chats.getChats, { userId: "" });

  return (
    <div>
      <h1>AI Studio</h1>
      <pre>{JSON.stringify(chats, null, 2)}</pre>
    </div>
  );
};
