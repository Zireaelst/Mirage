// ═══════════════════════════════════════════════
// MIRAGE MARKET — Shared TypeScript Types
// ═══════════════════════════════════════════════

/** Market categories for filtering */
export type MarketCategory = 'CRYPTO' | 'MACRO' | 'AI' | 'SPORTS' | 'PROTOCOL' | 'OTHER'

/** Market lifecycle status */
export type MarketStatus = 'OPEN' | 'CLOSED' | 'SETTLED'

/** Transaction lifecycle status */
export type TxStatus = 'idle' | 'pending' | 'mining' | 'success' | 'error'

/** Core market data structure — mirrors ShadowMarket.sol struct */
export interface Market {
    id: `0x${string}`            // bytes32 marketId
    title: string
    description: string
    category: MarketCategory
    endTime: number              // unix timestamp
    minBet: bigint               // in wei
    yesOdds: number              // 0-100
    noOdds: number               // 0-100
    volume: bigint
    status: MarketStatus
    outcome: boolean | null
    isPrivate: true              // always true in Mirage — positions are hidden
}

/** Commitment data for commit-reveal scheme */
export interface CommitmentData {
    marketId: `0x${string}`
    commitment: `0x${string}`    // keccak256(choice + amount + salt)
    encryptedData: `0x${string}`
}

/** Locally stored commitment preimage — needed for reveal/claim phase */
export interface StoredCommitment {
    marketId: `0x${string}`
    salt: `0x${string}`          // random bytes32
    choice: boolean              // true = YES, false = NO
    amount: string               // wei as string for localStorage serialization
    timestamp: number
}

/** World ID proof returned by IDKit */
export interface WorldIDProof {
    merkle_root: string
    nullifier_hash: string
    proof: string
    verification_level: 'orb' | 'device'
}

/** Verified user record */
export interface VerifiedUser {
    address: `0x${string}`
    nullifierHash: `0x${string}`
    verifiedAt: number
}

/** RP signature response from /api/world-id/rp-signature */
export interface RPSignatureResponse {
    sig: string
    nonce: string
    created_at: string
    expires_at: string
}

/** API response wrapper */
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}

/** Data for revealing a commitment during claim phase */
export interface RevealData {
    marketId: `0x${string}`
    choice: boolean
    amount: bigint
    salt: `0x${string}`
}

/** User's portfolio position (aggregated from localStorage + onchain) */
export interface PortfolioPosition {
    marketId: `0x${string}`
    marketTitle: string
    category: MarketCategory
    choice: boolean
    amount: string               // wei as string
    status: 'committed' | 'revealed' | 'claimed' | 'lost'
    marketStatus: MarketStatus
    outcome: boolean | null
    committedAt: number
    payout?: string              // wei as string, only after claim
}

/** Settlement record from SettlementReceiver */
export interface SettlementRecord {
    marketId: `0x${string}`
    marketTitle: string
    outcome: boolean
    settledAt: number
    proof: `0x${string}`
    txHash?: `0x${string}`
}

/** Input for creating a new market */
export interface CreateMarketInput {
    title: string
    description: string
    category: MarketCategory
    endTime: number              // unix timestamp
    minBet: string               // ETH as string (converted to wei before tx)
}

/** Tenderly simulation result */
export interface SimulationResult {
    success: boolean
    gasUsed: number
    error?: string
    logs?: string[]
}

/** Portfolio aggregate statistics */
export interface PortfolioStats {
    totalCommitted: bigint
    totalClaimed: bigint
    totalPositions: number
    winCount: number
    lossCount: number
    pendingCount: number
}

// ✓ types.ts complete
