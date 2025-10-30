import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { userService } from "../services/user.service.js";
import { env } from "../config/env.config.js";

export const auth = async (req, res, next) => {
  const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
  if (!token) return next(new ApiError(401, "Unauthorized – no token provided"));

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    req.user = await userService.findById(decoded.id);
    if (!req.user) throw new ApiError(401, "User not found");
    
    // Remove sensitive fields
    delete req.user.password;
    delete req.user.refresh_token_enc;
    delete req.user.email_verification_token;
    delete req.user.reset_password_token;
    
    return next();
  } catch (err) {
    if (err?.name !== "TokenExpiredError") return next(new ApiError(401, "Invalid access token"));

    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) return next(new ApiError(401, "No refresh token provided"));
      
      const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
      req.user = await userService.findById(decoded.id);
      if (!req.user) throw new ApiError(401, "User not found");
      
      // Regenerate tokens
      const accessToken = userService.generateAccessToken(req.user);
      const newRefreshToken = userService.generateRefreshToken(req.user);
      
      res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });
      
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      
      // Remove sensitive fields
      delete req.user.password;
      delete req.user.refresh_token_enc;
      
      return next();
    } catch {
      return next(new ApiError(401, "Invalid or expired refresh token"));
    }
  }
};
