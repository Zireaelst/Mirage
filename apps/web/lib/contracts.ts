// ═══════════════════════════════════════════════
// MIRAGE MARKET — Contract Addresses & ABIs
// ═══════════════════════════════════════════════

export const CONTRACT_ADDRESSES = {
    identityGate: '0x50DF50C761bA75Da4d5edf29943e7da310A8E135' as `0x${string}`,
    shadowMarket: '0x54576aC5a0cF7566287d7fcb410c8f523357889d' as `0x${string}`,
    privatePayouts: '0x34eb886073984C7c3a063351530D057886FA78Af' as `0x${string}`,
    settlementReceiver: '0x25Fb1b433Db1dFAfF1C73Dd189E7183d8fDe0FC4' as `0x${string}`,
    // WorldIDRouter on Sepolia — official address
    worldIdRouter: '0x469449f251692e0779667583026b5a1e99512157' as `0x${string}`,
} as const

// ── IdentityGate ABI ──
export const IDENTITY_GATE_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_worldIdRouter",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "AlreadyVerified",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "DuplicateNullifier",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "nullifierHash",
                "type": "uint256"
            }
        ],
        "name": "UserVerified",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "GROUP_ID",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "nullifierHash",
                "type": "uint256"
            }
        ],
        "name": "isNullifierUsed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "isVerified",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "nullifierHashes",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "verifiedCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "verifiedUsers",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "root",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "signalHash",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "nullifierHash",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "externalNullifierHash",
                "type": "uint256"
            },
            {
                "internalType": "uint256[8]",
                "name": "proof",
                "type": "uint256[8]"
            }
        ],
        "name": "verifyAndRegister",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "worldIdRouter",
        "outputs": [
            {
                "internalType": "contract IWorldIDRouter",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const

// ── ShadowMarketV2 ABI ──
export const SHADOW_MARKET_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_identityGate",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "AlreadyClaimed",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "AlreadyCommitted",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InsufficientBet",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidReveal",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "MarketAlreadyExists",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "MarketNotFound",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "MarketNotOpen",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "MarketNotSettled",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NotVerified",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "Unauthorized",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            }
        ],
        "name": "MarketClosed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "creator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "enum ShadowMarketV2.Category",
                "name": "category",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "endTime",
                "type": "uint256"
            }
        ],
        "name": "MarketCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "outcome",
                "type": "bool"
            }
        ],
        "name": "MarketSettled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "commitment",
                "type": "bytes32"
            }
        ],
        "name": "PositionCommitted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "choice",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "PositionRevealed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "payout",
                "type": "uint256"
            }
        ],
        "name": "WinningsClaimed",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "internalType": "bool",
                "name": "choice",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "salt",
                "type": "bytes32"
            }
        ],
        "name": "claimWinnings",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            }
        ],
        "name": "closeMarket",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "commitment",
                "type": "bytes32"
            }
        ],
        "name": "commitPosition",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "commitments",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "commitment",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "revealed",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "claimed",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "enum ShadowMarketV2.Category",
                "name": "category",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "endTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minBet",
                "type": "uint256"
            }
        ],
        "name": "createMarket",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getCommitment",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "commitment",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "revealed",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "claimed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct ShadowMarketV2.Commitment",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            }
        ],
        "name": "getMarket",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "id",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "string",
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "enum ShadowMarketV2.Category",
                        "name": "category",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "endTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minBet",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "commitCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalPool",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "yesPool",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "noPool",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum ShadowMarketV2.MarketStatus",
                        "name": "status",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bool",
                        "name": "outcome",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "outcomeSet",
                        "type": "bool"
                    },
                    {
                        "internalType": "address",
                        "name": "creator",
                        "type": "address"
                    }
                ],
                "internalType": "struct ShadowMarketV2.Market",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMarketCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getMarketId",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "offset",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "limit",
                "type": "uint256"
            }
        ],
        "name": "getMarketsPaginated",
        "outputs": [
            {
                "internalType": "bytes32[]",
                "name": "",
                "type": "bytes32[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            }
        ],
        "name": "getParticipantCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "hasCommitted",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "identityGate",
        "outputs": [
            {
                "internalType": "contract IdentityGate",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "marketIds",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "marketParticipants",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "markets",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "enum ShadowMarketV2.Category",
                "name": "category",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "endTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minBet",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "commitCount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalPool",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "yesPool",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "noPool",
                "type": "uint256"
            },
            {
                "internalType": "enum ShadowMarketV2.MarketStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "bool",
                "name": "outcome",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "outcomeSet",
                "type": "bool"
            },
            {
                "internalType": "address",
                "name": "creator",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "revealedNoPool",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "revealedYesPool",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_receiver",
                "type": "address"
            }
        ],
        "name": "setSettlementReceiver",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "internalType": "bool",
                "name": "outcome",
                "type": "bool"
            }
        ],
        "name": "settleMarket",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "settlementReceiver",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const

// ── PrivatePayouts ABI ──
export const PRIVATE_PAYOUTS_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "AlreadyClaimed",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "BatchEmpty",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InsufficientBalance",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidMerkleProof",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "MerkleRootNotSet",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "OnlyAdmin",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "merkleRoot",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalAmount",
                "type": "uint256"
            }
        ],
        "name": "BatchCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "leafHash",
                "type": "bytes32"
            }
        ],
        "name": "PayoutClaimed",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "batches",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "merkleRoot",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "totalAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "claimedAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "createdAt",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "finalized",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "bytes32[]",
                "name": "merkleProof",
                "type": "bytes32[]"
            }
        ],
        "name": "claim",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "claimed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "merkleRoot",
                "type": "bytes32"
            }
        ],
        "name": "createBatch",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            }
        ],
        "name": "getBatch",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "merkleRoot",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "claimedAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "finalized",
                        "type": "bool"
                    }
                ],
                "internalType": "struct PrivatePayouts.PayoutBatch",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "isClaimed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalPayoutsProcessed",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
] as const

// ── SettlementReceiver ABI ──
export const SETTLEMENT_RECEIVER_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_shadowMarket",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "AlreadySettled",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "OnlyOwner",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "UnauthorizedForwarder",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "oldForwarder",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newForwarder",
                "type": "address"
            }
        ],
        "name": "ForwarderUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "outcome",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "SettlementReceived",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "forwarder",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            }
        ],
        "name": "getSettlement",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "marketId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "bool",
                        "name": "outcome",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "settledAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "proof",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct SettlementReceiver.Settlement",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "isSettled",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "internalType": "bool",
                "name": "outcome",
                "type": "bool"
            },
            {
                "internalType": "bytes",
                "name": "proof",
                "type": "bytes"
            }
        ],
        "name": "receiveSettlement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_forwarder",
                "type": "address"
            }
        ],
        "name": "setForwarder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "settlementCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "settlements",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "marketId",
                "type": "bytes32"
            },
            {
                "internalType": "bool",
                "name": "outcome",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "settledAt",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "proof",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "shadowMarket",
        "outputs": [
            {
                "internalType": "contract ShadowMarket",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const
