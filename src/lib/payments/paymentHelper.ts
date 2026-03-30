import { getPaymentAdapter } from './factory'

export async function createIntent(amount: number, currency = 'USD', pspName?: string) {
  const adapter = getPaymentAdapter(pspName)
  return adapter.createPaymentIntent(amount, currency)
}

export async function captureIntent(id: string, pspName?: string) {
  const adapter = getPaymentAdapter(pspName)
  return adapter.capturePayment(id)
}
