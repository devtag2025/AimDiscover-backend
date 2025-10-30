import { pgTable, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { plans } from "./plans.js";
import { createId } from "@paralleldrive/cuid2";

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  user_id: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  plan_id: varchar("plan_id", { length: 255 }).notNull().references(() => plans.id),
  
  // Stripe references
  stripe_customer_id: varchar("stripe_customer_id", { length: 255 }).notNull(),
  stripe_subscription_id: varchar("stripe_subscription_id", { length: 255 }),
  stripe_payment_intent_id: varchar("stripe_payment_intent_id", { length: 255 }),
  
  // Subscription details
  status: varchar("status", { length: 50 }).notNull(),
  
  // Periods
  current_period_start: timestamp("current_period_start"),
  current_period_end: timestamp("current_period_end"),
  trial_end: timestamp("trial_end"),
  
  // Cancellation
  cancel_at_period_end: boolean("cancel_at_period_end").default(false).notNull(),
  canceled_at: timestamp("canceled_at"),
  
  // Usage tracking
  usage: jsonb("usage"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

