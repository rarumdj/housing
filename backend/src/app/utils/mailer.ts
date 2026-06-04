import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env';

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (transporter) return transporter;
  if (!env.smtp.host) return null;

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
  });

  return transporter;
};

export const sendMail = async (options: { to: string; subject: string; html: string; text?: string }) => {
  const tx = getTransporter();

  if (!tx) {
    // Dev / unconfigured fallback: log the email so flows remain testable.
    console.info('[mailer] SMTP not configured. Email not sent. Preview:', {
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
    return { delivered: false as const };
  }

  await tx.sendMail({
    from: env.smtp.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return { delivered: true as const };
};

export const sendVerificationEmail = async (to: string, firstName: string, verifyUrl: string) => {
  const subject = 'Verify your HouseHunt email';
  const text = `Hi ${firstName}, confirm your email to activate your HouseHunt account: ${verifyUrl}`;
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#111;">Welcome to HouseHunt, ${firstName}!</h2>
      <p style="color:#444; line-height:1.5;">
        Confirm your email address to activate your account. This link expires in 24 hours.
      </p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background:#e85d2f; color:#fff; padding:12px 24px; border-radius:10px; text-decoration:none; font-weight:600;">
          Verify email
        </a>
      </p>
      <p style="color:#888; font-size:13px;">
        If the button doesn't work, paste this link into your browser:<br/>
        <a href="${verifyUrl}">${verifyUrl}</a>
      </p>
    </div>
  `;

  return sendMail({ to, subject, html, text });
}
