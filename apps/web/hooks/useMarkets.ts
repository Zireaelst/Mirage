'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — useMarkets Hook
// Fetches markets from API
// ═══════════════════════════════════════════════

import { useQuery } from '@tanstack/react-query'
import type { Market } from '@/lib/types'

interface MarketsApiResponse {
    markets: Array<Omit<Market, 'minBet' | 'volume'> & { minBet: string; volume: string }>
}

/** Deserialize BigInt fields from API response */
function deserializeMarket(raw: MarketsApiResponse['markets'][number]): Market {
    return {
        ...raw,
        minBet: BigInt(raw.minBet),
        volume: BigInt(raw.volume),
    }
}

export function useMarkets() {
    return useQuery<Market[]>({
        queryKey: ['markets'],
        queryFn: async (): Promise<Market[]> => {
            const response = await fetch('/api/markets')
            if (!response.ok) throw new Error('Failed to fetch markets')

            const data = (await response.json()) as MarketsApiResponse
            return data.markets.map(deserializeMarket)
        },
        staleTime: 30_000, // 30 seconds
    })
}

// ✓ useMarkets.ts complete
