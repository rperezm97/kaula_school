import { handleWebhookEvent } from "../../../server/stripe";

export interface CloudflareEnv {
  [key: string]: unknown;
  APP_ORIGIN?: string;
  NODE_ENV?: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ADMIN_EMAIL?: string;
}

export const onRequestPost: PagesFunction<CloudflareEnv> = async (context) => {
  try {
    const signature = context.request.headers.get("stripe-signature") ?? "";
    const rawBody = await context.request.arrayBuffer();
    await handleWebhookEvent(Buffer.from(rawBody), signature, context.env);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Stripe Webhook] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
