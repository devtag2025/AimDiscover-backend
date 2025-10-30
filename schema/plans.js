import { pgTable, varchar, boolean, timestamp, integer, jsonb, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const plans = pgTable("plans", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  billing_period: varchar("billing_period", { length: 50 }).notNull(),
  
  // Stripe IDs
  stripe_product_id: varchar("stripe_product_id", { length: 255 }),
  stripe_price_id: varchar("stripe_price_id", { length: 255 }),
  
  // Plan limits & features
  features: jsonb("features"),
  
  // Admin controls
  is_active: boolean("is_active").default(true).notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  
  // Special flags
  is_trial: boolean("is_trial").default(false).notNull(),
  is_popular: boolean("is_popular").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

