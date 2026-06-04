import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  database: {
    name: process.env.DATABASE || 'house_hunt',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: (process.env.DB_DIALECT || 'mysql') as 'mysql',
  },
  redis: {
    url: process.env.REDIS_URL || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change_me_access',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_me_refresh',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
  cloudinary: {
    url: process.env.CLOUDINARY_URL || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    preset: process.env.CLOUDINARY_PRESET || '',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  },
  flutterwave: {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
    secretHash: process.env.FLUTTERWAVE_SECRET_HASH || '',
  },
  paymentProvider: (process.env.PAYMENT_PROVIDER || 'paystack') as 'paystack' | 'flutterwave',
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    from: process.env.SENDGRID_FROM || 'noreply@househunt.ng',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    secure: process.env.SMTP_SECURE === 'true',
    from: process.env.MAIL_FROM || process.env.SENDGRID_FROM || 'noreply@househunt.ng',
  },
  termii: {
    apiKey: process.env.TERMII_API_KEY || '',
    senderId: process.env.TERMII_SENDER_ID || 'HouseHunt',
  },
  mono: {
    secretKey: process.env.MONO_SECRET_KEY || '',
  },
  video: {
    nonceSecret: process.env.VIDEO_NONCE_SECRET || 'change_me_nonce',
    gpsTolerance: Number(process.env.GPS_TOLERANCE_METERS || 200),
  },
} as const;
