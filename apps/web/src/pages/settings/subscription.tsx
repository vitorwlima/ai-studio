import {
  LucideCircleCheck,
  LucideInfo,
  LucideLoader2,
  LucideLock,
  LucideSparkles,
} from "lucide-react";
import { SettingsLayout } from "./layout";
import { useAction, useQuery } from "convex/react";
import { api } from "@convex/api";
import { useState } from "react";
import { IS_PAYWALL_ENABLED } from "src/lib/paywall";
import { cn } from "src/lib/utils";

export const SubscriptionSettings = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const userSubscription = useQuery(api.stripe.getUserSubscription);
  const createSubscriptionCheckout = useAction(
    api.stripe.createSubscriptionCheckout
  );
  const createSubscriptionManagement = useAction(
    api.stripe.createSubscriptionManagement
  );
  const isProUser = userSubscription?.status === "active";
  const subscriptionEndDate =
    userSubscription?.cancelAtPeriodEnd && userSubscription?.cancelAt
      ? new Date(userSubscription.cancelAt * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const handleRedirectToStripe = async () => {
    setIsRedirecting(true);
    try {
      let url = "";
      if (isProUser) {
        const management = await createSubscriptionManagement();
        url = management.url;
      } else {
        const checkout = await createSubscriptionCheckout();
        url = checkout.url ?? "";
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error(error);
      setIsRedirecting(false);
    }
  };

  return (
    <SettingsLayout>
      <h1 className="text-xl font-semibold text-zinc-900">Subscription</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage your plan and billing.
      </p>

      <div className="mt-6 space-y-4">
        {!IS_PAYWALL_ENABLED && (
          <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 px-4 py-3 text-blue-800 shadow-sm">
            <LucideInfo className="mt-0.5 size-4 shrink-0" />
            <p className="text-sm">
              <span className="font-medium">
                Subscription is currently free for everyone.
              </span>{" "}
              You don't need to worry about this page at all. It may change in
              the future.
            </p>
          </div>
        )}

        <div
          className={cn(
            "rounded-xl shadow-sm p-5",
            isProUser ? "bg-emerald-50 text-emerald-900" : "bg-white text-zinc-800"
          )}
        >
          <div className="flex items-center gap-2.5">
            {isProUser ? (
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
                <LucideCircleCheck className="size-4 text-emerald-700" />
              </div>
            ) : (
              <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100">
                <LucideLock className="size-4 text-zinc-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">
                {isProUser ? "Pro plan" : "No active plan"}
              </p>
              <p
                className={cn(
                  "text-xs",
                  isProUser ? "text-emerald-700" : "text-zinc-500"
                )}
              >
                {isProUser
                  ? "You have full access to all features."
                  : "Subscribe to Pro to unlock the full app."}
              </p>
            </div>
          </div>

          {subscriptionEndDate && (
            <p className="mt-3 inline-block rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
              Your plan will end on{" "}
              <span className="font-semibold">{subscriptionEndDate}</span>.
            </p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default",
                isProUser
                  ? "bg-white text-zinc-800 hover:bg-zinc-100 shadow-sm"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              )}
              onClick={handleRedirectToStripe}
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <LucideLoader2 className="size-4 animate-spin" />
              ) : !isProUser ? (
                <LucideSparkles className="size-4" />
              ) : null}
              {isProUser ? "Manage plan" : "Subscribe to Pro"}
            </button>
            {!isProUser && (
              <span className="text-sm text-zinc-500">
                <span className="text-lg font-semibold tracking-tight text-zinc-800">
                  $4
                </span>
                <span className="text-xs">/month</span>
                <span className="mx-1.5 text-zinc-300">&middot;</span>
                <span className="text-xs">cancel anytime</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};
