'use client'

// ═══════════════════════════════════════════════
// MIRAGE MARKET — Wallet Connect Button
// ═══════════════════════════════════════════════

import { type ReactNode } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

/** Truncate address: 0x1234...abcd */
function truncateAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletConnect(): ReactNode {
    const { address, isConnected, isConnecting } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()

    if (isConnected && address) {
        return (
            <button
                onClick={() => disconnect()}
                className="font-mono text-xs tracking-wider px-4 py-2 border border-mirage-border hover:border-mirage-border-bright transition-all duration-200 group"
            >
                <span className="text-mirage-text-dim group-hover:text-mirage-text transition-colors">
                    {truncateAddress(address)}
                </span>
            </button>
        )
    }

    return (
        <button
            onClick={() => {
                // Prefer injected (MetaMask), fallback to first available
                const injectedConnector = connectors.find((c) => c.id === 'injected')
                const connector = injectedConnector ?? connectors[0]
                if (connector) {
                    connect({ connector })
                }
            }}
            disabled={isConnecting}
            className="font-mono text-xs tracking-wider px-4 py-2 border border-mirage-border hover:border-mirage-text hover:bg-mirage-text hover:text-mirage-bg transition-all duration-200"
        >
            {isConnecting ? '// connecting...' : '// connect'}
        </button>
    )
}

// ✓ WalletConnect.tsx complete
