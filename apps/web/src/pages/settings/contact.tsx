import { LucideExternalLink, LucideLinkedin, LucideMail } from "lucide-react";
import { SettingsLayout } from "./layout";
import { IS_PAYWALL_ENABLED } from "src/lib/paywall";

export const ContactSettings = () => {
  return (
    <SettingsLayout>
      <h1 className="text-xl font-semibold text-zinc-900">Contact</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Get in touch, we're happy to help.
      </p>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100">
              <LucideMail className="size-4 text-zinc-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-900">Email</h2>
              <p className="text-xs text-zinc-500">
                {IS_PAYWALL_ENABLED
                  ? "Support or billing questions. Also for anything else: bugs, feature requests and suggestions."
                  : "Anything you may need: bugs, feature requests and suggestions."}
              </p>
            </div>
          </div>
          <div className="px-5 py-4">
            <a
              href="mailto:hello@aistudio.gg"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              hello@aistudio.gg
              <LucideExternalLink className="size-3 text-zinc-400" />
            </a>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100">
              <LucideLinkedin className="size-4 text-zinc-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-zinc-900">LinkedIn</h2>
              <p className="text-xs text-zinc-500">
                Talk to me directly. I'll try my best to answer quickly!
              </p>
            </div>
          </div>
          <div className="px-5 py-4">
            <a
              href="https://www.linkedin.com/in/vitor-windberg/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
            >
              LinkedIn
              <LucideExternalLink className="size-3 text-zinc-400" />
            </a>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};
