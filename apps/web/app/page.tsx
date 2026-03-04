// ═══════════════════════════════════════════════
// MIRAGE MARKET — Landing Page
// Hero + Ticker + How It Works + Markets + Tech
// ═══════════════════════════════════════════════

import type { ReactNode } from 'react'
import Link from 'next/link'
import { AsciiSphere } from '@/components/ui/AsciiSphere'
import { LiveTicker } from '@/components/ui/LiveTicker'
import { TerminalBlock } from '@/components/ui/TerminalBlock'
import { MarketCard } from '@/components/ui/MarketCard'
import type { Market } from '@/lib/types'

// Mock markets for MVP — replace with API fetch after contract deploy
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
]

export default function LandingPage(): ReactNode {
    return (
        <div className="min-h-screen">
            {/* ═══ HERO SECTION ═══ */}
            <section className="relative min-h-screen flex items-center border-b border-mirage-border overflow-hidden">
                {/* Subtle background grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            'linear-gradient(#e8e8e8 1px, transparent 1px), linear-gradient(to right, #e8e8e8 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                    {/* Left: Copy */}
                    <div className="space-y-8 animate-fade-in-up">
                        <div>
                            <span className="section-label">// 00 PROTOCOL</span>
                        </div>

                        <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight">
                            Your Position.
                            <br />
                            <span className="text-mirage-text-dim">Invisible.</span>
                            <br />
                            Your Proof.
                        </h1>

                        <p className="font-sans text-base text-mirage-text-dim leading-relaxed max-w-md">
                            Privacy-preserving prediction markets. Verify uniquely with World ID.
                            Commit encrypted positions. AI settles via Chainlink CRE.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/markets"
                                className="inline-flex items-center justify-center font-mono text-xs tracking-wider px-6 py-3 border border-mirage-text bg-mirage-text text-mirage-bg hover:bg-transparent hover:text-mirage-text transition-all duration-200"
                            >
                                ENTER MARKETS →
                            </Link>
                            <a
                                href="#how-it-works"
                                className="inline-flex items-center justify-center font-mono text-xs tracking-wider px-6 py-3 border border-mirage-border text-mirage-text-dim hover:border-mirage-border-bright hover:text-mirage-text transition-all duration-200"
                            >
                                HOW IT WORKS
                            </a>
                        </div>

                        {/* Stats row */}
                        <div className="flex gap-8 pt-4 border-t border-mirage-border">
                            <div>
                                <div className="font-mono text-xl text-mirage-text">▓▓▓</div>
                                <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mt-1">
                                    POSITIONS HIDDEN
                                </div>
                            </div>
                            <div>
                                <div className="font-mono text-xl text-mirage-text">ZK</div>
                                <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mt-1">
                                    SYBIL PROOF
                                </div>
                            </div>
                            <div>
                                <div className="font-mono text-xl text-mirage-green">CRE</div>
                                <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mt-1">
                                    AI SETTLEMENT
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: ASCII Sphere */}
                    <div className="hidden lg:flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="border border-mirage-border p-4 bg-mirage-bg2">
                            <AsciiSphere width={70} height={35} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ TICKER ═══ */}
            <LiveTicker />

            {/* ═══ HOW IT WORKS ═══ */}
            <section id="how-it-works" className="border-b border-mirage-border">
                <div className="mx-auto max-w-7xl px-6 py-24">
                    <span className="section-label">// 01 HOW IT WORKS</span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-mirage-border mt-8">
                        {/* Step 1 */}
                        <div className="bg-mirage-bg p-8 space-y-4">
                            <div className="font-mono text-3xl text-mirage-text-dimmer">01</div>
                            <h3 className="font-mono text-sm text-mirage-text">Verify Humanity</h3>
                            <p className="font-sans text-sm text-mirage-text-dim leading-relaxed">
                                Prove unique personhood via World ID. Zero-knowledge proof — no personal data stored.
                                One human, one vote.
                            </p>
                            <div className="font-mono text-[10px] text-mirage-text-dimmer">
                                → World ID Orb verification
                                <br />
                                → ZK proof onchain via CRE
                                <br />→ Sybil-resistant by design
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-mirage-bg p-8 space-y-4">
                            <div className="font-mono text-3xl text-mirage-text-dimmer">02</div>
                            <h3 className="font-mono text-sm text-mirage-text">Commit Position</h3>
                            <p className="font-sans text-sm text-mirage-text-dim leading-relaxed">
                                Choose YES or NO. Your prediction is encrypted with a random salt.
                                Only the hash goes onchain.
                            </p>
                            <div className="font-mono text-[10px] text-mirage-text-dimmer">
                                → keccak256(choice ‖ amount ‖ salt)
                                <br />
                                → Amount hidden from all observers
                                <br />→ Reveal only during claim phase
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-mirage-bg p-8 space-y-4">
                            <div className="font-mono text-3xl text-mirage-text-dimmer">03</div>
                            <h3 className="font-mono text-sm text-mirage-text">AI Settlement</h3>
                            <p className="font-sans text-sm text-mirage-text-dim leading-relaxed">
                                Chainlink CRE workflow fetches real-world data via Confidential HTTP.
                                Deterministic resolution, onchain settlement.
                            </p>
                            <div className="font-mono text-[10px] text-mirage-text-dimmer">
                                → EVM Log trigger on market close
                                <br />
                                → Confidential API fetch (key hidden)
                                <br />→ DON consensus → onchain result
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ MARKETS PREVIEW ═══ */}
            <section className="border-b border-mirage-border">
                <div className="mx-auto max-w-7xl px-6 py-24">
                    <div className="flex items-center justify-between mb-8">
                        <span className="section-label">// 02 ACTIVE MARKETS</span>
                        <Link
                            href="/markets"
                            className="font-mono text-[10px] text-mirage-text-dim hover:text-mirage-text tracking-wider transition-colors"
                        >
                            VIEW ALL →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-mirage-border">
                        {DEMO_MARKETS.map((market) => (
                            <div key={market.id} className="bg-mirage-bg">
                                <MarketCard market={market} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TECHNOLOGY ═══ */}
            <section className="border-b border-mirage-border">
                <div className="mx-auto max-w-7xl px-6 py-24">
                    <span className="section-label">// 03 TECHNOLOGY</span>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        {/* Left: terminal */}
                        <TerminalBlock
                            title="architecture.sol"
                            lines={[
                                'pragma solidity ^0.8.24;',
                                '',
                                '// Layer 1: Identity (World ID + CRE)',
                                'contract IdentityGate { ... }',
                                '',
                                '// Layer 2: Private Predictions',
                                'contract ShadowMarket {',
                                '  // commit-reveal: hash(choice, amt, salt)',
                                '  function commitPosition(',
                                '    bytes32 marketId,',
                                '    bytes32 commitment  // ← only this is stored',
                                '  ) external payable;',
                                '}',
                                '',
                                '// Layer 3: AI Settlement',
                                'contract SettlementReceiver {',
                                '  // CRE forwarder → onchain result',
                                '  function receiveSettlement(...)',
                                '}',
                            ]}
                        />

                        {/* Right: stack details */}
                        <div className="space-y-4">
                            {[
                                {
                                    label: 'CHAINLINK CRE',
                                    desc: 'TypeScript workflows for identity verification and AI-powered market settlement. Confidential HTTP ensures API keys never touch the chain.',
                                },
                                {
                                    label: 'WORLD ID',
                                    desc: 'Orb-level verification via CRE. Prove humanity without revealing identity. One person = one set of predictions.',
                                },
                                {
                                    label: 'COMMIT-REVEAL',
                                    desc: 'Positions encrypted with random salt. Only keccak256 hash stored onchain. Your choice and amount stay invisible until claim.',
                                },
                                {
                                    label: 'TENDERLY VTN',
                                    desc: 'Deployed on Tenderly Virtual TestNet — a Sepolia fork with admin RPC, unlimited faucet, and built-in transaction debugging.',
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="dither-hover border border-mirage-border p-5 transition-all duration-300 hover:border-mirage-border-bright"
                                >
                                    <div className="font-mono text-[10px] text-mirage-text-dimmer tracking-wider mb-2 relative z-10">
                                        {item.label}
                                    </div>
                                    <p className="font-sans text-sm text-mirage-text-dim leading-relaxed relative z-10">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section>
                <div className="mx-auto max-w-7xl px-6 py-24 text-center">
                    <h2 className="font-mono text-2xl md:text-3xl mb-4">
                        Ready to predict?
                    </h2>
                    <p className="font-sans text-sm text-mirage-text-dim mb-8 max-w-md mx-auto">
                        Verify your identity. Place encrypted positions.
                        <br />
                        No one sees your bet — not even us.
                    </p>
                    <Link
                        href="/markets"
                        className="inline-flex items-center justify-center font-mono text-xs tracking-wider px-8 py-4 border border-mirage-text bg-mirage-text text-mirage-bg hover:bg-transparent hover:text-mirage-text transition-all duration-200"
                    >
                        LAUNCH APP →
                    </Link>
                </div>
            </section>
        </div>
    )
}

// ✓ page.tsx complete
