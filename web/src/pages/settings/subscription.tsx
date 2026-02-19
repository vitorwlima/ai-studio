import { PricingTable, useAuth } from "@clerk/clerk-react";
import {
  SubscriptionDetailsButton,
  usePlans,
} from "@clerk/clerk-react/experimental";
import { LucideCircleCheck, LucideLock } from "lucide-react";
import { useMemo } from "react";
import { SettingsLayout } from "./layout";

export const SubscriptionSettings = () => {
  const { has } = useAuth();
  const hasProPlan = has?.({ plan: "user:pro" }) ?? false;
  const plans = usePlans({ for: "user" });

  const pricingAppearance = useMemo(() => {
    const elements: Record<string, { display: "none" }> = {
      // Keep free tier hidden even before plans load.
      pricingTableCard__free: { display: "none" },
      pricingTableCard__Free: { display: "none" },
    };

    for (const plan of plans.data ?? []) {
      if (plan.fee.amount !== 0) continue;
      elements[`pricingTableCard__${plan.id}`] = { display: "none" };
      elements[`pricingTableCard__${plan.slug}`] = { display: "none" };
      elements[`pricingTableCard__${plan.name}`] = { display: "none" };
    }

    return { elements } as const;
  }, [plans.data]);

  return (
    <SettingsLayout
      title="Settings"
      description="Manage your subscription and billing."
    >
      <div
        className={`rounded-xl border p-4 mb-4 ${
          hasProPlan
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-zinc-200 bg-zinc-50 text-zinc-800"
        }`}
      >
        <div className="flex items-center gap-2">
          {hasProPlan ? (
            <LucideCircleCheck className="size-4" />
          ) : (
            <LucideLock className="size-4" />
          )}
          <p className="text-sm font-medium">
            {hasProPlan
              ? "You are on Pro and can use the full app."
              : "Pro subscription is required to use the app."}
          </p>
        </div>
        <div className="mt-3">
          <SubscriptionDetailsButton for="user">
            <button
              type="button"
              className="text-xs font-medium bg-white text-zinc-800 border border-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Manage plan
            </button>
          </SubscriptionDetailsButton>
        </div>
        {!hasProPlan && (
          <p className="text-xs text-zinc-600 mt-2">
            Subscribe to Pro below to unlock chat and API key settings.
          </p>
        )}
      </div>

      <div className="border border-zinc-200 rounded-xl p-3 bg-white">
        <PricingTable
          for="user"
          newSubscriptionRedirectUrl="/"
          appearance={pricingAppearance}
        />
      </div>
    </SettingsLayout>
  );
};
