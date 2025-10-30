// services/plan.service.js
import { db } from "../db/connect.js";
import { plans } from "../schema/index.js";
import { createId } from "@paralleldrive/cuid2";
import Stripe from "stripe";
import { env } from "../config/env.config.js";
import { eq } from "drizzle-orm";


const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export class PlanService {
  //  Get all plans (optionally only active)
  async getPlans(activeOnly = false) {
    const query = db.select().from(plans);
    if (activeOnly) query.where(eq(plans.is_active, true));
    return await query;
  }

  //  Get a single plan by ID
  async getPlanById(planId) {
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    if (!plan) throw new Error("Plan not found");
    return plan;
  }

  //  Create a new plan (with Stripe integration)
  async createPlan(data) {
    const {
      name,
      description,
      price,
      currency = "GBP",
      billing_period,
      features = [],
      is_active = true,
      sort_order = 0,
      is_trial = false,
      is_popular = false,
    } = data;

    const id = createId();

    let stripe_product_id = null;
    let stripe_price_id = null;

    try {
      if (!env.STRIPE_SECRET_KEY) {
        console.warn(" STRIPE_SECRET_KEY missing — skipping Stripe creation.");
      } else {
        // Create Stripe product
        const product = await stripe.products.create({
          name,
          description,
          metadata: { plan_id: id },
        });
        stripe_product_id = product.id;

        // Prepare Stripe price data
        const priceData = {
          product: product.id,
          unit_amount: price, // amount in smallest currency unit (e.g., pence or cents)
          currency: currency.toLowerCase(),
          metadata: { plan_id: id },
        };

        if (billing_period && billing_period !== "ONE_TIME") {
          priceData.recurring = {
            interval: billing_period === "YEARLY" ? "year" : "month",
          };
        }

        const priceObj = await stripe.prices.create(priceData);
        stripe_price_id = priceObj.id;
      }
    } catch (err) {
      console.error(" Stripe plan creation failed:", err);
      stripe_product_id = `dev_product_${id}`;
      stripe_price_id = `dev_price_${id}`;
    }

    // Save plan in DB
     const [created] = await db
      .insert(plans)
      .values({
        id,
        name,
        description,
        price,
        currency,
        billing_period,
        stripe_product_id,
        stripe_price_id,
        features,
        is_active,
        sort_order,
        is_trial,
        is_popular,
      })
      .returning();

    return created;
  }

  //  Update existing plan
  async updatePlan(planId, data) {
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    if (!plan) throw new Error("Plan not found");

    const [updated] = await db
      .update(plans)
      .set(data)
      .where(eq(plans.id, planId))
      .returning();

    return updated;
  }

  //  Soft delete (deactivate) a plan
  async deletePlan(planId) {
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    if (!plan) throw new Error("Plan not found");

    const [deleted] = await db
      .update(plans)
      .set({ is_active: false })
      .where(eq(plans.id, planId))
      .returning();

    return deleted;
  }
}



export const planService = new PlanService();
