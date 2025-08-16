import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLink(to, url, quizTitle){
  return await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject: `Your quiz link: ${quizTitle}`,
    html: `<p>Here is your timed quiz link:</p><p><a href="${url}">${url}</a></p><p>Good luck.</p>`
  });
}
