import { z } from "zod";

export class EmailDeliveryError extends Error {
  constructor() {
    super("The school email service could not accept this message.");
    this.name = "EmailDeliveryError";
  }
}

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const TEST_EMAIL_KEY = "playwright-test-email-key-not-for-deployment";

function requiredEmailConfig() {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;
  const admissionsInbox = process.env.ADMISSIONS_EMAIL;

  if (!apiKey || !from || !admissionsInbox || !z.email().safeParse(admissionsInbox).success) {
    throw new EmailDeliveryError();
  }

  return { apiKey, from, admissionsInbox };
}

export function assertEmailConfigured() {
  requiredEmailConfig();
}

export async function sendResendBatch(messages: readonly EmailMessage[]) {
  const { apiKey, from } = requiredEmailConfig();
  if (
    process.env.NODE_ENV !== "production" &&
    apiKey === TEST_EMAIL_KEY
  ) {
    return;
  }

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        messages.map((message) => ({
          from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          html: message.html,
        })),
      ),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new EmailDeliveryError();
  }

  if (!response.ok) throw new EmailDeliveryError();
}

export async function sendApplicationEmails(
  guardianEmail: string,
  reference: string,
) {
  const { admissionsInbox } = requiredEmailConfig();
  const referenceHtml = escapeHtml(reference);
  const referenceText = reference;
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/applications`;

  await sendResendBatch([
    {
      to: guardianEmail,
      subject: "Application received",
      text: `Thank you for contacting St. Joseph's College, Ombaci. Your application reference is ${referenceText}. Please keep this reference when contacting the school. The school will review your submission.`,
      html: `<p>Thank you for contacting St. Joseph's College, Ombaci.</p><p>Your application reference is <strong>${referenceHtml}</strong>. Please keep this reference when contacting the school.</p><p>The school will review your submission.</p>`,
    },
    {
      to: admissionsInbox,
      subject: "New online application received",
      text: `A new online application has been received. Reference: ${referenceText}. Sign in to the admin to review it: ${adminUrl}`,
      html: `<p>A new online application has been received.</p><p>Reference: <strong>${referenceHtml}</strong></p><p><a href="${escapeHtml(adminUrl)}">Sign in to review the application</a></p>`,
    },
  ]);
}

export async function sendEnquiryEmail(fields: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const { admissionsInbox } = requiredEmailConfig();
  const content = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone || "Not provided"}`,
    "",
    fields.message,
  ].join("\n");
  const html = `<dl><dt>Name</dt><dd>${escapeHtml(fields.name)}</dd><dt>Email</dt><dd>${escapeHtml(fields.email)}</dd><dt>Phone</dt><dd>${escapeHtml(fields.phone || "Not provided")}</dd></dl><p>${escapeHtml(fields.message).replaceAll("\n", "<br>")}</p>`;

  await sendResendBatch([
    {
      to: admissionsInbox,
      subject: `Website enquiry: ${fields.subject}`,
      text: content,
      html,
    },
  ]);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}
