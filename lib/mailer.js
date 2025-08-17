// No-op unless RESEND_API_KEY exists (domain/email not required)
async function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  try { const { Resend } = await import("resend"); return new Resend(key); }
  catch { return null; }
}
export async function sendMagicLink(to, url, quizTitle) {
  const resend = await getResend();
  if (!resend) return { data: null, error: "Email disabled (no RESEND_API_KEY)" };
  try {
    const from = process.env.FROM_EMAIL || "noreply@example.com";
    return await resend.emails.send({ from, to, subject: `Your quiz link: ${quizTitle}`, html: `<a href="${url}">${url}</a>` });
  } catch (e) { return { data: null, error: e?.message || "send failed" }; }
}

