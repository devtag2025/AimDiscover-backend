// Stripe service - stubbed for now
// Import will be added when stripe package is installed

class StripeService {
  async createCheckout(userId, planId) {
    throw new Error('Stripe integration not implemented yet');
  }

  async createPortal(userId) {
    throw new Error('Stripe integration not implemented yet');
  }

  async processWebhook(rawBody, signature) {
    throw new Error('Stripe integration not implemented yet');
  }
}

export const stripeService = new StripeService();
