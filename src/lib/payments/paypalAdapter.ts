import { PaymentAdapter, PaymentIntent } from './adapter'

// Minimal illustrative PayPal adapter (mock)
export class PayPalAdapter implements PaymentAdapter {
  async createPaymentIntent(amount: number, currency = 'USD') {
    const id = `pi_paypal_${Date.now()}`
    return { id, amount, currency, status: 'CREATED' } as PaymentIntent
  }

  async retrievePaymentIntent(id: string) {
    return { id, amount: 500, currency: 'USD', status: 'CREATED' } as PaymentIntent
  }

  async capturePayment(id: string) {
    return { id, amount: 500, currency: 'USD', status: 'COMPLETED' } as PaymentIntent
  }
}
