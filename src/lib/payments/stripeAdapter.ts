import { PaymentAdapter, PaymentIntent } from './adapter'

// Minimal illustrative Stripe adapter (no real stripe dependency)
export class StripeAdapter implements PaymentAdapter {
  async createPaymentIntent(amount: number, currency = 'USD') {
    const id = `pi_stripe_${Date.now()}`
    return { id, amount, currency, status: 'requires_payment_method' } as PaymentIntent
  }

  async retrievePaymentIntent(id: string) {
    return { id, amount: 1000, currency: 'USD', status: 'requires_payment_method' } as PaymentIntent
  }

  async capturePayment(id: string) {
    return { id, amount: 1000, currency: 'USD', status: 'succeeded' } as PaymentIntent
  }
}
