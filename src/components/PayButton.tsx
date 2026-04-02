"use client"
import React, { useState } from 'react'

type Props = { amount: number; currency?: string; psp?: string }

export default function PayButton({ amount, currency = 'USD', psp }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handlePay() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', amount, currency, psp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'payment create failed')
      setMessage(`Created intent ${data.intent.id} (status: ${data.intent.status})`)
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handlePay} disabled={loading} className="btn">
        {loading ? 'Processing…' : `Pay ${amount / 100} ${currency}`}
      </button>
      {message && <div className="mt-2 text-sm">{message}</div>}
    </div>
  )
}
