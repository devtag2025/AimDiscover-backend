import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './index.js';
import { userService } from '../services/user.service.js';

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Log OAuth config for debugging
console.log('🔧 Google OAuth Configuration:');
console.log('Client ID:', env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('Client Secret:', env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('Redirect URI:', env.GOOGLE_REDIRECT_URI || '✗ Missing');

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_REDIRECT_URI,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔵 Google OAuth callback received for:', profile.emails?.[0]?.value);

        if (!profile?.id || !profile?.emails?.[0]?.value) {
          return done(new Error('Invalid Google profile data'), null);
        }

        const email = profile.emails[0].value;
        const googleId = profile.id;

        // Check if user exists by Google ID or email
        const userByGoogleId = await userService.findByGoogleId(googleId);
        const userByEmail = await userService.findByEmail(email);

        let user = userByGoogleId || userByEmail;

        if (!user) {
          // Create new user
          console.log('✨ Creating new user:', email);
          user = await userService.create({
            google_id: googleId,
            email: email,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            is_email_verified: true,
          });
        } else {
          console.log('🔄 Updating existing user:', email);
          if (userByEmail && !userByGoogleId) {
            user = await userService.update(user.id, {
              google_id: googleId,
              name: user.name || profile.displayName,
              picture: user.picture || profile.photos?.[0]?.value,
              is_email_verified: true,
            });
          }
        }
        if (refreshToken) {
          console.log('🔐 Storing refresh token');
          const encryptedRefreshToken = userService.encryptRefreshToken(refreshToken);
          user = await userService.update(user.id, {
            refresh_token_enc: encryptedRefreshToken,
          });
        }

        console.log('✅ OAuth authentication successful for:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('❌ OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;