'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Markets Listing Page
// ═══════════════════════════════════════════════

import { useState, useMemo, type ReactNode } from 'react'
import { MarketCard } from '@/components/ui/MarketCard'
import type { Market, MarketCategory } from '@/lib/types'

// Demo markets — replace with useMarkets() hook after contract deploy
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
    {
        id: '0x0000000000000000000000000000000000000000000000000000000000000004',
        title: 'ETH/BTC ratio above 0.05 by end of Q1?',
        description: 'Ethereum vs Bitcoin relative strength prediction.',
        category: 'CRYPTO',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 15,
        minBet: BigInt(1e16),
        yesOdds: 23,
        noOdds: 77,
        volume: BigInt(8e18),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
    {
        id: '0x0000000000000000000000000000000000000000000000000000000000000005',
        title: 'Will Chainlink CCIP reach 10M txns?',
        description: 'Cross-chain interoperability protocol usage prediction.',
        category: 'PROTOCOL',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 45,
        minBet: BigInt(1e16),
        yesOdds: 38,
        noOdds: 62,
        volume: BigInt(5e18),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
    {
        id: '0x0000000000000000000000000000000000000000000000000000000000000006',
        title: 'Champions League: Real Madrid wins 2025?',
        description: 'UEFA Champions League outcome prediction.',
        category: 'SPORTS',
        endTime: Math.floor(Date.now() / 1000) + 86400 * 120,
        minBet: BigInt(1e16),
        yesOdds: 31,
        noOdds: 69,
        volume: BigInt(12e18),
        status: 'OPEN',
        outcome: null,
        isPrivate: true,
    },
]

type FilterCategory = 'ALL' | MarketCategory

const FILTER_CATEGORIES: FilterCategory[] = ['ALL', 'CRYPTO', 'MACRO', 'AI', 'SPORTS', 'PROTOCOL', 'OTHER']

export default function MarketsPage(): ReactNode {
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL')

    const filtered = useMemo(() => {
        if (activeFilter === 'ALL') return DEMO_MARKETS
        return DEMO_MARKETS.filter((m) => m.category === activeFilter)
    }, [activeFilter])

    return (
        <div className="min-h-screen pt-24">
            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <span className="section-label">// MARKETS</span>
                        <h1 className="font-mono text-2xl mt-4">Active Predictions</h1>
                        <p className="font-sans text-sm text-mirage-text-dim mt-2">
                            All positions are encrypted. Only commitment hashes stored onchain.
                        </p>
                    </div>

                    {/* Create Market — disabled in MVP */}
                    <div className="relative group">
                        <button
                            disabled
                            className="font-mono text-xs tracking-wider px-4 py-2 border border-mirage-border opacity-30"
                        >
                            + CREATE MARKET
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-mirage-surface border border-mirage-border px-3 py-1.5 whitespace-nowrap">
                                <span className="font-mono text-[10px] text-mirage-text-dim">
                  // coming soon
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap gap-0 mb-8 border border-mirage-border inline-flex">
                    {FILTER_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`font-mono text-[10px] tracking-wider px-4 py-2 border-r border-mirage-border last:border-r-0 transition-all duration-200 ${activeFilter === cat
                                    ? 'bg-mirage-text text-mirage-bg'
                                    : 'bg-transparent text-mirage-text-dim hover:text-mirage-text hover:bg-mirage-bg2'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Markets grid */}
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-mirage-border">
                        {filtered.map((market) => (
                            <div key={market.id} className="bg-mirage-bg">
                                <MarketCard market={market} />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="border border-mirage-border p-16 text-center">
                        <pre className="font-mono text-xs text-mirage-text-dimmer leading-relaxed inline-block text-left">
                            {`
  ╔══════════════════════════╗
  ║                          ║
  ║    NO MARKETS FOUND      ║
  ║                          ║
  ║    try a different        ║
  ║    category filter        ║
  ║                          ║
  ╚══════════════════════════╝
`}
                        </pre>
                    </div>
                )}

                {/* Bottom info */}
                <div className="mt-8 border-t border-mirage-border pt-6">
                    <p className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                        ▓ ALL POSITIONS ENCRYPTED — AMOUNTS AND CHOICES HIDDEN FROM OBSERVERS — COMMIT-REVEAL SCHEME
                    </p>
                </div>
            </div>
        </div>
    )
}

// ✓ markets/page.tsx complete
