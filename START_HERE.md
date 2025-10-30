# 🚀 AimDiscover 2.0 - Start Here!

## ✅ Setup Complete!

Your AimDiscover backend has been migrated from MongoDB to PostgreSQL with Drizzle ORM.

## 📋 Quick Start

### 1. Create .env File

Create a `.env` file in the `AimDiscover2.0` directory with at least this:

```env
DATABASE_URL=postgresql://neondb_owner:npg_D79YhJAPwyEb@ep-still-leaf-add2w2ys-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secrets
JWT_SECRET=your_long_secret_key_here_at_least_32_characters
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EMAIL_VERIFICATION_SECRET=your_email_verification_secret
ENCRYPTION_KEY_B64=your_base64_encrypted_key_32_bytes

# App Configuration
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development

# Add other variables as needed for your project
```

### 2. Start the Server

```bash
cd AimDiscover2.0
npm run dev
```

### 3. Test the API

Open your browser or use Postman:

```
GET http://localhost:5000/api/v1/
```

You should see: "Welcome to the AimDiscover API"

## 🎯 What's Working

✅ **User Authentication**
- Register new users
- Login with email/password
- Google OAuth integration
- JWT token authentication
- Refresh token rotation
- Password reset flow

✅ **Database**
- PostgreSQL with Neon serverless
- Drizzle ORM
- Users, Plans, Subscriptions tables

✅ **Project Structure**
- routes/ → controllers/ → services/ → database
- Clean architecture

## 📡 Available Endpoints

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/google
POST /api/v1/auth/logout
GET  /api/v1/auth/profile
PUT  /api/v1/auth/profile
```

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

## 🗄️ Database

Your database is connected to Neon PostgreSQL.

**Tables Created:**
- `users` - User accounts
- `plans` - Subscription plans  
- `subscriptions` - User subscriptions

View your database:
```bash
npm run db:studio
```

## ⚙️ Configuration

Edit these files as needed:
- `.env` - Environment variables
- `config/env.config.js` - Config validation
- `routes/` - API routes
- `controllers/` - Request handlers
- `services/` - Business logic
- `schema/` - Database schemas

## 🐛 Troubleshooting

### Error: "Joi is not defined"
✅ FIXED - Joi has been installed

### Error: "Database connection failed"
- Check your DATABASE_URL in `.env`
- Verify your Neon database is running

### Error: "Module not found"
- Run `npm install` again
- Check that you're in the correct directory

## 📚 Next Steps

1. ✅ Install dependencies - DONE
2. ✅ Create database tables - DONE  
3. ✅ Setup Drizzle ORM - DONE
4. 🔲 Add your environment variables to `.env`
5. 🔲 Start developing!

## 📖 Documentation

- `README.md` - Full documentation
- `MIGRATION.md` - Technical migration details
- `README_MIGRATION.md` - Quick migration guide

## 🎉 You're Ready!

Your AimDiscover 2.0 backend is ready to use. Just add your `.env` file and start coding!

---

**Need Help?** Check the documentation or open an issue.

