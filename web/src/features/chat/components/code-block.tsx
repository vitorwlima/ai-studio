import { LucideCheck, LucideCopy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeBlockProps = {
  language: string | undefined;
  children: string;
};

export const CodeBlock = ({ language, children }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLanguage = language ?? "text";

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 text-[13px]">
      <div className="flex items-center justify-between bg-zinc-800 px-4 py-1.5">
        <span className="text-xs text-zinc-400">{displayLanguage}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <LucideCheck className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <LucideCopy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      {language ? (
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "13px",
          }}
        >
          {children}
        </SyntaxHighlighter>
      ) : (
        <pre className="overflow-x-auto bg-zinc-900 p-4 text-zinc-100">
          <code>{children}</code>
        </pre>
      )}
    </div>
  );
};
