// ═══════════════════════════════════════════════
// MIRAGE MARKET — Markets API (List)
// GET: Return all markets
// ═══════════════════════════════════════════════

import { NextResponse } from 'next/server'
import type { Market } from '@/lib/types'

// TODO: Replace with onchain reads via viem publicClient after deploy
const DEMO_MARKETS: Market[] = [
    {
        id: '0x0000000000000000000000000000000000000000000000000000000000000001',
        title: 'Will BTC exceed $150,000 by March 2025?',
        description: 'Bitcoin price prediction based on CoinGecko OHLCV data.',
        category: 'CRYPTO',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
        minBet: BigInt(1e16),
        yesOdds: 68,
        noOdds: 32,
        volume: BigInt(42e18),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
    {
        id: '0x0000000000000000000000000000000000000000000000000000000000000002',
        title: 'Will the Fed cut rates in Q2 2025?',
        description: 'Federal Reserve monetary policy prediction.',
        category: 'MACRO',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 60,
        minBet: BigInt(5e15),
        yesOdds: 55,
        noOdds: 45,
        volume: BigInt(18e18),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
    {
        id: '0x0000000000000000000000000000000000000000000000000000000000000003',
        title: 'Will GPT-5 be released before July 2025?',
        description: 'OpenAI next-gen model release prediction.',
        category: 'AI',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 90,
        minBet: BigInt(1e16),
        yesOdds: 42,
        noOdds: 58,
        volume: BigInt(27e18),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
]

/**
 * GET /api/markets
 * Returns all markets. BigInt values serialized as strings.
 */
export async function GET(): Promise<NextResponse> {
    // Serialize BigInt values for JSON
    const serialized = DEMO_MARKETS.map((m) => ({
        ...m,
        minBet: m.minBet.toString(),
        volume: m.volume.toString(),
    }))

    return NextResponse.json({ markets: serialized })
}

// ✓ api/markets/route.ts complete
