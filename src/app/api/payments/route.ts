import { NextResponse } from 'next/server'
import { createIntent, captureIntent } from '@/lib/payments/paymentHelper'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, amount, currency, psp } = body || {}

    if (action === 'create') {
      if (!amount) return NextResponse.json({ error: 'amount required' }, { status: 400 })
      const intent = await createIntent(amount, currency || 'USD', psp)
      return NextResponse.json({ intent })
    }

    if (action === 'capture') {
      if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
      const result = await captureIntent(body.id, psp)
      return NextResponse.json({ intent: result })
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  } catch (err: unknown) {
    if (err instanceof Error) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
