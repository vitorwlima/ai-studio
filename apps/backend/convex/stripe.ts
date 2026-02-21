import { action, query } from "./_generated/server";
import { components } from "./_generated/api";
import { StripeSubscriptions } from "@convex-dev/stripe";

const stripeClient = new StripeSubscriptions(components.stripe);

export const createSubscriptionCheckout = action({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    if (!process.env.STRIPE_PRICE_KEY)
      throw new Error("STRIPE_PRICE_KEY is not set");

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    return await stripeClient.createCheckoutSession(ctx, {
      priceId: process.env.STRIPE_PRICE_KEY!,
      successUrl: process.env.WEB_URL!,
      cancelUrl: `${process.env.WEB_URL}/settings/subscription`,
      mode: "subscription",
      customerId: customer.customerId,
      subscriptionMetadata: { userId: identity.subject },
    });
  },
});

export const createSubscriptionManagement = action({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    return await stripeClient.createCustomerPortalSession(ctx, {
      customerId: customer.customerId,
      returnUrl: `${process.env.WEB_URL}/settings/subscription`,
    });
  },
});

export const getUserSubscription = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const subscriptions = await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.subject }
    );

    const sortedByEndDate = subscriptions.sort(
      (a, b) => b.currentPeriodEnd - a.currentPeriodEnd
    );
    const currentSubscription = sortedByEndDate[0] ?? null;

    return currentSubscription;
  },
});
