import { api } from "@convex/api";
import { useMutation } from "convex/react";
import { LucideSend } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useUIMessages } from "@convex-dev/agent/react";

type Props = {
  threadId: string | undefined;
};

export const ChatContainer: React.FC<Props> = ({ threadId }) => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const sendMessage = useMutation(api.messages.sendMessage);
  const messagesResult = useUIMessages(
    api.threads.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 10, stream: true }
  );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = input;
    setInput("");

    const result = await sendMessage({
      prompt: message,
      threadId,
    });

    if (!threadId && result?.threadId) {
      navigate(`/chat/${result.threadId}`);
    }
  };

  return (
    <div className="h-full relative flex-1 overflow-y-auto">
      <div className="flex flex-col gap-4">
        {messagesResult?.results?.map((messageResult) => (
          <div
            key={messageResult.key}
            className="p-2 rounded-xl border border-zinc-400 flex flex-col gap-2"
          >
            <div>Role: {messageResult.role}</div>
            {messageResult.role === "assistant" &&
              !!messageResult.parts.find(
                (part) => part.type === "reasoning"
              ) && (
                <div>
                  Reasoning:{" "}
                  {
                    messageResult.parts.find(
                      (part) => part.type === "reasoning"
                    )?.text
                  }
                </div>
              )}
            <div>Content: {messageResult.text}</div>
          </div>
        ))}
      </div>
      <div className="sticky bg-zinc-200 w-2xl h-20 p-2 border border-zinc-400 bottom-0 left-0 right-0 mx-auto rounded-xl">
        <form onSubmit={handleSubmit}>
          <input
            className="w-full p-1"
            placeholder="Type your prompt here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="p-1 cursor-pointer">
            <LucideSend />
          </button>
        </form>
      </div>
    </div>
  );
};
