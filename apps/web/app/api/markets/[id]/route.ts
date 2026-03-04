// ═══════════════════════════════════════════════
// MIRAGE MARKET — Single Market API
// GET: Return market by ID
// ═══════════════════════════════════════════════

import { NextResponse } from 'next/server'

// TODO: Replace with onchain read after deploy
const DEMO_MARKETS: Record<string, Record<string, unknown>> = {
    '0x0000000000000000000000000000000000000000000000000000000000000001': {
        id: '0x0000000000000000000000000000000000000000000000000000000000000001',
        title: 'Will BTC exceed $150,000 by March 2025?',
        description: 'Bitcoin price prediction based on CoinGecko OHLCV data.',
        category: 'CRYPTO',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
        minBet: (1e16).toString(),
        yesOdds: 68,
        noOdds: 32,
        volume: (42e18).toString(),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
}

/**
 * GET /api/markets/[id]
 * Returns a single market by bytes32 ID.
 */
export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    const market = DEMO_MARKETS[params.id]

    if (!market) {
        return NextResponse.json(
            { error: 'Market not found' },
            { status: 404 }
        )
    }

    return NextResponse.json({ market })
}

// ✓ api/markets/[id]/route.ts complete
