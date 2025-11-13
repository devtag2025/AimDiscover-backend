import * as openid from "openid-client";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getGoogleConfig, env } from "../config/index.js";
import { ApiResponse, ApiError } from "../utils/index.js";
import { userService } from "../services/user.service.js";
import { emailService } from "../services/email.service.js";
import bcrypt from "bcryptjs";
import {
  handleRedirect,
  validateCallbackParams,
  exchangeCodeForTokens,
  fetchUserProfile,
  generateRandomPassword,
  clearAuthCookies,
} from "../helpers/auth.helper.js";
import { DashboardService } from "../services/dashboard.service.js";
import { sql,gte } from "drizzle-orm";
import { log } from "console";
import passport from "../config/passport.config.js";
const isProduction = process.env.NODE_ENV === "production";

// Helper to set auth tokens
const setAuthTokens = (res, user) => {
  const accessToken = userService.generateAccessToken(user);
  const refreshToken = userService.generateRefreshToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: false,
    secure: isProduction ? true : false, // only true in prod
    sameSite: isProduction ? "none" : "lax", // 'none' for HTTPS, 'lax' for localhost
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction ? true : false,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return { accessToken };
};

// Helper to upsert user for Google OAuth
// const upsertUser = async (profile, tokens) => {
//   if (!profile?.sub || !profile?.email) {
//     throw new Error('Invalid Google profile data');
//   }

//   const userByGoogleId = await userService.findByGoogleId(profile.sub);
//   const userByEmail = await userService.findByEmail(profile.email);

//   let user = userByGoogleId || userByEmail;

//   if (!user) {
//     // Create new user
//     user = await userService.create({
//       google_id: profile.sub,
//       email: profile.email,
//       name: profile.name,
//       picture: profile.picture,
//       is_email_verified: true
//     });
//   } else {
//     // Update existing user
//     if (userByEmail && user.email !== profile.email) {
//       throw new Error('Email linked to different Google account');
//     }

//     user = await userService.update(user.id, {
//       google_id: profile.sub,
//       email: profile.email,
//       name: user.name || profile.name,
//       picture: user.picture || profile.picture,
//       is_email_verified: true,
//     });
//   }

//   if (tokens?.refresh_token) {
//     const encryptedRefreshToken = userService.encryptRefreshToken(tokens.refresh_token);
//     user = await userService.update(user.id, {
//       refresh_token_enc: encryptedRefreshToken
//     });
//   }

//   return user;
// };

export const signup = async (req, res, next) => {
  console.log("signUp request", req.body);

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email and password required"));
    }

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "User already exists"));
    }

    const hashedPassword = await userService.hashPassword(password);
    const emailToken = jwt.sign({ email }, env.EMAIL_VERIFICATION_SECRET, {
      expiresIn: "24h",
    });
    console.log("email verification token", emailToken);

    const user = await userService.create({
      google_id: null,
      email,
      password: hashedPassword,
      name,
      is_email_verified: false,
      email_verification_token: emailToken,
      email_verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    console.log("new user created", user);

    await emailService.sendEmailVerification(email, emailToken, {
      userName: name,
    });

    res
      .status(201)
      .json(
        new ApiResponse(201, { userId: user.id }, "User created successfully")
      );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email and password required"));
    }

    const user = await userService.findByEmail(email);
    if (!user || !user.password) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid credentials"));
    }

    const isPasswordCorrect = await userService.comparePassword(
      password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid credentials"));
    }

    if (!user.is_email_verified) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Please verify your email first"));
    }

    const { accessToken } = setAuthTokens(res, user);

    res.json(new ApiResponse(200, { user, accessToken }, "Login successful"));
  } catch (error) {
    next(error);
  }
};

