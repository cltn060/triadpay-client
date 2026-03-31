import { PaymentAdapter } from './adapter'
import { StripeAdapter } from './stripeAdapter'
import { PayPalAdapter } from './paypalAdapter'
import { DynamicPSPAdapter } from './dynamicPSPAdapter'
import { PSPType, RoutingRule } from './types'

export type PSP = 'stripe' | 'paypal'

// Singleton instance to hold state (circuit breakers need to persist)
let dynamicAdapterInstance: DynamicPSPAdapter | null = null

export function getPaymentAdapter(name?: string): PaymentAdapter {
  // If explicitly requested a simple named one, bypass orchestrator (useful for testing or direct routing)
  if (name?.toLowerCase() === 'paypal') return new PayPalAdapter()
  if (name?.toLowerCase() === 'stripe') return new StripeAdapter()
  
  // Otherwise, construct and return the Enterprise-Grade Orchestrator
  if (!dynamicAdapterInstance) {
    dynamicAdapterInstance = new DynamicPSPAdapter(PSPType.STRIPE)
    
    // Wire up existing concrete adapters
    dynamicAdapterInstance.registerAdapter(PSPType.STRIPE, new StripeAdapter())
    dynamicAdapterInstance.registerAdapter(PSPType.PAYPAL, new PayPalAdapter())

    // Example Routing Rule: Enterprise A/B Testing Rule (20% traffic to PayPal)
    const paypalExperiment: RoutingRule = {
       id: 'paypal-ab-test-v1',
       description: 'Route roughly 20% of traffic to PayPal for experiment',
       priority: 50, // High priority
       targetPsp: PSPType.PAYPAL,
       evaluate: (context) => {
         // Simple hash based on metadata or user ID for sticky routing
         const seed = context.userId ? context.userId.length : (Math.random() * 10)
         return seed % 5 === 0 // ~20% matching
       }
    }

    // Example Routing Rule: Anti-Fraud/High-Value Transactions -> Enforce Stripe (Stripe Radar rules)
    const highValueRule: RoutingRule = {
      id: 'high-value-stripe',
      description: 'Transactions over $1000 always go to Stripe',
      priority: 100, // Highest priority, bypasses A/B tests
      targetPsp: PSPType.STRIPE,
      evaluate: (context) => context.amount > 1000
    }

    dynamicAdapterInstance.addRoutingRule(paypalExperiment)
    dynamicAdapterInstance.addRoutingRule(highValueRule)

    console.log('[PaymentFactory] Initialized Enterprise DynamicPSPAdapter with load balancing.')
  }

  return dynamicAdapterInstance as unknown as PaymentAdapter
}
