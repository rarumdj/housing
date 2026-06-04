export const LandlordApiKeys = {
  me: '/landlords/me',
  onboarding: '/landlords/me/onboarding',
  completeOnboarding: '/landlords/me/onboarding/complete',
  sendPhoneOtp: '/landlords/me/phone/send-otp',
  verifyPhoneOtp: '/landlords/me/phone/verify-otp',
  connectPayout: '/landlords/me/payout/connect',
  documents: '/landlords/me/documents',
} as const;

export const LandlordQueryKeys = {
  onboarding: 'landlord-onboarding',
} as const;
