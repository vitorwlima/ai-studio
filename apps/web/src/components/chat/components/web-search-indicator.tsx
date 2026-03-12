import { Globe } from "lucide-react";

export const WebSearchIndicator = () => {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div className="relative flex items-center justify-center size-5">
        <span className="absolute inset-0 rounded-full bg-zinc-400/15 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <Globe className="relative size-3.5 text-zinc-400 animate-[pulse_2s_ease-in-out_infinite]" />
      </div>
      <span className="text-[13px] text-zinc-400 tracking-tight">
        Searching the web
        <span className="inline-flex items-center gap-0.5 ml-3">
          <span className="size-1 rounded-full bg-zinc-400 animate-[bounce_1.4s_ease-in-out_infinite]" />
          <span className="size-1 rounded-full bg-zinc-400 animate-[bounce_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="size-1 rounded-full bg-zinc-400 animate-[bounce_1.4s_ease-in-out_0.4s_infinite]" />
        </span>
      </span>
    </div>
  );
};
