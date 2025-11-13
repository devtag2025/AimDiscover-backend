// services/DashboardService.js
import db from "../db/connect.js";
import { users } from "../schema/users.js";
import { categories } from "../schema/category.js";
import { sql } from "drizzle-orm";

export class DashboardService {
  static async DashboardStats(req, res, next) {
    try {
      // --- Total Users ---
      const [userCountResult] = await db
        .select({ count: sql`COUNT(*)` })
        .from(users);
      const totalUsers = Number(userCountResult.count || 0);

      // --- Total Categories ---
      const [categoryCountResult] = await db
        .select({ count: sql`COUNT(*)` })
        .from(categories);
      const totalCategories = Number(categoryCountResult.count || 0);

      // --- Users Created in Last 30 Days ---
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const usersInLast30Days = await db.execute(sql`
        SELECT 
          DATE_TRUNC('day', "created_at") AS day,
          COUNT(*) AS count
        FROM ${users}
        WHERE "created_at" >= ${thirtyDaysAgo}
        GROUP BY day
        ORDER BY day ASC
      `);

      const formattedGraphData = usersInLast30Days.rows.map((row) => ({
        day: row.day,
        count: Number(row.count),
      }));

      // --- Response ---
      return res.status(200).json({
        success: true,
        data: {
          totals: {
            users: totalUsers,
            categories: totalCategories,
          },
          userGraph: formattedGraphData,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
