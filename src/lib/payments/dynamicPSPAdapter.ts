import { PaymentAdapter, PaymentIntent } from './adapter'
import {
  PSPType,
  RoutingRule,
  RoutingContext,
  CircuitBreakerConfig,
  CircuitState,
  IPaymentOrchestrator,
  PSPOrchestrationError,
  CircuitBreakerOpenError
} from './types'

export class DynamicPSPAdapter implements IPaymentOrchestrator {
  private adapters: Map<PSPType, PaymentAdapter> = new Map()
  private routingRules: RoutingRule[] = []
  private defaultPsp: PSPType

  // Circuit Breaker State
  private circuitStates: Map<PSPType, CircuitState> = new Map()
  private failureCounts: Map<PSPType, number> = new Map()
  private nextAttemptTimeout: Map<PSPType, number> = new Map()
  
  private cbConfig: CircuitBreakerConfig = {
    failureThreshold: 3,
    resetTimeoutMs: 30000 // 30 seconds
  }

  constructor(defaultPsp: PSPType = PSPType.STRIPE) {
    this.defaultPsp = defaultPsp
  }

  public registerAdapter(type: PSPType, adapter: PaymentAdapter): void {
    this.adapters.set(type, adapter)
    this.circuitStates.set(type, CircuitState.CLOSED)
    this.failureCounts.set(type, 0)
  }

  public removeAdapter(type: PSPType): void {
    this.adapters.delete(type)
    this.circuitStates.delete(type)
    this.failureCounts.delete(type)
  }

  public addRoutingRule(rule: RoutingRule): void {
    this.routingRules.push(rule)
    // Keep sorted by priority descending
    this.routingRules.sort((a, b) => b.priority - a.priority)
  }

  public removeRoutingRule(ruleId: string): void {
    this.routingRules = this.routingRules.filter(r => r.id !== ruleId)
  }

  public getCircuitState(type: PSPType): CircuitState {
    this.checkHalfOpenState(type)
    return this.circuitStates.get(type) ?? CircuitState.CLOSED
  }

  /**
   * Internal Circuit Breaker Logic
   */
  private checkHalfOpenState(type: PSPType) {
    const currentState = this.circuitStates.get(type)
    if (currentState === CircuitState.OPEN) {
      const resetTime = this.nextAttemptTimeout.get(type)
      if (resetTime && Date.now() > resetTime) {
        // Time has elapsed, move to HALF_OPEN to test if service is back
        this.circuitStates.set(type, CircuitState.HALF_OPEN)
      }
    }
  }

  private recordSuccess(type: PSPType) {
    if (this.circuitStates.get(type) === CircuitState.HALF_OPEN) {
      this.circuitStates.set(type, CircuitState.CLOSED)
    }
    this.failureCounts.set(type, 0) // Reset failure count on success
  }

  private recordFailure(type: PSPType) {
    const currentFailures = (this.failureCounts.get(type) || 0) + 1
    this.failureCounts.set(type, currentFailures)

    const currentState = this.circuitStates.get(type)
    if (currentState === CircuitState.HALF_OPEN || currentFailures >= this.cbConfig.failureThreshold) {
      this.circuitStates.set(type, CircuitState.OPEN)
      this.nextAttemptTimeout.set(type, Date.now() + this.cbConfig.resetTimeoutMs)
      console.warn(`[CircuitBreaker] TRIPPED! State for ${type} changed to OPEN. Calls will be blocked for ${this.cbConfig.resetTimeoutMs}ms.`)
    }
  }

  /**
   * Routing Logic
   */
  private determinePSP(context: RoutingContext): PSPType {
    // Evaluate rules in order of priority
    for (const rule of this.routingRules) {
      try {
        if (rule.evaluate(context)) {
          const state = this.getCircuitState(rule.targetPsp)
          if (state !== CircuitState.OPEN) {
            return rule.targetPsp
          } else {
            console.warn(`[DynamicPSPAdapter] Match found for ${rule.id}, but ${rule.targetPsp} circuit is OPEN. Continuing rules evaluation.`)
          }
        }
      } catch (err) {
        console.error(`[DynamicPSPAdapter] Error evaluating rule ${rule.id}:`, err)
      }
    }

    // Fallback to default PSP
    const defaultState = this.getCircuitState(this.defaultPsp)
    if (defaultState === CircuitState.OPEN) {
      console.error(`[DynamicPSPAdapter] Default PSP (${this.defaultPsp}) is currently OPEN. Attempting global fallback.`)
      // Try finding *any* registered adapter that is responsive
      for (const [pspType, _] of this.adapters.entries()) {
        if (this.getCircuitState(pspType) !== CircuitState.OPEN) {
          console.warn(`[DynamicPSPAdapter] Global Fallback -> routing to emergency PSP: ${pspType}`)
          return pspType // First available fallback
        }
      }
      throw new PSPOrchestrationError('All available Payment Service Providers are currently unavailable.')
    }
    
    return this.defaultPsp
  }

