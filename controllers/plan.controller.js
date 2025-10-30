import { planService } from '../services/index.js';
import { ApiResponse } from '../utils/index.js';


// ===== PLAN MANAGEMENT =====

export const getPlans = async (req, res, next) => {
  try {
    const activeOnly = req.query.active === 'true';
    const plans = await planService.getPlans(activeOnly);
    res.json(new ApiResponse(200, plans, "Plans retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const plan = await planService.getPlanById(planId);
    res.json(new ApiResponse(200, plan, "Plan retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const plan = await planService.createPlan(req.body);
    res.json(new ApiResponse(201, plan, "Plan created successfully"));
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const plan = await planService.updatePlan(planId, req.body);
    res.json(new ApiResponse(200, plan, "Plan updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const plan = await planService.deletePlan(planId);
    res.json(new ApiResponse(200, plan, "Plan deactivated successfully"));
  } catch (error) {
    next(error);
  }
};

