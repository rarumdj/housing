import { env } from './env';

const BASE = 'https://api.flutterwave.com/v3';

interface FlutterwaveResponse {
  status: 'success' | 'error';
  message: string;
  data: Record<string, unknown>;
}

const flutterwaveFetch = async (path: string, options?: RequestInit): Promise<FlutterwaveResponse> => {
  if (!env.flutterwave.secretKey) {
    if (path.startsWith('/payments')) {
      const payload = JSON.parse(String(options?.body || '{}')) as { tx_ref?: string };
      return {
        status: 'success',
        message: 'Flutterwave not configured. Returned mock checkout URL.',
        data: {
          link: `https://flutterwave.local/checkout/${payload.tx_ref || 'househunt'}`,
        },
      };
    }

    if (path.startsWith('/transactions') && path.includes('/verify')) {
      return {
        status: 'success',
        message: 'Flutterwave not configured. Returned mock success verification.',
        data: { status: 'successful' },
      };
    }

    if (path.startsWith('/subaccounts')) {
      return {
        status: 'success',
        message: 'Flutterwave not configured. Returned mock subaccount.',
        data: { subaccount_id: `MOCK_FLW_SUB_${Date.now()}` },
      };
    }

    return {
      status: 'success',
      message: 'Flutterwave not configured. Returned mock response.',
      data: {},
    };
  }

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${env.flutterwave.secretKey}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });

  return res.json() as Promise<FlutterwaveResponse>;
};

export const flutterwave = {
  initializeTransaction: (params: {
    email: string;
    amount: number;
    reference: string;
    metadata?: Record<string, unknown>;
    callback_url?: string;
  }) =>
    flutterwaveFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        tx_ref: params.reference,
        amount: params.amount / 100,
        currency: 'NGN',
        redirect_url: params.callback_url,
        customer: { email: params.email },
        meta: params.metadata,
      }),
    }),

  verifyTransaction: (reference: string) =>
    flutterwaveFetch(`/transactions/${encodeURIComponent(reference)}/verify`),

  createSubaccount: (params: {
    account_bank: string;
    account_number: string;
    business_name: string;
    business_email?: string;
  }) =>
    flutterwaveFetch('/subaccounts', {
      method: 'POST',
      body: JSON.stringify({
        account_bank: params.account_bank,
        account_number: params.account_number,
        business_name: params.business_name,
        business_email: params.business_email,
        country: 'NG',
        split_type: 'percentage',
        split_value: 0.9,
      }),
    }),
};
