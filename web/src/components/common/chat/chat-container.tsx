import { useState } from "react";

type Props = {
  chatId: string | undefined;
};

export const ChatContainer: React.FC<Props> = ({ chatId }) => {
  const [input, setInput] = useState("");

  return (
    <div className="h-full relative flex-1">
      <div className="absolute w-2xl h-20 p-2 border border-zinc-400 bottom-0 left-0 right-0 mx-auto rounded-xl">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            className="w-full p-1"
            placeholder="Type your prompt here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
};
