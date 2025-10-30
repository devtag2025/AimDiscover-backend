import Joi from "joi";

// Helper function to validate request body
const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.details[0].message,
    });
  }
  next();
};

// Helper function to validate params
const validateParams = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error", 
      error: error.details[0].message,
    });
  }
  next();
};

// Helper function to validate query
const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error", 
      error: error.details[0].message,
    });
  }
  next();
};

// Common schemas
const email = Joi.string().email().required();
const password = Joi.string().min(6).max(128).required();
const name = Joi.string().min(2).max(100);
const token = Joi.string().required();
const confirmPassword = (ref) => Joi.string().valid(Joi.ref(ref)).required().messages({ 'any.only': 'Passwords do not match' });

// Facebook-specific schemas

const mongoId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required();


// Auth validations
const registerUser = validateRequest(Joi.object({
  name: name.required(),
  email,
  password,
  confirmPassword: confirmPassword('password')
}));

const loginUser = validateRequest(Joi.object({
  email,
  password: Joi.string().required()
}));

const forgotPassword = validateRequest(Joi.object({ email }));

const resetPassword = validateRequest(Joi.object({
  token,
  password,
  confirmPassword: confirmPassword('password')
}));

const verifyEmailToken = validateParams(Joi.object({ token }));

const resendVerification = validateRequest(Joi.object({ email }));

const updateProfile = validateRequest(Joi.object({
  name: name.optional(),
  email: email.optional()
}).min(1));

const changePassword = validateRequest(Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: password,
  confirmPassword: confirmPassword('newPassword')
}));



// Plan validations
const createPlan = validateRequest(Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().min(0).required(),
  currency: Joi.string().length(3).default('GBP'),
  billing_period: Joi.string().valid('monthly', 'yearly', 'one_time').required(),
  features: Joi.array().items(Joi.string().max(200)).optional(),
  limits: Joi.object({
    ads_per_month: Joi.number().min(0).allow(null).optional(),
    team_members: Joi.number().min(1).default(1),
    locations: Joi.number().min(1).default(1),
    analytics_level: Joi.string().valid('basic', 'advanced').default('basic')
  }).optional(),
  sort_order: Joi.number().min(0).optional(),
  is_trial: Joi.boolean().optional(),
  is_popular: Joi.boolean().optional()
}));

const updatePlan = validateRequest(Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().min(0).optional(),
  currency: Joi.string().length(3).optional(),
  billing_period: Joi.string().valid('monthly', 'yearly', 'one_time').optional(),
  features: Joi.array().items(Joi.string().max(200)).optional(),
  limits: Joi.object({
    ads_per_month: Joi.number().min(0).allow(null).optional(),
    team_members: Joi.number().min(1).optional(),
    locations: Joi.number().min(1).optional(),
    analytics_level: Joi.string().valid('basic', 'advanced').optional()
  }).optional(),
  sort_order: Joi.number().min(0).optional(),
  is_trial: Joi.boolean().optional(),
  is_popular: Joi.boolean().optional(),
  is_active: Joi.boolean().optional()
}).min(1));

const planId = validateParams(Joi.object({
  planId: mongoId
}));

const getPlans = validateQuery(Joi.object({
  active: Joi.boolean().optional()
}));

const getSubscriptions = validateQuery(Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
  status: Joi.string().valid('trial', 'active', 'past_due', 'canceled', 'unpaid', 'lifetime').optional(),
  plan_id: mongoId.optional(),
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').optional()
}));

const updateUserSubscription = validateRequest(Joi.object({
  plan_id: mongoId.optional(),
  status: Joi.string().valid('trial', 'active', 'past_due', 'canceled', 'unpaid', 'lifetime').optional(),
  expires_at: Joi.date().iso().optional()
}).min(1));

const createCheckout = validateRequest(Joi.object({
  plan_id: mongoId.required()
}));

const userId = validateParams(Joi.object({
  userId: mongoId
}));

// Get all users validation
const getAllUsers = validateQuery(Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().min(1).max(100),
  role: Joi.string().valid('user', 'admin', 'super_admin'),
  sortBy: Joi.string().valid('name', 'email', 'createdAt', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
}));

export const validate = {
  // Auth
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyEmailToken,
  resendVerification,
  updateProfile,
  changePassword,
  
  
  // Plans
  createPlan,
  updatePlan,
  planId,
  getPlans,
  getSubscriptions,
  updateUserSubscription,
  createCheckout,
  userId,
  getAllUsers
};