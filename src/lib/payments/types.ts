import { PaymentAdapter, PaymentIntent } from './adapter'

export enum PSPType {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  MOCK = 'MOCK',
}

export type RoutingRule = {
  id: string
  description: string
  priority: number // Higher number = higher priority
  evaluate: (context: RoutingContext) => boolean
  targetPsp: PSPType
}

export type RoutingContext = {
  amount: number
  currency: string
  metadata?: Record<string, any>
  userId?: string
  tenantId?: string
}

export type CircuitBreakerConfig = {
  failureThreshold: number // Number of consecutive failures before opening circuit
  resetTimeoutMs: number // Time to wait before half-opening a circuit
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Flow is normal
  OPEN = 'OPEN',     // Circuit has tripped, block requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service is restored
}

export interface IPaymentOrchestrator extends PaymentAdapter {
  registerAdapter(type: PSPType, adapter: PaymentAdapter): void
  removeAdapter(type: PSPType): void
  addRoutingRule(rule: RoutingRule): void
  removeRoutingRule(ruleId: string): void
  getCircuitState(type: PSPType): CircuitState
}

export class PSPOrchestrationError extends Error {
  constructor(message: string, public readonly metadata?: Record<string, any>) {
    super(message)
    this.name = 'PSPOrchestrationError'
  }
}

export class CircuitBreakerOpenError extends PSPOrchestrationError {
  constructor(psp: PSPType) {
    super(`Circuit breaker is OPEN for PSP: ${psp}`)
    this.name = 'CircuitBreakerOpenError'
  }
}
