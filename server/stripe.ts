import Stripe from "stripe";
import { ENV } from "./_core/env";
import type { RuntimeEnv } from "./_core/env-config.node";
import { createCloudflareEnv } from "./_core/env-config.cloudflare";
import * as db from "./db";
import { SUBSCRIPTION_TIERS, type SubscriptionTierKey } from "@shared/types";
import { sendPaymentConfirmationEmail, sendAdminNotification } from "./email";

let _stripe: Stripe | null = null;

export function getStripe(runtimeEnv: RuntimeEnv = ENV): Stripe | null {
  if (!runtimeEnv.stripeSecretKey) {
    console.warn("[Stripe] No STRIPE_SECRET_KEY configured");
    return null;
  }
  if (!_stripe) {
    _stripe = new Stripe(runtimeEnv.stripeSecretKey, { apiVersion: "2025-03-31.basil" as any });
  }
  return _stripe;
}

export async function createCheckoutSession(
  userId: number,
  email: string,
  tier: SubscriptionTierKey,
  runtimeEnv: RuntimeEnv = ENV
): Promise<{ url: string } | { error: string }> {
  const stripe = getStripe(runtimeEnv);
  if (!stripe) return { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY." };

  const tierConfig = SUBSCRIPTION_TIERS[tier];
  if (!tierConfig) return { error: "Invalid subscription tier" };

  // Get or create Stripe customer
  const user = await db.getUserById(userId);
  if (!user) return { error: "User not found" };

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId: String(userId) },
    });
    customerId = customer.id;
    await db.updateUser(userId, { stripeCustomerId: customerId });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: tierConfig.stripePriceId, quantity: 1 }],
      success_url: `${runtimeEnv.appOrigin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${runtimeEnv.appOrigin}/subscribe?canceled=true`,
      metadata: {
        userId: String(userId),
        tier,
      },
      subscription_data: {
        metadata: {
          userId: String(userId),
          tier,
        },
      },
    });

    return { url: session.url! };
  } catch (error: any) {
    console.error("[Stripe] Checkout session error:", error);
    return { error: error.message || "Failed to create checkout session" };
  }
}

export async function createPortalSession(customerId: string, runtimeEnv: RuntimeEnv = ENV): Promise<{ url: string } | { error: string }> {
  const stripe = getStripe(runtimeEnv);
  if (!stripe) return { error: "Stripe is not configured" };

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${runtimeEnv.appOrigin}/courses`,
    });
    return { url: session.url };
  } catch (error: any) {
    return { error: error.message || "Failed to create portal session" };
  }
}

export async function handleWebhookEvent(body: Buffer, signature: string, envOverride?: Record<string, unknown> | RuntimeEnv): Promise<void> {
  const runtimeEnv = envOverride ? ("appOrigin" in (envOverride as any) ? envOverride as RuntimeEnv : createCloudflareEnv(envOverride as Record<string, unknown>)) : ENV;
  const stripe = getStripe(runtimeEnv);
  if (!stripe) throw new Error("Stripe not configured");

  let event: Stripe.Event;
  try {
    if (runtimeEnv.stripeWebhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, runtimeEnv.stripeWebhookSecret);
    } else if (runtimeEnv.nodeEnv === "production") {
      throw new Error("STRIPE_WEBHOOK_SECRET is required in production");
    } else {
      console.warn("[Stripe] STRIPE_WEBHOOK_SECRET missing in development; skipping signature verification");
      event = JSON.parse(body.toString()) as Stripe.Event;
    }
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = parseInt(session.metadata?.userId ?? "0");
      const tier = (session.metadata?.tier ?? "lower") as SubscriptionTierKey;
      if (userId) {
        await db.updateUser(userId, {
          subscriptionTier: tier,
          subscriptionStatus: "active",
          stripeSubscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
        });
        const user = await db.getUserById(userId);
        if (user?.email) {
          const tierConfig = SUBSCRIPTION_TIERS[tier];
          await sendPaymentConfirmationEmail(user.email, tierConfig.name, tierConfig.price);
          await sendAdminNotification(
            "New Subscription",
            `<p><strong>${user.email}</strong> subscribed to the <strong>${tierConfig.name}</strong> tier (€${tierConfig.price}/month).</p>`
          );
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = parseInt(subscription.metadata?.userId ?? "0");
      if (userId) {
        const status = subscription.status === "active" ? "active"
          : subscription.status === "past_due" ? "past_due"
          : subscription.status === "canceled" ? "canceled"
          : subscription.status === "trialing" ? "trialing"
          : "none";
        await db.updateUser(userId, { subscriptionStatus: status });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = parseInt(subscription.metadata?.userId ?? "0");
      if (userId) {
        await db.updateUser(userId, {
          subscriptionStatus: "canceled",
          subscriptionTier: "none",
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.toString();
      if (customerId) {
        await sendAdminNotification(
          "Payment Failed",
          `<p>Payment failed for customer <strong>${customerId}</strong>.</p>`
        );
      }
      break;
    }
  }
}

export async function getCustomerInvoices(customerId: string): Promise<Stripe.Invoice[]> {
  const stripe = getStripe();
  if (!stripe) return [];
  try {
    const invoices = await stripe.invoices.list({ customer: customerId, limit: 50 });
    return invoices.data;
  } catch {
    return [];
  }
}

export async function getAllInvoices(limit = 50): Promise<Stripe.Invoice[]> {
  const stripe = getStripe();
  if (!stripe) return [];
  try {
    const invoices = await stripe.invoices.list({ limit });
    return invoices.data;
  } catch {
    return [];
  }
}
