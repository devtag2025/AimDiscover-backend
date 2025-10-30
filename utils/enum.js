// User Types
export const USER_TYPES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Business Types
export const BUSINESS_TYPES = {
  ONLINE: 'Online',
  IN_PERSON: 'In Person'
};

// Voice Tone Styles
export const VOICE_TONE_STYLES = {
  BOLD: 'Bold',
  PLAYFUL: 'Playful', 
  PREMIUM: 'Premium',
  AGGRESSIVE: 'Aggressive'
};

// Campaign Template Categories
export const CAMPAIGN_CATEGORIES = {
  MOST_POPULAR: 'Most Popular',
  CHALLENGES: 'Challenges',
  SEASONAL: 'Seasonal',
  RECRUITMENT: 'Recruitment',
  TRANSFORMATION: 'Transformation'
};

// Ad Type Prompts (Enhanced from previous project)
export const AD_TYPES = {
  // AD_CAPTION: 'ad_caption',
  AD_HEADLINE: 'ad_headline',
  AD_DESCRIPTION: 'ad_description',
  CAMPAIGN_NAME: 'campaign_name',
  // CALL_TO_ACTION: 'call_to_action',
  // CTA_TEXT: 'cta_text',
  // IG_STORY: 'ig_story',
  // CREATIVE_PROMPT: 'creative_prompt',
  // COMPLIANCE_REWRITE: 'compliance_rewrite',
  // INSIGHTS_SUMMARY: 'insights_summary',
  // AD_DESCRIPTIONS: 'ad_descriptions',
  ADSET_NAME: 'adset_name',
  AD_NAME: 'ad_name',
  VIDEO_SCRIPT: 'video_script',
  AD_COPY: 'ad_copy'
};

// Facebook Call-to-Action Types (Official Facebook options)
export const FACEBOOK_CTA_TYPES = {
  LEARN_MORE: 'LEARN_MORE',
  SIGN_UP: 'SIGN_UP',
  DOWNLOAD: 'DOWNLOAD',
  SHOP_NOW: 'SHOP_NOW',
  CONTACT_US: 'CONTACT_US',
  BOOK_TRAVEL: 'BOOK_TRAVEL',
  GET_QUOTE: 'GET_QUOTE'
};

// Facebook Campaign Objectives (Based on Facebook Marketing API)
export const FACEBOOK_OBJECTIVES = {
  OUTCOME_TRAFFIC: 'OUTCOME_TRAFFIC',
  OUTCOME_LEADS: 'OUTCOME_LEADS',
  OUTCOME_ENGAGEMENT: 'OUTCOME_ENGAGEMENT',
  OUTCOME_SALES: 'OUTCOME_SALES'
};

// Facebook Optimization Goals
export const FACEBOOK_OPTIMIZATION_GOALS = {
  LANDING_PAGE_VIEWS: 'LANDING_PAGE_VIEWS',
  LINK_CLICKS: 'LINK_CLICKS',
  IMPRESSIONS: 'IMPRESSIONS',
  REACH: 'REACH'
};

// Facebook Billing Events
export const FACEBOOK_BILLING_EVENTS = {
  IMPRESSIONS: 'IMPRESSIONS',
  LINK_CLICKS: 'LINK_CLICKS'
};

// Facebook Ad Status (Official Facebook statuses)
export const FACEBOOK_AD_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  DELETED: 'DELETED',
  ARCHIVED: 'ARCHIVED'
};

// Media Types (For Facebook ads)
export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video'
};

// Creation Status (Internal tracking)
export const CREATION_STATUS = {
  PENDING: 'pending',
  CREATING: 'creating',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DEVELOPMENT_MODE: 'development_mode'
};

// Creation Steps
export const CREATION_STEPS = {
  CAMPAIGN: 'campaign',
  ADSET: 'adset',
  CREATIVE: 'creative',
  AD: 'ad',
  UNKNOWN: 'unknown'
};

