import { ENV } from "./_core/env";
import * as db from "./db";

function appUrl(path: string): string {
  return `${ENV.appOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

// Resend API integration
// When RESEND_API_KEY is not set, emails are logged but not sent

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  templateName?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, templateName } = options;

  if (!ENV.resendApiKey) {
    console.log(`[Email] No RESEND_API_KEY set. Would send to ${to}: ${subject}`);
    await db.logEmail(to, subject, templateName ?? "unknown", "pending", "No API key configured");
    return true;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.resendFromEmail,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Email] Failed to send: ${error}`);
      await db.logEmail(to, subject, templateName ?? "unknown", "failed", error);
      return false;
    }

    await db.logEmail(to, subject, templateName ?? "unknown", "sent");
    return true;
  } catch (error) {
    console.error("[Email] Error:", error);
    await db.logEmail(to, subject, templateName ?? "unknown", "failed", String(error));
    return false;
  }
}

// ─── Email Templates ─────────────────────────────────────────────────

const baseStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #0a1628;
  color: #e0e8f0;
  padding: 40px 30px;
  border-radius: 12px;
`;

const headerStyle = `
  text-align: center;
  color: #7dd3fc;
  font-size: 24px;
  margin-bottom: 20px;
  letter-spacing: 2px;
`;

const buttonStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0a1628;
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin: 20px 0;
`;

export async function sendWelcomeEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to Kaula School — Feral Awareness",
    templateName: "welcome",
    html: `
      <div style="${baseStyle}">
        <h1 style="${headerStyle}">KAULA SCHOOL</h1>
        <p>Namaste${name ? ` ${name}` : ""},</p>
        <p>Welcome to the Kaula School of Feral Awareness. You have taken the first step on a path rooted in the Kashmir Shaivism tradition — 6,000 years of radical nondual practice.</p>
        <p>This is not comfortable spirituality. This is the real work.</p>
        <p>To access the full course library, please choose a subscription tier that resonates with your capacity to support this work.</p>
        <a href="${appUrl("/subscribe")}" style="${buttonStyle}">Choose Your Path</a>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 30px;">With fierce compassion,<br/>Feral Awareness</p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail(email: string, tierName: string, amount: number) {
  return sendEmail({
    to: email,
    subject: `Payment Confirmed — ${tierName} Tier — Kaula School`,
    templateName: "payment_confirmation",
    html: `
      <div style="${baseStyle}">
        <h1 style="${headerStyle}">PAYMENT CONFIRMED</h1>
        <p>Your subscription to the <strong>${tierName}</strong> tier has been activated.</p>
        <p>Amount: <strong>€${amount}/month</strong></p>
        <p>You now have full access to the course library. Begin your practice.</p>
        <a href="${appUrl("/courses")}" style="${buttonStyle}">Enter the School</a>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 30px;">Feral Awareness — Kaula School</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: "Password Reset — Kaula School",
    templateName: "password_reset",
    html: `
      <div style="${baseStyle}">
        <h1 style="${headerStyle}">PASSWORD RESET</h1>
        <p>You requested a password reset for your Kaula School account.</p>
        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendSubscriptionReminderEmail(email: string, daysLeft: number) {
  return sendEmail({
    to: email,
    subject: `Subscription Reminder — ${daysLeft} days remaining`,
    templateName: "subscription_reminder",
    html: `
      <div style="${baseStyle}">
        <h1 style="${headerStyle}">SUBSCRIPTION REMINDER</h1>
        <p>Your Kaula School subscription will renew in <strong>${daysLeft} days</strong>.</p>
        <p>If you wish to change your tier or cancel, you can do so from your account settings.</p>
        <a href="${appUrl("/settings")}" style="${buttonStyle}">Manage Subscription</a>
      </div>
    `,
  });
}

export async function sendAdminNotification(subject: string, content: string) {
  return sendEmail({
    to: ENV.adminEmail,
    subject: `[Admin] ${subject}`,
    templateName: "admin_notification",
    html: `
      <div style="${baseStyle}">
        <h1 style="${headerStyle}">ADMIN NOTIFICATION</h1>
        <div>${content}</div>
        <a href="${appUrl("/admin")}" style="${buttonStyle}">Go to Admin Panel</a>
      </div>
    `,
  });
}
