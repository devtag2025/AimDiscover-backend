import { CategoryController } from './category.controller.js';

export * as authController from './auth.controller.js';
export * as subscriptionController from './subscription.controller.js';
export * as planController from './plan.controller.js';
export * as webhookController from './webhook.controller.js';
export * as CategoryController from './category.controller.js'


// export const googleAuth = passport.authenticate('google', {
//   scope: ['profile', 'email'],
//   accessType: 'offline',
//   prompt: 'consent',
// });

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