export const adminCreateUser = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email and name are required"));
    }

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "User already exists"));
    }

    const generatedPassword = generateRandomPassword();
    const hashedPassword = await userService.hashPassword(generatedPassword);

    const user = await userService.create({
      google_id: null,
      email,
      password: hashedPassword,
      name,
      user_type: "user",
      is_email_verified: true,
    });

    res.status(201).json(
      new ApiResponse(
        201,
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          user_type: user.user_type,
          is_email_verified: user.is_email_verified,
          message: "User created and credentials sent",
        },
        "User created successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Verification token required"));
    }

    const decoded = userService.verifyToken(
      token,
      env.EMAIL_VERIFICATION_SECRET
    );
    const user = await userService.findByEmail(decoded.email);

    if (!user || user.email_verification_token !== token) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid or expired token"));
    }

    await userService.update(user.id, {
      is_email_verified: true,
      email_verification_token: null,
      email_verification_expires: null,
    });

    res.json(new ApiResponse(200, null, "Email verified successfully"));
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Verification token expired"));
    }
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email is required"));
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      return res.json(
        new ApiResponse(
          200,
          null,
          "If an account exists, a verification email was sent"
        )
      );
    }

    if (user.is_email_verified) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email is already verified"));
    }

    const emailToken = userService.generateEmailVerificationToken(user);

    await emailService.sendEmailVerification(email, emailToken, {
      userName: user.name,
    });

    res.json(
      new ApiResponse(
        200,
        null,
        "Verification email sent if the account exists"
      )
    );
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(new ApiResponse(400, null, "Email required"));
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      return res.json(
        new ApiResponse(200, null, "If email exists, reset link sent")
      );
    }

    const resetToken = userService.generatePasswordResetToken();
    await userService.update(user.id, {
      reset_password_token: resetToken,
      reset_password_expires: new Date(Date.now() + 3600000),
    });

    await emailService.sendPasswordResetEmail(email, resetToken, {
      userName: user.name,
    });

    res.json(new ApiResponse(200, null, "If email exists, reset link sent"));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Token and password required"));
    }

    const user = await userService.findByResetToken(token);

    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid or expired reset token"));
    }

    if (
      user.reset_password_expires &&
      user.reset_password_expires < new Date()
    ) {
      return res.status(400).json(new ApiResponse(400, null, "Token expired"));
    }

    const hashedPassword = await userService.hashPassword(password);
    await userService.update(user.id, {
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
    });

    res.json(new ApiResponse(200, null, "Password reset successful"));
  } catch (error) {
    next(error);
  }
};

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  accessType: "offline",
  prompt: "consent",
});

// export const googleCallback = (req, res, next) => {
//   console.log('🔵 Google OAuth callback hit');

//   passport.authenticate('google', { session: false }, (err, user, info) => {
//     clearAuthCookies(res);

//     if (err || !user) {
//       const errorMessage = err?.message || 'Authentication failed';
//       console.error('❌ OAuth failed:', errorMessage);
//       const redirectUrl = `${env.FRONTEND_URL}/auth/callback?success=false&error=${encodeURIComponent(errorMessage)}`;
//       return res.redirect(redirectUrl);
//     }

//     try {
//       const { accessToken } = setAuthTokens(res, user);
//       console.log('✅ OAuth successful for:', user.email);
//       const redirectUrl = `${env.FRONTEND_URL}/auth/callback?success=true&token=${accessToken}`;
//       return res.redirect(redirectUrl);
//     } catch (error) {
//       console.error('❌ Token generation error:', error);
//       const redirectUrl = `${env.FRONTEND_URL}/auth/callback?success=false&error=${encodeURIComponent(error.message)}`;
//       return res.redirect(redirectUrl);
//     }
//   })(req, res, next);
// };

