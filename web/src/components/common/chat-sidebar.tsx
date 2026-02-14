import { api } from "@convex/api";
import { useQuery } from "convex/react";

export const ChatSidebar = () => {
  const chats = useQuery(api.chats.getChats) ?? [];

  return (
    <div className="h-full flex flex-col gap-2 w-60">
      <div className="flex items-center justify-between border border-zinc-200 rounded-xl p-2 w-full">
        <div className="flex items-center gap-0.5">
          <img src="/logo.svg" alt="AI Studio logo" className="size-7" />
          <h1 className="font-semibold">AI Studio</h1>
        </div>
        <div className="flex items-center gap-2"></div>
      </div>
    </div>
  );
};
