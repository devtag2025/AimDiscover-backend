# Migration from MongoDB to PostgreSQL with Drizzle ORM

This document outlines the migration from MongoDB (Mongoose) to PostgreSQL (Drizzle ORM) for AimDiscover 2.0.

## Changes Made

### 1. Database Schema
- **Old**: Mongoose models in `models/` directory
- **New**: Drizzle schema files in `schema/` directory
  - `schema/users.ts` - User schema
  - `schema/plans.ts` - Subscription plan schema
  - `schema/subscriptions.ts` - User subscription schema
  - `schema/index.ts` - Exports all schemas

### 2. Database Connection
- **Old**: Mongoose connection in `db/connect.js`
- **New**: PostgreSQL/Neon connection with Drizzle in `db/connect.js`
- Connection now uses Neon serverless adapter for PostgreSQL

### 3. Services Layer
- **New**: `services/user.service.js` - User operations with Drizzle
- Replaces Mongoose model methods with Drizzle queries
- Handles password hashing, JWT tokens, and user CRUD operations

### 4. Controllers
- **Updated**: `controllers/auth.controller.js` - Now uses `userService` instead of Mongoose models
- All authentication operations now use Drizzle queries
- Maintains the same API interface for client compatibility

### 5. Middlewares
- **Updated**: `middlewares/auth.middleware.js` - Now uses `userService`
- Token verification and refresh token handling updated for new schema

### 6. Configuration
- **Updated**: `config/env.config.js` - Changed from `MONGO_URI` to `DATABASE_URL`
- **Updated**: `package.json` - Added Drizzle dependencies, removed MongoDB dependencies

## Dependencies Added

```json
{
  "drizzle-orm": "^0.39.0",
  "@neondatabase/serverless": "^0.15.0",
  "@paralleldrive/cuid2": "^2.2.2",
  "postgres": "^3.4.3",
  "drizzle-kit": "^0.30.0" // dev dependency
}
```

## Dependencies Removed

- `mongoose`
- `mongodb-chatbot-server`
- `mongodb-rag-core`
- `mongodb-rag-ingest`

## Environment Variables

**Changed:**
- `MONGO_URI` → `DATABASE_URL`

**New required variable:**
```env
DATABASE_URL=postgresql://username:password@host.database.neon.tech/dbname?sslmode=require
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Neon Database

1. Create a free Neon account at https://neon.tech
2. Create a new database project
3. Copy the connection string
4. Add it to your `.env` file as `DATABASE_URL`

### 3. Generate Database Migrations

```bash
npm run db:generate
```

This will generate SQL migration files in the `drizzle/` directory.

### 4. Run Migrations

```bash
npm run db:migrate
```

This will push the schema to your PostgreSQL database.

### 5. Start the Server

```bash
npm run dev
```

## Database Schema

### Users Table
- `id` - Primary key (CUID)
- `email` - Unique, not null
- `name` - Varchar 255
- `google_id` - Varchar 255
- `picture` - Text
- `user_type` - Varchar 50 (default: 'user')
- `password` - Varchar 255
- `is_email_verified` - Boolean (default: false)
- `email_verification_token` - Varchar 500
- `email_verification_expires` - Timestamp
- `reset_password_token` - Varchar 500
- `reset_password_expires` - Timestamp
- `refresh_token_enc` - Text
- `stripe_customer_id` - Varchar 255
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Plans Table
- `id` - Primary key (CUID)
- `name` - Unique, not null
- `description` - Text
- `price` - Integer (in pence)
- `currency` - Varchar 10 (default: 'GBP')
- `billing_period` - Varchar 50 (monthly, yearly, one_time)
- `stripe_product_id` - Varchar 255
- `stripe_price_id` - Varchar 255
- `features` - JSONB (array)
- `limits` - JSONB (object)
- `is_active` - Boolean (default: true)
- `sort_order` - Integer (default: 0)
- `is_trial` - Boolean (default: false)
- `is_popular` - Boolean (default: false)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Subscriptions Table
- `id` - Primary key (CUID)
- `user_id` - Foreign key to users
- `plan_id` - Foreign key to plans
- `stripe_customer_id` - Varchar 255, not null
- `stripe_subscription_id` - Varchar 255
- `stripe_payment_intent_id` - Varchar 255
- `status` - Varchar 50 (trial, active, past_due, canceled, unpaid, lifetime)
- `current_period_start` - Timestamp
- `current_period_end` - Timestamp
- `trial_end` - Timestamp
- `cancel_at_period_end` - Boolean (default: false)
- `canceled_at` - Timestamp
- `usage` - JSONB (object with ads_generated, last_reset)
- `created_at` - Timestamp
- `updated_at` - Timestamp

## API Compatibility

The API endpoints remain unchanged. No client-side changes are required.

## Known Issues / Todo

1. **Pagination**: The `getAllUsers` function needs proper pagination implementation
2. **Subscription Service**: Subscription operations need to be migrated
3. **Other Models**: Facebook ads, campaigns, and other models need migration
4. **Admin Stats**: Dashboard stats need proper implementation

## Next Steps

1. Migrate remaining models (FacebookAd, CampaignTemplate, etc.)
2. Create service layer for subscriptions
3. Add proper pagination utilities
4. Complete migration of all controllers

