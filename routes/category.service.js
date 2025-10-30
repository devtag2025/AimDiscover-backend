import { db } from "../db/connect.js";
import { categories } from "../schema/index.js";
import { ilike, eq, and, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export class CategoryService {
  static async createCategory({ name, ai_prompt }) {
    console.log("create category payload",name);
      console.log("create category payload",ai_prompt);
    
    const [category] = await db
      .insert(categories)
      .values({ id: createId(), name, ai_prompt })
      .returning();
    return category;
  }

  static async getAllCategories({ page = 1, limit = 10, search = "" }) {
    const offset = (page - 1) * limit;

    const whereClause = search
      ? ilike(categories.name, `%${search}%`)
      : sql`true`;

    const [countResult] = await db
      .select({ count: sql`COUNT(*)` })
      .from(categories)
      .where(whereClause);

    const totalCategories = Number(countResult.count);
    const totalPages = Math.ceil(totalCategories / limit);

    const items = await db
      .select()
      .from(categories)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(categories.createdAt);

    return {
      categories: items,
      pagination: {
        totalCategories,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getCategoryById(id) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return category;
  }

  static async updateCategory(id, data) {
    console.log("data",data);
    
    const [updated] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  static async deleteCategory(id) {
    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return deleted;
  }
}
