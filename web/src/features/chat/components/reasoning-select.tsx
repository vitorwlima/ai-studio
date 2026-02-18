import * as Select from "@radix-ui/react-select";
import { LucideCheck, LucideChevronDown } from "lucide-react";
import { useChat } from "../context/chat-context";
import type { ReasoningEffort } from "../types";

const options: { value: ReasoningEffort; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const ReasoningSelect = () => {
  const { selectedReasoningEffort, setSelectedReasoningEffort } = useChat();

  return (
    <Select.Root
      value={selectedReasoningEffort}
      onValueChange={(v) => setSelectedReasoningEffort(v as ReasoningEffort)}
    >
      <Select.Trigger className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer outline-none">
        <Select.Value>
          Reasoning: {selectedReasoningEffort}
        </Select.Value>
        <Select.Icon>
          <LucideChevronDown className="size-3 text-zinc-400" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          side="top"
          sideOffset={8}
          className="z-50 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg animate-fade-in"
        >
          <Select.Viewport>
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center justify-between gap-4 rounded-lg px-3 py-1.5 text-xs text-zinc-700 cursor-pointer outline-none data-[highlighted]:bg-zinc-100 transition-colors"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <LucideCheck className="size-3 text-zinc-500" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
