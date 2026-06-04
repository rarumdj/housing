import { paystack } from './paystack';
import { flutterwave } from './flutterwave';

export type PaymentProvider = 'paystack' | 'flutterwave';

export interface CheckoutParams {
  email: string;
  amount: number; // in kobo (NGN * 100)
  reference: string;
  metadata?: Record<string, unknown>;
  callback_url?: string;
}

export interface CheckoutResult {
  authorizationUrl: string;
  reference: string;
  provider: PaymentProvider;
}

export interface PayoutAccountParams {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  businessEmail?: string;
}

export interface PayoutAccountResult {
  provider: PaymentProvider;
  subaccountCode: string;
}

export const initializeCheckout = async (provider: PaymentProvider, params: CheckoutParams): Promise<CheckoutResult> => {
  if (provider === 'flutterwave') {
    const res = await flutterwave.initializeTransaction(params);
    if (res.status !== 'success') {
      throw new Error('Flutterwave checkout initialization failed');
    }
    return {
      authorizationUrl: String(res.data.link || ''),
      reference: params.reference,
      provider,
    };
  }

  const res = await paystack.initializeTransaction(params);
  if (!res.status) {
    throw new Error('Paystack checkout initialization failed');
  }
  return {
    authorizationUrl: String(res.data.authorization_url || ''),
    reference: params.reference,
    provider,
  };
};

export const verifyCheckout = async (provider: PaymentProvider, reference: string): Promise<boolean> => {
  if (provider === 'flutterwave') {
    const res = await flutterwave.verifyTransaction(reference);
    return res.status === 'success' && res.data.status === 'successful';
  }

  const res = await paystack.verifyTransaction(reference);
  return Boolean(res.status) && res.data.status === 'success';
};

export const createPayoutAccount = async (provider: PaymentProvider, params: PayoutAccountParams): Promise<PayoutAccountResult> => {
  if (provider === 'flutterwave') {
    const res = await flutterwave.createSubaccount({
      account_bank: params.bankCode,
      account_number: params.accountNumber,
      business_name: params.businessName,
      business_email: params.businessEmail,
    });
    if (res.status !== 'success') {
      throw new Error('Flutterwave subaccount creation failed');
    }
    return { provider, subaccountCode: String(res.data.subaccount_id || '') };
  }

  const res = await paystack.createSubaccount({
    business_name: params.businessName,
    settlement_bank: params.bankCode,
    account_number: params.accountNumber,
  });
  if (!res.status) {
    throw new Error('Paystack subaccount creation failed');
  }
  return { provider, subaccountCode: String(res.data.subaccount_code || '') };
};
