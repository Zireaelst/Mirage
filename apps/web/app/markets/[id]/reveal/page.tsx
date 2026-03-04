// ═══════════════════════════════════════════════
// MIRAGE MARKET — Reveal & Claim Page
// Shows user's commitment + claim flow for settled markets
// ═══════════════════════════════════════════════

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ClaimWinnings } from '@/components/web3/ClaimWinnings'
import type { Market } from '@/lib/types'

// Demo data — replace with onchain fetch after contract deploy
const DEMO_MARKETS: Record<string, Market> = {
    '0x0000000000000000000000000000000000000000000000000000000000000001': {
        id: '0x0000000000000000000000000000000000000000000000000000000000000001',
        title: 'Will BTC exceed $150,000 by March 2025?',
        description: 'Bitcoin price prediction based on CoinGecko OHLCV data.',
        category: 'CRYPTO',
        endTime: Math.floor(Date.now() / 1000) - 86400,
        minBet: BigInt(1e16),
        yesOdds: 68,
        noOdds: 32,
        volume: BigInt(42e18),
        status: 'SETTLED',
        outcome: true,
        isPrivate: true,
    },
}

interface RevealPageProps {
    params: Promise<{ id: string }>
}

export default async function RevealPage({ params }: RevealPageProps): Promise<ReactNode> {
    const { id } = await params
    const market = DEMO_MARKETS[id] ?? null

    if (!market) {
        return (
            <div className="min-h-screen pt-24">
                <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                    <div className="font-mono text-sm text-mirage-text-dimmer">
                        // market not found
                    </div>
                    <Link
                        href="/markets"
                        className="inline-block mt-4 font-mono text-xs text-mirage-text-dim hover:text-mirage-text transition-colors"
                    >
                        ← back to markets
                    </Link>
                </div>
            </div>
        )
    }

    if (market.status !== 'SETTLED') {
        return (
            <div className="min-h-screen pt-24">
                <div className="mx-auto max-w-3xl px-6 py-24">
                    <Link
                        href={`/markets/${id}`}
                        className="font-mono text-[10px] text-mirage-text-dim hover:text-mirage-text tracking-wider transition-colors"
                    >
                        ← BACK TO MARKET
                    </Link>

                    <div className="mt-8 border border-mirage-border p-8 bg-mirage-bg2 text-center">
                        <div className="font-mono text-sm text-mirage-text-dimmer mb-2">
                            // market not yet settled
                        </div>
                        <p className="font-sans text-sm text-mirage-text-dim">
                            This market must be settled before you can reveal and claim.
                            Check back after the market closes and the CRE workflow processes the outcome.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-24">
            <div className="mx-auto max-w-3xl px-6 py-12">
                {/* Breadcrumb */}
                <Link
                    href={`/markets/${id}`}
                    className="font-mono text-[10px] text-mirage-text-dim hover:text-mirage-text tracking-wider transition-colors"
                >
                    ← BACK TO MARKET
                </Link>

                {/* Market header */}
                <div className="mt-8 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="font-mono text-[10px] tracking-wider text-mirage-text-dimmer uppercase">
                            {market.category}
                        </span>
                        <span className="font-mono text-[10px] tracking-wider text-mirage-green">
                            SETTLED
                        </span>
                    </div>
                    <h1 className="font-mono text-xl text-mirage-text mb-2">
                        {market.title}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] text-mirage-text-dimmer">
                            OUTCOME: {market.outcome ? 'YES ✓' : 'NO ✗'}
                        </span>
                    </div>
                </div>

                {/* Outcome bar */}
                <div className="mb-8 border border-mirage-border p-4 bg-mirage-bg2">
                    <div className="flex justify-between mb-2">
                        <span className={`font-mono text-xs ${market.outcome ? 'text-mirage-green' : 'text-mirage-text-dim'}`}>
                            YES {market.yesOdds}%
                        </span>
                        <span className={`font-mono text-xs ${!market.outcome ? 'text-mirage-green' : 'text-mirage-text-dim'}`}>
                            NO {market.noOdds}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-mirage-border overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${market.outcome ? 'bg-mirage-green' : 'bg-mirage-text'}`}
                            style={{ width: `${market.yesOdds}%` }}
                        />
                    </div>
                </div>

                {/* Claim component */}
                <ClaimWinnings market={market} />

                {/* Info box */}
                <div className="mt-8 border border-mirage-border p-5 bg-mirage-bg2">
                    <span className="section-label text-[10px]">// HOW REVEAL WORKS</span>
                    <div className="mt-4 space-y-3">
                        <div className="flex gap-3">
                            <span className="font-mono text-mirage-text-dimmer text-xs">01</span>
                            <p className="font-sans text-sm text-mirage-text-dim">
                                Your commitment hash is verified against the stored preimage (choice + amount + salt).
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <span className="font-mono text-mirage-text-dimmer text-xs">02</span>
                            <p className="font-sans text-sm text-mirage-text-dim">
                                If the hash matches and you predicted correctly, your payout is calculated.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <span className="font-mono text-mirage-text-dimmer text-xs">03</span>
                            <p className="font-sans text-sm text-mirage-text-dim">
                                The reveal transaction makes your prediction public — this is the tradeoff for claiming.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ✓ reveal/page.tsx complete
