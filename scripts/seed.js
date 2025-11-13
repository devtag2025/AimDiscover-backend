import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "../schema/users.js"; // adjust path if needed
import { createId } from "@paralleldrive/cuid2";
import { hash } from "bcryptjs";
import pkg from "pg";
import { env } from "../config/env.config.js";
const { Client } = pkg;

const client = new Client({
  connectionString: env.DATABASE_URL,
});

const db = drizzle(client);

async function seedUsers() {
  try {
    await client.connect();
    console.log("🌱 Starting user seed...");

    // 1️⃣ Hash passwords
    const adminPassword = await hash("admin123", 10);
    const userPassword = await hash("user123456", 10);

    // 2️⃣ Define users
    const userSeedData = [
      {
        id: createId(),
        email: "admin@example.com",
        name: "System Admin",
        google_id: null,
        picture: "https://i.pravatar.cc/150?img=1",
        user_type: "admin",
        password: adminPassword,
        is_email_verified: true,
      },
      {
        id: createId(),
        email: "user1@example.com",
        name: "John Doe",
        google_id: null,
        picture: "https://i.pravatar.cc/150?img=2",
        user_type: "user",
        password: userPassword,
        is_email_verified: true,
      },
      {
        id: createId(),
        email: "user2@example.com",
        name: "Jane Smith",
        google_id: null,
        picture: "https://i.pravatar.cc/150?img=3",
        user_type: "user",
        password: userPassword,
        is_email_verified: true,
      },
      {
        id: createId(),
        email: "user3@example.com",
        name: "Alice Johnson",
        google_id: null,
        picture: "https://i.pravatar.cc/150?img=4",
        user_type: "user",
        password: userPassword,
        is_email_verified: true,
      },
            {
        id: createId(),
        email: "user4@example.com",
        name: "Alice Jasdadohnson",
        google_id: null,
        picture: "https://i.pravatar.cc/150?img=4",
        user_type: "user",
        password: userPassword,
        is_email_verified: true,
      },
            {
        id: createId(),
        email: "user5@example.com",
        name: "Alice Johqweeqnson",
        google_id: null,
        picture: "https://i.pravatar.cc/150?img=4",
        user_type: "user",
        password: userPassword,
        is_email_verified: true,
      },
    ];

    // 3️⃣ Insert users (ignore if email exists)
    for (const u of userSeedData) {
      await db
        .insert(users)
        .values(u)
        .onConflictDoNothing({ target: users.email });
    }

    console.log("✅ Users seeded successfully!");
    console.table(
      userSeedData.map(({ email, password, user_type }) => ({
        email,
        password: password === adminPassword ? "admin123 (hashed)" : "user123456 (hashed)",
        user_type,
      }))
    );
  } catch (err) {
    console.error("❌ Error seeding users:", err);
  } finally {
    await client.end();
    console.log("🛑 Database connection closed.");
  }
}

seedUsers();
