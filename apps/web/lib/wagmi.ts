// ═══════════════════════════════════════════════
// MIRAGE MARKET — Wagmi v2 Configuration
// ═══════════════════════════════════════════════

import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { defineChain } from 'viem'
import { injected, walletConnect } from 'wagmi/connectors'

/** Tenderly Virtual TestNet — forked from Sepolia */
export const mirageTestnet = defineChain({
    id: 99999,
    name: 'Mirage Testnet',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_TENDERLY_RPC_URL ?? 'https://virtual.sepolia.rpc.tenderly.co/placeholder'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Tenderly Explorer',
            url: 'https://dashboard.tenderly.co',
        },
    },
    testnet: true,
})

/** All chains supported by Mirage Market */
export const SUPPORTED_CHAINS = [mirageTestnet, sepolia] as const

/** Wagmi v2 config */
export const config = createConfig({
    chains: SUPPORTED_CHAINS,
    connectors: [
        injected(),
        ...(process.env.NEXT_PUBLIC_WALLETCONNECT_ID
            ? [
                walletConnect({
                    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
                    metadata: {
                        name: 'Mirage Market',
                        description: 'Private Prediction Protocol',
                        url: 'https://mirage.market',
                        icons: [],
                    },
                }),
            ]
            : []),
    ],
    transports: {
        [mirageTestnet.id]: http(
            process.env.NEXT_PUBLIC_TENDERLY_RPC_URL ?? 'https://virtual.sepolia.rpc.tenderly.co/placeholder'
        ),
        [sepolia.id]: http(),
    },
    ssr: true,
})

// ✓ wagmi.ts complete
