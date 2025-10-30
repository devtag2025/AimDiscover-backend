import { db } from "../db/connect.js";
import { users } from "../schema/index.js";
import { eq,sql,like,ilike,and,or } from "drizzle-orm";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';
import { encrypt, decrypt } from '../utils/crypto.utils.js';
import crypto from 'crypto';
import { createId } from '@paralleldrive/cuid2';

export class UserService {
  /**
   * Find user by ID
   */
  async findById(userId) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.google_id, googleId))
      .limit(1);
    return user;
  }

  /**
   * Find user by email or Google ID
   */
  async findByEmailOrGoogleId(email, googleId) {
    const [userByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const [userByGoogleId] = await db
      .select()
      .from(users)
      .where(eq(users.google_id, googleId))
      .limit(1);

    return userByEmail || userByGoogleId;
  }

  /**
   * Find user by reset password token
   */
  async findByResetToken(token) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.reset_password_token, token))
      .limit(1);
    return user;
  }

  /**
   * Create a new user
   */
  async create(userData) {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        id: userData.id || createId()
      })
      .returning();
    return user;
  }

  /**
   * Update user by ID
   */
  async update(userId, updates) {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  /**
   * Delete user by ID
   */
  async delete(userId) {
    await db
      .delete(users)
      .where(eq(users.id, userId));
  }

    /**
   * Get all users with pagination, optional search and role filter
   */
  async getAllUsers({ page = 1, limit = 10, search, role }) {
    const offset = (page - 1) * limit;

    // build filters dynamically
    let whereConditions = [];
    if (search) {
      whereConditions.push(ilike(users.name, `%${search}%`));
    }
    if (role) {
      whereConditions.push(eq(users.user_type, role));
    }

    // total count
    const totalUsers = await db
      .select({ count: sql`COUNT(*)` })
      .from(users)
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    const total = Number(totalUsers[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // fetch paginated users
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        user_type: users.user_type,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        is_email_verified: users.is_email_verified,
      })
      .from(users)
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    return {
      users: userList,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalUsers: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: Number(limit),
      },
    };
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Compare password
   */
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type,
      },
      env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: env.ACCESS_TOKEN_EXPIRY || "15m",
      }
    );
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: env.REFRESH_TOKEN_EXPIRY || "7d",
      }
    );
  }

  /**
   * Generate email verification token
   */
  async generateEmailVerificationToken(user) {
    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.EMAIL_VERIFICATION_SECRET,
      { expiresIn: "24h" }
    );
    
    // Update user with verification token
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.update(user.id, {
      email_verification_token: token,
      email_verification_expires: expires
    });
    
    return token;
  }

  /**
   * Encrypt refresh token
   */
  encryptRefreshToken(token) {
    return encrypt(token);
  }

  /**
   * Decrypt refresh token
   */
  decryptRefreshToken(encryptedToken) {
    try {
      return decrypt(encryptedToken);
    } catch {
      return undefined;
    }
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify token
   */
  verifyToken(token, secret) {
    return jwt.verify(token, secret);
  }
}

const userService = new UserService();
export { userService };
export default userService;
