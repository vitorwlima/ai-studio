import { LucideCircleCheck, LucideInfo, LucideLoader2, LucideLock } from "lucide-react";
import { SettingsLayout } from "./layout";
import { useAction, useQuery } from "convex/react";
import { api } from "@convex/api";
import { useState } from "react";
import { IS_PAYWALL_ENABLED } from "src/lib/paywall";

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
    <SettingsLayout
      title="Settings"
      description="Manage your subscription and billing."
    >
      {!IS_PAYWALL_ENABLED && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 mb-4 text-blue-800">
          <LucideInfo className="size-4 mt-0.5 shrink-0" />
          <p className="text-sm">
            <span className="font-medium">Subscription is currently free for everyone.</span>{" "}
            You don't need to worry about this tab at all — it may change in the future.
          </p>
        </div>
      )}
      <div
        className={`rounded-xl border p-4 mb-4 ${
          isProUser
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-zinc-200 bg-zinc-50 text-zinc-800"
        }`}
      >
        <div className="flex items-center gap-2">
          {isProUser ? (
            <LucideCircleCheck className="size-4" />
          ) : (
            <LucideLock className="size-4" />
          )}
          <p className="text-sm font-medium">
            {isProUser
              ? "You are on Pro and can use the full app."
              : "Pro subscription is required to use the app."}
          </p>
        </div>
        {subscriptionEndDate && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 inline-block">
            Your plan will end on{" "}
            <span className="font-semibold">{subscriptionEndDate}</span>.
          </p>
        )}
        <div className="mt-3 flex flex-col gap-1">
          <button
            type="button"
            className="flex items-center gap-2 text-xs font-medium w-fit bg-white text-zinc-800 border border-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            onClick={handleRedirectToStripe}
            disabled={isRedirecting}
          >
            {isRedirecting && <LucideLoader2 className="size-4 animate-spin" />}
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
    </SettingsLayout>
  );
};
