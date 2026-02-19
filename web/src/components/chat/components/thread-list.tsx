import { useMemo } from "react";
import type { DeleteModalThread, ThreadItem } from "../types";
import { ThreadRow } from "./thread-row";

type ThreadListProps = {
  threadItems: ThreadItem[];
  activeThreadId: string | undefined;
  onRequestDelete: (thread: DeleteModalThread) => void;
  onActionError: (message: string | null) => void;
};

type DateGroup = {
  label: string;
  threads: ThreadItem[];
};

const groupThreadsByDate = (threads: ThreadItem[]): DateGroup[] => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = startOfToday - 30 * 24 * 60 * 60 * 1000;

  const groups: Record<string, ThreadItem[]> = {
    Today: [],
    "Last 7 days": [],
    "Last 30 days": [],
    Older: [],
  };

  for (const thread of threads) {
    const updatedAt = thread.updatedAt;

    if (updatedAt >= startOfToday) {
      groups["Today"].push(thread);
    } else if (updatedAt >= sevenDaysAgo) {
      groups["Last 7 days"].push(thread);
    } else if (updatedAt >= thirtyDaysAgo) {
      groups["Last 30 days"].push(thread);
    } else {
      groups["Older"].push(thread);
    }
  }

  const order = ["Today", "Last 7 days", "Last 30 days", "Older"];
  return order
    .filter((label) => groups[label].length > 0)
    .map((label) => ({ label, threads: groups[label] }));
};

export const ThreadList = ({
  threadItems,
  activeThreadId,
  onRequestDelete,
  onActionError,
}: ThreadListProps) => {
  const groups = useMemo(() => groupThreadsByDate(threadItems), [threadItems]);

  return (
    <div className="flex flex-col overflow-y-auto min-h-0">
      {groups.map((group, groupIndex) => (
        <div key={group.label} className="mb-2">
          <div
            className={`text-xs text-zinc-500 tracking-wider px-2 pb-1 ${
              groupIndex > 0 ? "pt-3" : ""
            }`}
          >
            {group.label}
          </div>
          <div className="flex flex-col gap-0.5">
            {group.threads.map((thread) => (
              <ThreadRow
                key={thread._id}
                thread={thread}
                isActive={activeThreadId === thread._id}
                onRequestDelete={onRequestDelete}
                onActionError={onActionError}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
