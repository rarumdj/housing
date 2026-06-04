import { env } from './env';

const BASE = 'https://api.paystack.co';

interface PaystackResponse {
  status: boolean;
  message: string;
  data: Record<string, unknown>;
}

const paystackFetch = async (path: string, options?: RequestInit): Promise<PaystackResponse> => {
  if (!env.paystack.secretKey) {
    if (path.startsWith('/transaction/initialize')) {
      const payload = JSON.parse(String(options?.body || '{}')) as { reference?: string };

      return {
        status: true,
        message: 'Paystack not configured. Returned mock checkout URL.',
        data: {
          authorization_url: `https://paystack.local/checkout/${payload.reference || 'househunt'}`,
          access_code: 'mock_access_code',
          reference: payload.reference,
        },
      };
    }

    if (path.startsWith('/transaction/verify/')) {
      return {
        status: true,
        message: 'Paystack not configured. Returned mock success verification.',
        data: { status: 'success' },
      };
    }

    if (path.startsWith('/subaccount')) {
      return {
        status: true,
        message: 'Paystack not configured. Returned mock subaccount.',
        data: { subaccount_code: `ACCT_MOCK_${Date.now()}` },
      };
    }

    return {
      status: true,
      message: 'Paystack not configured. Returned mock response.',
      data: {},
    };
  }

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${env.paystack.secretKey}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });

  return res.json() as Promise<PaystackResponse>;
};

export const paystack = {
  initializeTransaction: (params: {
    email: string;
    amount: number;
    reference: string;
    metadata?: Record<string, unknown>;
    callback_url?: string;
  }) => paystackFetch('/transaction/initialize', { method: 'POST', body: JSON.stringify(params) }),

  verifyTransaction: (reference: string) => paystackFetch(`/transaction/verify/${reference}`),

  createSubaccount: (params: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge?: number;
  }) =>
    paystackFetch('/subaccount', {
      method: 'POST',
      body: JSON.stringify({ percentage_charge: 10, ...params }),
    }),
};