// Onboarding Step Status
export const ONBOARDING_STATUS = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Top Performing Ad Tones
export const AD_TONES = {
  ENERGETIC: 'Energetic',
  PLAYFUL: 'Playful',
  AGGRESSIVE: 'Aggressive',
  PREMIUM: 'Premium',
  CONVERSATIONAL: 'Conversational',
  MOTIVATIONAL: 'Motivational',
  NO_BS: 'No-BS',
  ENGAGING: 'Engaging',
  PASSIONATE: 'Passionate', 
  NARRATIVE: 'Narrative',
  ASPIRATIONAL: 'Aspirational',
  NO_TONE: 'No-Tone',
  AUTHORITY: 'Authority',
  PROFESSIONAL: 'Professional',
  HIGH_ENERGY: 'High-Energy',
  
};

// Hook Types for Top Performing Ads (Enhanced from previous project)
export const AD_HOOK_TYPES = {
  PROBLEM: 'Problem',
  BENEFIT: 'Benefit',
  SCARCITY: 'Scarcity',
  STORY: 'Story',
  QUESTION: 'Question',
  TRANSFORMATION: 'Transformation',
  PLAIN_SIMPLE: 'Plain & Simple',
  CURIOSITY: 'Curiosity', 
  URGENCY: 'Urgency',  
  RELATABLE: 'Relatable',
  NO_HOOK: 'No-Hook',
  BOLD: 'Bold',
  PAIN_BASED: 'Pain-Based',
  INNOVATIVE: 'Innovative'

};

// Legacy alias for backward compatibility
export const HOOK_TYPES = AD_HOOK_TYPES;

// Social Media Platforms
export const PLATFORMS = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  TWITTER: 'Twitter'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Success',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error'
};

// Default Values
export const DEFAULTS = {
  PAGINATION_LIMIT: 10,
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  SORT_ORDER: 0
};

// UK Market Configuration
export const UK_CONFIG = {
  CURRENCY: 'GBP',
  COUNTRY_CODE: 'GB',
  MIN_DAILY_BUDGET_GBP: 500, // £5.00 in pence (Facebook's UK minimum)
  RECOMMENDED_STARTING_BUDGET_GBP: 1000, // £10.00 in pence for testing
  DEFAULT_TARGETING: { countries: ['GB'] }
};

// Billing periods for plans/subscriptions
export const BILLING_PERIODS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  ONE_TIME: 'one_time'
};

// Analytics levels used in plan limits
export const ANALYTICS_LEVELS = {
  BASIC: 'basic',
  ADVANCED: 'advanced'
};

// Subscription status values
export const SUBSCRIPTION_STATUS = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
  LIFETIME: 'lifetime'
};

// Convert objects to arrays for Mongoose enum validation
export const getUserTypesArray = () => Object.values(USER_TYPES);
export const getBusinessTypesArray = () => Object.values(BUSINESS_TYPES);
export const getVoiceToneStylesArray = () => Object.values(VOICE_TONE_STYLES);
export const getCampaignCategoriesArray = () => Object.values(CAMPAIGN_CATEGORIES);
export const getAdTypesArray = () => Object.values(AD_TYPES);
export const getFacebookCTATypesArray = () => Object.values(FACEBOOK_CTA_TYPES);
export const getFacebookObjectivesArray = () => Object.values(FACEBOOK_OBJECTIVES);
export const getFacebookOptimizationGoalsArray = () => Object.values(FACEBOOK_OPTIMIZATION_GOALS);
export const getFacebookBillingEventsArray = () => Object.values(FACEBOOK_BILLING_EVENTS);
export const getFacebookAdStatusArray = () => Object.values(FACEBOOK_AD_STATUS);
export const getMediaTypesArray = () => Object.values(MEDIA_TYPES);
export const getCreationStatusArray = () => Object.values(CREATION_STATUS);
export const getCreationStepsArray = () => Object.values(CREATION_STEPS);
export const getOnboardingStatusArray = () => Object.values(ONBOARDING_STATUS);
export const getAdTonesArray = () => Object.values(AD_TONES);
export const getHookTypesArray = () => Object.values(HOOK_TYPES);
export const getAdHookTypesArray = () => Object.values(AD_HOOK_TYPES);
export const getPlatformsArray = () => Object.values(PLATFORMS);
export const getBillingPeriodsArray = () => Object.values(BILLING_PERIODS);
export const getAnalyticsLevelsArray = () => Object.values(ANALYTICS_LEVELS);
export const getSubscriptionStatusArray = () => Object.values(SUBSCRIPTION_STATUS);
