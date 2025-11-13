import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { auth, validate, authorize } from '../middlewares/index.js';

const router = Router();

// Public routes (no auth required)
router.post('/register', validate.registerUser, authController.signup);
router.post('/login', validate.loginUser, authController.login);
router.post('/forgot-password', validate.forgotPassword, authController.forgotPassword);
router.post('/reset-password', validate.resetPassword, authController.resetPassword);
router.get('/verify-email/:token', validate.verifyEmailToken, authController.verifyEmail);
router.post('/resend-verification', validate.resendVerification, authController.resendVerification);
router.get('/refresh-token',validate.refreshAccessToken,authController.refreshAccessToken)

// Google OAuth routes (no validation needed)
router.get('/google', authController.googleAuth);
router.get('/google/callback',authController.googleCallback);

// Protected routes (auth middleware required)
router.use(auth);
router.get('/profile', authController.getProfile);
router.put('/profile', validate.updateProfile, authController.updateProfile);
router.post('/change-password', validate.changePassword, authController.changePassword);
router.post('/logout', authController.logout);
router.post('/register-user',authorize(['admin']), authController.adminCreateUser);
router.get('/dashboard-stats', authController.getDashboardStats)

router.delete('/user/:userId', authController.deleteUser);
// Admin routes
router.get('/users', authorize(['admin', 'super_admin']), validate.getAllUsers, authController.getAllUsers);

export default router;