import { pgTable, varchar, boolean, timestamp, integer, jsonb, text } from "drizzle-orm/pg-core";

export const plans = pgTable("plans", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: integer("price").notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  billing_period: varchar("billing_period", { length: 50 }).notNull(),
  stripe_product_id: varchar("stripe_product_id", { length: 255 }),
  stripe_price_id: varchar("stripe_price_id", { length: 255 }),
  features: jsonb("features"),
  is_active: boolean("is_active").default(true).notNull(),
  sort_order: integer("sort_order").default(0).notNull(),
  is_trial: boolean("is_trial").default(false).notNull(),
  is_popular: boolean("is_popular").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

