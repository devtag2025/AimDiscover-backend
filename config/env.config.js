import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
];

const optionalEnvVars = [
  // Google OAuth (optional)
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "OAUTH_REDIRECT_URI",
  "ENCRYPTION_KEY_B64",
  // URLs (optional)
  "CLIENT_URL",
  "ADMIN_PANEL_URL",
  "EMAIL_VERIFICATION_SECRET",
  // Email Configuration (optional)
  "FROM_NAME",
  "FROM_EMAIL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  // Stripe (optional)
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  // Admin User (optional)
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "COOKIE_SECRET",
  "RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_MAX_REQUESTS",
  "OPENAI_API_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET"
];

const missingVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingVars.length > 0) {
  console.error("Missing required environment variables:");
  missingVars.forEach(key => console.error(`- ${key}`));
  process.exit(1);
}

optionalEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Optional env variable not set: ${key} (using default)`);
  }
});

if (process.env.NODE_ENV === "production") {
  const productionRequiredVars = ["JWT_SECRET", "COOKIE_SECRET"];
  const missingProdVars = productionRequiredVars.filter(key => !process.env[key]);

  if (missingProdVars.length > 0) {
    console.error("Missing required production environment variables:");
    missingProdVars.forEach(key => console.error(`- ${key}`));
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET must be at least 32 characters in production");
    process.exit(1);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT) || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  DB_NAME: process.env.DB_NAME || "aimdiscover_db",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  OAUTH_REDIRECT_URI: process.env.OAUTH_REDIRECT_URI,
  GOOGLE_SCOPES: process.env.GOOGLE_SCOPES || "openid email profile",

  // JWT & Security
  JWT_SECRET: process.env.JWT_SECRET || "dev-jwt-secret-change-in-production",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "dev-cookie-secret-change-in-production",
  ENCRYPTION_KEY_B64: process.env.ENCRYPTION_KEY_B64,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "1m",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  EMAIL_VERIFICATION_SECRET: process.env.EMAIL_VERIFICATION_SECRET,

  // App URLs
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  ADMIN_PANEL_URL: process.env.ADMIN_PANEL_URL || "http://localhost:3001",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Stripe Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_NAME: process.env.FROM_NAME,
  FROM_EMAIL: process.env.FROM_EMAIL,

  // Admin User (created on startup if none exist)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  // AI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // AWS Configuration
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,


  //Grok API Key
  GROK_API_KEY:process.env.Grok_Api_Key,
  // Feature Flags
  ENABLE_API_DOCS: process.env.ENABLE_API_DOCS === "true" || process.env.NODE_ENV !== "production",
};