import { PaymentAdapter } from './adapter'
import { StripeAdapter } from './stripeAdapter'
import { PayPalAdapter } from './paypalAdapter'

export type PSP = 'stripe' | 'paypal'

export function getPaymentAdapter(name?: string): PaymentAdapter {
  const psp = (name || process.env.PSP || 'stripe').toLowerCase()
  if (psp === 'paypal') return new PayPalAdapter()
  return new StripeAdapter()
}
