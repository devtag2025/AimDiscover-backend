# Setup Environment Variables

Create a `.env` file in `AimDiscover2.0/` with the following content:

```env
# Database - Required
DATABASE_URL=postgresql://neondb_owner:npg_D79YhJAPwyEb@ep-still-leaf-add2w2ys-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Secrets - Required
JWT_SECRET=dev_jwt_secret_key_minimum_32_characters_for_development_purposes_only
ACCESS_TOKEN_SECRET=dev_access_token_secret_minimum_32_characters_for_dev
REFRESH_TOKEN_SECRET=dev_refresh_token_secret_minimum_32_characters_for_dev

# App Configuration
NODE_ENV=development
PORT=5000

# URLs (Optional - has defaults)
CLIENT_URL=http://localhost:3000
ADMIN_PANEL_URL=http://localhost:3001
```

## Quick Setup

Copy and paste the above into a new file called `.env` in the `AimDiscover2.0` folder.

Or run this command:

```bash
cd AimDiscover2.0
cat > .env << 'EOF'
DATABASE_URL=postgresql://neondb_owner:npg_D79YhJAPwyEb@ep-still-leaf-add2w2ys-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=dev_jwt_secret_key_minimum_32_characters_for_development_purposes_only
ACCESS_TOKEN_SECRET=dev_access_token_secret_minimum_32_characters_for_dev
REFRESH_TOKEN_SECRET=dev_refresh_token_secret_minimum_32_characters_for_dev
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
ADMIN_PANEL_URL=http://localhost:3001
EOF
```

Or simply create the `.env` file manually!

