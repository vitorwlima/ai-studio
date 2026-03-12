import type { ReactNode } from "react";
import type { Components } from "react-markdown";
import { CodeBlock } from "./components/code-block";
import { MarkdownTable } from "./components/markdown-table";

export const markdownComponents: Components = {
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
  h1: ({ children }) => <h1 className="mb-5 text-3xl font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-4 text-2xl font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-3 text-xl font-bold">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-2 text-lg font-bold">{children}</h4>,
  p: ({ children }) => (
    <p className="leading-relaxed not-last:mb-5">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc pl-6 marker:text-xl marker:text-emerald-500">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal pl-6 marker:text-emerald-500">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mb-3 pl-2">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-emerald-500 pl-4 italic">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-emerald-500 underline hover:text-emerald-400"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-8 border-t border-emerald-500" />,
  table: ({ children }: { children?: ReactNode }) => (
    <MarkdownTable>{children}</MarkdownTable>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border-b border-zinc-200 bg-zinc-150 px-4 py-2.5 text-left text-[13px] font-semibold text-zinc-700 tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-b border-zinc-200/60 px-4 py-2.5 text-[13px] text-zinc-600 [tr:nth-child(even)_&]:bg-zinc-50/50 [tbody_tr:last-child_&]:border-b-0">
      {children}
    </td>
  ),
};
