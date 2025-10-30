import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const categories = pgTable("categories", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId()), // auto-generate cuid IDs like in users table
  
  name: varchar("name", { length: 255 })
    .notNull()
    .unique(), // category name must be unique

  ai_prompt: text("ai_prompt")
    .notNull(), // store the full prompt text

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});
