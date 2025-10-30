import { env } from './env.config.js';

/**
 * Get Google OAuth configuration
 */
export async function getGoogleConfig() {
  return {
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
  };
}

