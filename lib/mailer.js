import { Resend } from "resend";

// Handle missing environment variables gracefully during build
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendMagicLink(to, url, quizTitle){
  if (!resend) {
    throw new Error("Email service not configured");
  }
  
  return await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject: `Your quiz link: ${quizTitle}`,
    html: `<p>Here is your timed quiz link:</p><p><a href="${url}">${url}</a></p><p>Good luck.</p>`
  });
}
