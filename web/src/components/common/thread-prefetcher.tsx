import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { useUIMessages } from "@convex-dev/agent/react";

const ThreadMessages = ({ threadId }: { threadId: string }) => {
  useUIMessages(
    api.threads.listThreadMessages,
    { threadId },
    { initialNumItems: 10, stream: true }
  );
  return null;
};

export const ThreadPrefetcher = () => {
  const threads = useQuery(api.threads.list);
  return (
    <>
      {threads?.page.map((thread) => (
        <ThreadMessages key={thread._id} threadId={thread._id} />
      ))}
    </>
  );
};
