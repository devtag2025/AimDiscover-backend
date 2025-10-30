// services/stripe.service.js
import Stripe from "stripe";
import { db } from "../db/connect.js";
import { plans } from "../schema/index.js";
import { eq } from "drizzle-orm";
import { env } from "../config/env.config.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

class StripeService {
  async createCheckout(userId, planId) {
    //  Fetch plan details from DB
    const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
    if (!plan) throw new Error("Plan not found");

    // 2️ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: plan.billing_period === "ONE_TIME" ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripe_price_id, // Price ID created when you made the plan
          quantity: 1,
        },
      ],
      success_url: `${env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/payment-cancelled`,
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    });

    return { checkout_url: session.url };
  }

 //  2. Process webhook events
  async processWebhook(rawBody, signature) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      throw new Error("Invalid webhook signature");
    }

    //  Handle important events
    switch (event.type) {
      //  Checkout completed → create subscription record
      case "checkout.session.completed": {
        const session = event.data.object;
        const { user_id, plan_id } = session.metadata;

        if (!session.customer) {
          console.warn("No customer ID found in checkout.session.completed event.");
          break;
        }

        // For subscriptions (not one-time)
        const stripeSubId = session.subscription || null;
        let stripeSub;
        if (stripeSubId) {
          stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
        }

        // Save subscription in DB
        await db.insert(subscriptions).values({
          id: createId(),
          user_id,
          plan_id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: stripeSub?.id || null,
          stripe_payment_intent_id: session.payment_intent || null,
          status: stripeSub?.status || "active",
          current_period_start: stripeSub?.current_period_start
            ? new Date(stripeSub.current_period_start * 1000)
            : new Date(),
          current_period_end: stripeSub?.current_period_end
            ? new Date(stripeSub.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trial_end: stripeSub?.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
          cancel_at_period_end: stripeSub?.cancel_at_period_end ?? false,
        });

        console.log(" Subscription created for user:", user_id);
        break;
      }

      //  Payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.warn("Payment failed:", invoice.id);
        break;
      }

      //  Subscription canceled
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object;
        await db
          .update(subscriptions)
          .set({
            status: "canceled",
            canceled_at: new Date(),
          })
          .where(eq(subscriptions.stripe_subscription_id, stripeSub.id));

        console.log("Subscription canceled:", stripeSub.id);
        break;
      }

      //  Subscription renewed or reactivated
      case "customer.subscription.updated": {
        const stripeSub = event.data.object;
        await db
          .update(subscriptions)
          .set({
            status: stripeSub.status,
            current_period_start: new Date(stripeSub.current_period_start * 1000),
            current_period_end: new Date(stripeSub.current_period_end * 1000),
            cancel_at_period_end: stripeSub.cancel_at_period_end,
          })
          .where(eq(subscriptions.stripe_subscription_id, stripeSub.id));

        console.log(" Subscription updated:", stripeSub.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
}

export const stripeService = new StripeService();
