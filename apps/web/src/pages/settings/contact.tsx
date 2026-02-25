import { LucideMail } from "lucide-react";
import { SettingsLayout } from "./layout";

export const ContactSettings = () => {
  return (
    <SettingsLayout title="Settings" description="Reach out if you need help.">
      <div className="rounded-xl border border-zinc-200 p-5">
        <div className="mb-3 flex items-center gap-2">
          <LucideMail className="size-4 text-zinc-500" />
          <h2 className="font-medium text-zinc-900">Contact</h2>
        </div>
        <p className="text-sm text-zinc-600">
          For support, billing questions, or account help, send us an email at{" "}
          <a
            href="mailto:hello@aistudio.gg"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700"
          >
            hello@aistudio.gg
          </a>
          .
        </p>
      </div>
    </SettingsLayout>
  );
};
