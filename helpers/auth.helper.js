import { env } from "../config/index.js";
import * as openid from "openid-client";
import { userService } from "../services/user.service.js";

export const handleRedirect = (res, success = true, error = null, accessToken = null) => {
  let redirectUrl;
  
  if (success && accessToken) {
    const encodedToken = encodeURIComponent(accessToken);
    redirectUrl = `${env.CLIENT_URL}/onboarding?accessToken=${encodedToken}&status=success`;
  } else {
    const errorParam = error ? `&error=${encodeURIComponent(error)}` : '';
    redirectUrl = `${env.CLIENT_URL}/auth?status=error${errorParam}`;
  }

  res.redirect(redirectUrl);
};

export const exchangeCodeForTokens = async (config, req, codeVerifier, state) => {
  const callbackUrl = new URL(req.originalUrl, `${req.protocol}://${req.get("host")}`);

  const tokens = await openid.authorizationCodeGrant(config, callbackUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedState: state,
  });

  if (!tokens?.access_token) {
    throw new Error("No access token received from Google");
  }

  return tokens;
};

export const validateCallbackParams = (req) => {
  const { code, state } = req.query;
  const cookieState = req.cookies?.g_state;
  const codeVerifier = req.cookies?.g_pkce;

  if (!code || !state) {
    throw new Error("Missing authorization code or state parameter");
  }

  if (!cookieState || !codeVerifier) {
    throw new Error("Missing required cookies");
  }

  if (cookieState !== state) {
    throw new Error("State parameter mismatch");
  }

  return { code, state, codeVerifier };
};

export const clearAuthCookies = (res) => {
  res.clearCookie("g_state");
  res.clearCookie("g_pkce");
};

export const fetchUserProfile = async (config, accessToken) => {
  const profile = await openid.fetchUserInfo(config, accessToken, openid.skipSubjectCheck);

  if (!profile?.sub || !profile?.email) {
    throw new Error("Incomplete user profile received from Google");
  }

  return profile;
};

export const generateRandomPassword = () => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  for (let i = 0; i < 8; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  return password;
};
