// ═══════════════════════════════════════════════
// MIRAGE MARKET — Contract Addresses & ABIs
// ═══════════════════════════════════════════════

// Deploy to Tenderly VTN, then update these addresses
// Run: npm run deploy:contracts to auto-populate deployments.json
export const CONTRACT_ADDRESSES = {
    identityGate: '0x0000000000000000000000000000000000000001' as `0x${string}`,
    shadowMarket: '0x0000000000000000000000000000000000000002' as `0x${string}`,
    settlementReceiver: '0x0000000000000000000000000000000000000003' as `0x${string}`,
    // WorldIDRouter on Sepolia — official address
    worldIdRouter: '0x469449f251692e0779667583026b5a1e99512157' as `0x${string}`,
} as const

// ── IdentityGate ABI ──
export const IDENTITY_GATE_ABI = [
    {
        inputs: [{ name: '_worldIdRouter', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            { name: 'root', type: 'uint256' },
            { name: 'signalHash', type: 'uint256' },
            { name: 'nullifierHash', type: 'uint256' },
            { name: 'externalNullifierHash', type: 'uint256' },
            { name: 'proof', type: 'uint256[8]' },
        ],
        name: 'verifyAndRegister',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'verifiedUsers',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'hash', type: 'uint256' }],
        name: 'nullifierHashes',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'user', type: 'address' },
            { indexed: true, name: 'nullifierHash', type: 'uint256' },
        ],
        name: 'UserVerified',
        type: 'event',
    },
    { inputs: [], name: 'AlreadyVerified', type: 'error' },
    { inputs: [], name: 'DuplicateNullifier', type: 'error' },
    { inputs: [], name: 'InvalidProof', type: 'error' },
] as const

// ── ShadowMarket ABI ──
export const SHADOW_MARKET_ABI = [
    {
        inputs: [{ name: '_identityGate', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'endTime', type: 'uint256' },
            { name: 'minBet', type: 'uint256' },
        ],
        name: 'createMarket',
        outputs: [{ name: 'marketId', type: 'bytes32' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'marketId', type: 'bytes32' },
            { name: 'commitment', type: 'bytes32' },
        ],
        name: 'commitPosition',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [{ name: 'marketId', type: 'bytes32' }],
        name: 'getMarket',
        outputs: [
            {
                components: [
                    { name: 'id', type: 'bytes32' },
                    { name: 'title', type: 'string' },
                    { name: 'description', type: 'string' },
                    { name: 'endTime', type: 'uint256' },
                    { name: 'minBet', type: 'uint256' },
                    { name: 'commitCount', type: 'uint256' },
                    { name: 'totalPool', type: 'uint256' },
                    { name: 'status', type: 'uint8' },
                    { name: 'outcome', type: 'bool' },
                    { name: 'outcomeSet', type: 'bool' },
                    { name: 'creator', type: 'address' },
                ],
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getMarketCount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'marketId', type: 'bytes32' }],
        name: 'closeMarket',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'marketId', type: 'bytes32' },
            { name: 'outcome', type: 'bool' },
        ],
        name: 'settleMarket',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: 'marketId', type: 'bytes32' },
            { name: 'choice', type: 'bool' },
            { name: 'amount', type: 'uint256' },
            { name: 'salt', type: 'bytes32' },
        ],
        name: 'claimWinnings',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'forwarder', type: 'address' }],
        name: 'setSettlementReceiver',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    // Events
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'marketId', type: 'bytes32' },
            { indexed: true, name: 'creator', type: 'address' },
            { indexed: false, name: 'title', type: 'string' },
            { indexed: false, name: 'endTime', type: 'uint256' },
        ],
        name: 'MarketCreated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'marketId', type: 'bytes32' },
            { indexed: true, name: 'user', type: 'address' },
            // NOTE: commitment only — no amount or choice emitted (privacy)
            { indexed: false, name: 'commitment', type: 'bytes32' },
        ],
        name: 'PositionCommitted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, name: 'marketId', type: 'bytes32' }],
        name: 'MarketClosed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'marketId', type: 'bytes32' },
            { indexed: false, name: 'outcome', type: 'bool' },
        ],
        name: 'MarketSettled',
        type: 'event',
    },
    // Errors
    { inputs: [], name: 'MarketNotFound', type: 'error' },
    { inputs: [], name: 'AlreadyCommitted', type: 'error' },
    { inputs: [], name: 'InsufficientBet', type: 'error' },
    { inputs: [], name: 'NotVerified', type: 'error' },
    { inputs: [], name: 'MarketNotOpen', type: 'error' },
    { inputs: [], name: 'Unauthorized', type: 'error' },
    { inputs: [], name: 'MarketNotSettled', type: 'error' },
    { inputs: [], name: 'InvalidReveal', type: 'error' },
] as const

// ── SettlementReceiver ABI ──
export const SETTLEMENT_RECEIVER_ABI = [
    {
        inputs: [{ name: '_shadowMarket', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            { name: 'marketId', type: 'bytes32' },
            { name: 'outcome', type: 'bool' },
            { name: 'proof', type: 'bytes' },
        ],
        name: 'receiveSettlement',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ name: 'marketId', type: 'bytes32' }],
        name: 'settlements',
        outputs: [
            { name: 'marketId', type: 'bytes32' },
            { name: 'outcome', type: 'bool' },
            { name: 'settledAt', type: 'uint256' },
            { name: 'proof', type: 'bytes' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'forwarder', type: 'address' }],
        name: 'setForwarder',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'marketId', type: 'bytes32' },
            { indexed: false, name: 'outcome', type: 'bool' },
            { indexed: false, name: 'timestamp', type: 'uint256' },
        ],
        name: 'SettlementReceived',
        type: 'event',
    },
    { inputs: [], name: 'UnauthorizedForwarder', type: 'error' },
] as const

// ✓ contracts.ts complete
