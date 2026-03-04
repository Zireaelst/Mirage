'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Live Ticker
// Scrolling market data ticker
// ═══════════════════════════════════════════════

import { type ReactNode } from 'react'

interface TickerItem {
    label: string
    value: string
    positive?: boolean
}

const TICKER_DATA: TickerItem[] = [
    { label: 'BTC > $100K BY MAR', value: '72%', positive: true },
    { label: 'ETH MERGE V2', value: '34%', positive: false },
    { label: 'FED RATE CUT Q2', value: '61%', positive: true },
    { label: 'AI MARKET CAP > $5T', value: '45%', positive: false },
    { label: 'SOL FLIP ETH', value: '12%', positive: false },
    { label: 'CHAINLINK > $50', value: '58%', positive: true },
    { label: 'TRUMP WIN 2024', value: '53%', positive: true },
    { label: 'DEFI TVL > $200B', value: '29%', positive: false },
    { label: 'NEXT L2 UNICORN', value: '41%', positive: false },
    { label: 'BTC HALVING PUMP', value: '67%', positive: true },
]

export function LiveTicker(): ReactNode {
    // Duplicate for seamless infinite scroll
    const items = [...TICKER_DATA, ...TICKER_DATA]

    return (
        <div className="border-y border-mirage-border bg-mirage-bg2 overflow-hidden">
            <div className="ticker-scroll flex items-center whitespace-nowrap py-3">
                {items.map((item, i) => (
                    <div key={`${item.label}-${i}`} className="flex items-center gap-2 mx-6">
                        <span className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider">
                            {item.label}
                        </span>
                        <span
                            className={`font-mono text-[10px] tracking-wider ${item.positive ? 'text-mirage-green' : 'text-mirage-text-dim'
                                }`}
                        >
                            {item.value}
                        </span>
                        <span className="font-mono text-[10px] text-mirage-text-dimmer">│</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ✓ LiveTicker.tsx complete
