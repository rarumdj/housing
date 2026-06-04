export const AuthApiKeys = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  emailIntent: '/auth/email-verification/intent',
  confirmEmail: '/auth/email-verification/confirm',
} as const;

export const AuthKeys = {
  tokenStorage: 'hh-auth',
  lastSignedOutUserEmail: 'hh-last-signed-out-user-email',
} as const;

export const StorageTypes = {
  local: 'local',
  session: 'session',
} as const;
