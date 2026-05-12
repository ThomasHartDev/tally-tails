// TODO(phase-2): rewire env access through Hydrogen loader context
// (`context.env`) instead of process.env.
const env = () => ({
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_ADDRESS: process.env.RESEND_FROM_ADDRESS,
});
const integrations = () => ({
  resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_ADDRESS),
});

export type SendResult = { status: "ok"; id: string } | { status: "not-configured" } | { status: "error"; message: string };

/**
 * Resend transactional email wrapper. Inert without RESEND_API_KEY +
 * RESEND_FROM_ADDRESS. In a wired-up deployment, used for order
 * confirmations and waitlist confirmations.
 */
export async function sendTransactional(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendResult> {
  if (!integrations().resend) return { status: "not-configured" };
  const e = env();
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${e.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: e.RESEND_FROM_ADDRESS,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    const json = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) return { status: "error", message: json.message ?? `Resend ${res.status}` };
    return { status: "ok", id: json.id! };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Resend error" };
  }
}
