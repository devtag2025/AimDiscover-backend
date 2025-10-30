import { stripeService, planService } from '../services/index.js';
import { ApiResponse } from '../utils/index.js';

export const createCheckout = async (req, res, next) => {
  try {
    const { plan_id } = req.body;
    const userId = req.user._id;

    const result = await stripeService.createCheckout(userId, plan_id);
    res.json(new ApiResponse(200, result, "Checkout session created"));
  } catch (error) {
    next(error);
  }
};

export const createPortalSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await stripeService.createPortal(userId);
    res.json(new ApiResponse(200, result, "Portal session created"));
  } catch (error) {
    next(error);
  }
};
