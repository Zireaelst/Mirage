'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Navbar
// ═══════════════════════════════════════════════

import { type ReactNode } from 'react'
import Link from 'next/link'
import { WalletConnect } from '@/components/web3/WalletConnect'

export function Navbar(): ReactNode {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-mirage-border bg-mirage-bg/90 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 border border-mirage-border-bright flex items-center justify-center text-mirage-text-dim group-hover:border-mirage-text transition-colors duration-300">
                        <span className="text-sm font-mono">◈</span>
                    </div>
                    <span className="font-mono text-sm tracking-widest uppercase text-mirage-text">
                        Mirage
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/markets"
                        className="font-mono text-xs tracking-wider uppercase text-mirage-text-dim hover:text-mirage-text transition-colors duration-200"
                    >
                        Markets
                    </Link>
                    <span className="font-mono text-xs tracking-wider uppercase text-mirage-text-dimmer cursor-not-allowed">
                        Docs
                    </span>
                    <span className="font-mono text-xs tracking-wider uppercase text-mirage-text-dimmer cursor-not-allowed">
                        Protocol
                    </span>
                </div>

                {/* Wallet */}
                <WalletConnect />
            </div>
        </nav>
    )
}

// ✓ Navbar.tsx complete
