type MailPayload = {
  to: string;
  subject: string;
  text: string;
};

export async function sendAuthEmail(payload: MailPayload): Promise<{ sent: boolean }> {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  if (!host || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[auth-mail] SMTP is not configured. Message for ${payload.to}: ${payload.subject}`);
    }
    return { sent: false };
  }

  try {
    const response = await fetch(process.env.SMTP_WEBHOOK_URL ?? "", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, from, host }),
    });
    return { sent: response.ok };
  } catch {
    return { sent: false };
  }
}