export const googleCallback = (req, res, next) => {
  console.log("🔵 Google OAuth callback hit");

  passport.authenticate("google", { session: false }, (err, user, info) => {
    clearAuthCookies(res);

    if (err || !user) {
      const errorMessage = err?.message || "Authentication failed";
      console.error("❌ OAuth failed:", errorMessage);
      const redirectUrl = `${env.FRONTEND_URL}/auth/callback?success=false&error=${encodeURIComponent(errorMessage)}`;
      return res.redirect(redirectUrl);
    }

    try {
      const { accessToken } = setAuthTokens(res, user);
      console.log("✅ OAuth successful for:", user.email);
      const redirectUrl = `${env.FRONTEND_URL}/auth/callback?success=true&token=${accessToken}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Token generation error:", error);
      const redirectUrl = `${env.FRONTEND_URL}/auth/callback?success=false&error=${encodeURIComponent(error.message)}`;
      return res.redirect(redirectUrl);
    }
  })(req, res, next);
};

export const getProfile = async (req, res, next) => {
  try {

   
    const user = await userService.findById(req.user.id);

    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const hasPassword = Boolean(user.password);

    // Get subscription status (if needed)
    // const subscription = await subscriptionService.getCurrentSubscription(user.id);
    // const isSubscribed = subscription?.isActive() || false;

    // Remove sensitive fields
    const {
      password,
      refresh_token_enc,
      email_verification_token,
      reset_password_token,
      ...userObj
    } = user;

    res.json(
      new ApiResponse(
        200,
        {
          user: {
            ...userObj,
            hasPassword,
          },
        },
        "Profile retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const clearOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    res.clearCookie("accessToken", clearOptions);
    res.clearCookie("refreshToken", clearOptions);
    res.clearCookie("g_state", clearOptions);
    res.clearCookie("g_pkce", clearOptions);

    res.json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await userService.findById(req.user.id);

    if (email && email !== user.email) {
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Email already exists"));
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const updatedUser = await userService.update(user.id, updates);
    const { password, refresh_token_enc, ...userResponse } = updatedUser;

    res.json(new ApiResponse(200, userResponse, "Profile updated"));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await userService.findById(req.user.id);

    if (user.google_id && !user.password) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Google users cannot change password")
        );
    }

    if (!(await userService.comparePassword(currentPassword, user.password))) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Current password incorrect"));
    }

    const isSame = await userService.comparePassword(
      newPassword,
      user.password
    );
    if (isSame) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "New password must be different"));
    }

    const hashedPassword = await userService.hashPassword(newPassword);
    await userService.update(user.id, { password: hashedPassword });

    res.json(new ApiResponse(200, null, "Password changed"));
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    const data = await userService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
      search,
      role,
    });

    res.json(new ApiResponse(200, data, "Users retrieved successfully"));
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && req.user.user_type !== "admin") {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "You can only delete your own account")
        );
    }

    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    await userService.delete(userId);

    const result = {
      success: true,
      message: "User account and all associated data deleted successfully",
      deletedAt: new Date().toISOString(),
    };

    res.json(new ApiResponse(200, result, "User account deleted successfully"));
  } catch (error) {
    next(new ApiError(500, "Failed to delete user account", error.message));
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && req.user.user_type !== "admin") {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "You can only view your own statistics")
        );
    }

    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const stats = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    };

    res.json(
      new ApiResponse(200, stats, "User statistics retrieved successfully")
    );
  } catch (error) {
    next(new ApiError(500, "Failed to get user statistics", error.message));
  }
};

export const getDashboardStats = async (req, res, next) => {
  await DashboardService.DashboardStats(req, res, next);
};



  


export const refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  try {
    if (!refreshToken) {
      res
        .status(401)
        .json(new ApiResponse(401, null, "No refresh token has been provided"));
    }

    try {
      let decoded;
      decoded = jwt.verify(refreshToken, env.ACCESS_TOKEN_SECRET);
      console.log(decoded, "This is the token");
    } catch (error) {
      res
        .status(403)
        .json(new ApiResponse(403, null, "Invalid or Expired Refresh Token"));
    }

    const user = userService.findById(decoded.id);

    if (!user) {
      res
        .status(404)
        .json(new ApiResponse(404, null, "The user has not been found"));
    }

    const newAccessToken = userService.generateAccessToken(user);

    const isProduction = env.NODE_ENV === "production";

    res.cookie("accessToken", newAccessToken, {
      httpOnly: false, 
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, 
      path: "/",
    });

    return res.json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken },
        "Access token refreshed successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};
