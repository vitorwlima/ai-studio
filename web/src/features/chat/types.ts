export type ReasoningEffort = "off" | "low" | "medium" | "high";

export type ChatMessage = {
  key: string;
  id: string;
  role: string;
  text: string;
  status?:
    | "streaming"
    | "pending"
    | "success"
    | "failed"
    | "finished"
    | "aborted";
  error?: string;
  parts: Array<{ type: string; text?: string }>;
  modelCode?: string;
  reasoningEffort?: ReasoningEffort;
};

export type SavedModel = {
  modelCode: string;
};

export type ThreadItem = {
  _id: string;
  title?: string;
  _creationTime: number;
  updatedAt: number;
};

export type DeleteModalThread = {
  threadId: string;
  title: string;
};
