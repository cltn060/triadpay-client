export type PaymentIntent = {
  id: string
  amount: number
  currency: string
  status: string
  metadata?: Record<string, any>
}

export interface PaymentAdapter {
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, any>): Promise<PaymentIntent>
  retrievePaymentIntent(id: string): Promise<PaymentIntent>
  capturePayment(id: string): Promise<PaymentIntent>
}
