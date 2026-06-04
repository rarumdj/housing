import { env } from './env';

const TERMII_BASE = 'https://api.ng.termii.com/api';

export const sendSms = async (to: string, message: string) => {
  if (!env.termii.apiKey) {
    console.info('[sms] Termii not configured. SMS not sent. Preview:', { to, message });
    return { delivered: false as const };
  }

  const res = await fetch(`${TERMII_BASE}/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      from: env.termii.senderId,
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: env.termii.apiKey,
    }),
  });

  return { delivered: res.ok };
};

export const sendOtpSms = async (to: string, code: string) => {
  return sendSms(to, `Your HouseHunt verification code is ${code}. It expires in 10 minutes.`);
};