  private getAdapterInstance(type: PSPType): PaymentAdapter {
    const adapter = this.adapters.get(type)
    if (!adapter) {
      throw new PSPOrchestrationError(`Adapter for PSP type ${type} is not registered.`)
    }
    return adapter
  }

  /**
   * Core PaymentAdapter Interface Execution
   */

  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, unknown>): Promise<PaymentIntent> {
    const context: RoutingContext = { amount, currency, metadata }
    let selectedPsp: PSPType

    try {
      selectedPsp = this.determinePSP(context)
      const adapter = this.getAdapterInstance(selectedPsp)

      // Execute and monitor the call
      const startTime = Date.now()
      const result = await adapter.createPaymentIntent(amount, currency, metadata)
      
      this.recordSuccess(selectedPsp)
      return { ...result, metadata: { ...result.metadata, routedVia: selectedPsp } } as PaymentIntent // Annotate result
      
    } catch (error) {
       console.error(`[DynamicPSPAdapter] Failure executing createPaymentIntent:`, error)
       if (error instanceof Error && error.name !== 'PSPOrchestrationError' && selectedPsp!) {
         // This is likely an adapter-specific failure (e.g. network timeout)
         this.recordFailure(selectedPsp)
         
         // Attempt one layer of automatic retry fallback on a different PSP if possible
         console.info(`[DynamicPSPAdapter] Attempting automatic failover after error in ${selectedPsp}...`)
         for (const [fallbackType, fallbackAdapter] of this.adapters.entries()) {
           if (fallbackType !== selectedPsp && this.getCircuitState(fallbackType) !== CircuitState.OPEN) {
             console.info(`[DynamicPSPAdapter] Failover matched: Executing via ${fallbackType}...`)
             try {
                const retryResult = await fallbackAdapter.createPaymentIntent(amount, currency, metadata)
                console.log(`[DynamicPSPAdapter] Failover to ${fallbackType} succeeded! id=${retryResult.id}`)
                this.recordSuccess(fallbackType)
                return { ...retryResult, metadata: { ...retryResult.metadata, routedVia: fallbackType, wasFailover: true } } as PaymentIntent
             } catch (fallbackError) {
                console.error(`[DynamicPSPAdapter] Failover to ${fallbackType} also failed.`, fallbackError)
                this.recordFailure(fallbackType)
             }
           }
         }
       }
       throw new PSPOrchestrationError('PaymentIntent creation failed on all available routing paths.', { originalError: error })
    }
  }

  async retrievePaymentIntent(id: string): Promise<PaymentIntent> {
    // Note: Retrieving an intent implies we must check all adapters if we don't know who owns it,
    // or rely on ID prefixes. We will use a naive approach: check all until one responds, 
    // honoring circuit breakers to prevent timeouts on dead PSPs.
    
    let lastError: unknown
    for (const [pspType, adapter] of this.adapters.entries()) {
      if (this.getCircuitState(pspType) === CircuitState.OPEN) continue

      try {
        const result = await adapter.retrievePaymentIntent(id)
        if (result) return result
      } catch (err: unknown) {
        lastError = err
        // Don't trip breaker for 404s, but maybe for 500s. We'll skip complex logic for now.
      }
    }
    throw new PSPOrchestrationError(`Could not retrieve PaymentIntent ${id} across any available PSP networks.`, { lastError })
  }

  async capturePayment(id: string): Promise<PaymentIntent> {
    // Similar to retrieve, we might need a routing prefix. For the challenge, we broadcast to available adapters.
    for (const [pspType, adapter] of this.adapters.entries()) {
       if (this.getCircuitState(pspType) === CircuitState.OPEN) continue
       try {
         // Assumes capture fails gracefully if intent not found on this PSP
         const result = await adapter.capturePayment(id)
         if (result && result.status === 'COMPLETED') {
           this.recordSuccess(pspType)
           return result
         }
       } catch (err) {
         // Silently fail and try next provider if it's a 404/not_found
       }
    }
    throw new PSPOrchestrationError(`Failed to capture PaymentIntent ${id} - no valid PSP found owning this transaction.`)
  }
}
