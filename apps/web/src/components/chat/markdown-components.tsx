import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import { CodeBlock } from "./components/code-block";

export const markdownComponents: Components = {
  p: ({ children }: { children?: ReactNode }) => (
    <p className="whitespace-pre-wrap wrap-break-word">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  pre: ({ children }: { children?: ReactNode }) => <>{children}</>,
  code: ({
    className,
    children,
  }: {
    className?: string;
    children?: ReactNode;
  }) => {
    const match = /language-(\w+)/.exec(className ?? "");
    const isBlock = !!className;

    if (isBlock) {
      const text = String(children).replace(/\n$/, "");
      return <CodeBlock language={match?.[1]}>{text}</CodeBlock>;
    }

    return (
      <code className="bg-zinc-100 rounded px-1.5 py-0.5 text-[13px] font-mono">
        {children}
      </code>
    );
  },
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc pl-6 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal pl-6 space-y-1">{children}</ol>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="border-l-4 border-zinc-300 pl-4 italic text-zinc-600">
      {children}
    </blockquote>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="overflow-x-auto rounded-lg border border-zinc-400">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border-b border-r border-zinc-400 bg-zinc-200 px-3 py-1.5 text-left font-medium last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-b border-r border-zinc-400 px-3 py-1.5 last:border-r-0 [tbody_tr:last-child_&]:border-b-0">
      {children}
    </td>
  ),
  hr: () => <hr className="my-4 border-zinc-200" />,
};
