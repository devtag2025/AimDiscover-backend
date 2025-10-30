// routes/index.js
import { Router } from "express";
import authRoutes from "./auth.route.js";
import planRoutes from "./plan.route.js";
import subscriptionRoutes from "./subscription.route.js";
import categoryRoutes from './category.route.js'
import analysisRoutes from './analysis.route.js'
// Main router for the application
const router = Router();

router.use("/auth", authRoutes);
router.use("/plans", planRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/categories", categoryRoutes);
router.use("/analysis", analysisRoutes);

// Add documentation or other routes as needed
router.get("/", (req, res) => {
  res.send("Welcome to the AimDiscover API - AI-powered product discovery platform");
});
router.get("/docs", (req, res) => {
  res.send("API Documentation will be available here soon.");
});
export default router;
