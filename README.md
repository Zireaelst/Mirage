# ◈ Mirage Market

**A sybil-resistant, privacy-preserving prediction market protocol powered by Chainlink CRE and World ID.**

> 🏆 Built for [Convergence: A Chainlink Hackathon](https://chain.link/hackathon)

---

## 📋 Project Description

Mirage Market is a prediction market protocol where **positions are hidden, identities are verified, and settlements are automated**.

**The Problem:** Existing prediction markets expose user positions publicly, enabling front-running, social pressure, and privacy violations. Most markets also rely on centralized resolution oracles that can be manipulated.

**Our Solution:**
1. **Privacy-Preserving Commitments** — Users commit positions as encrypted hashes (commit-reveal scheme). Amounts and choices remain hidden until settlement.
2. **Sybil Resistance** — World ID verification via Chainlink CRE ensures one-person-one-vote without exposing personal data on-chain.
3. **Automated AI Settlement** — When a market closes, a CRE workflow fetches real-world data via Confidential HTTP, resolves the outcome deterministically, and writes the settlement on-chain — no human oracle needed.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        MIRAGE MARKET                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐     ┌─────────────────────────────────┐    │
│  │  Next.js 14  │────▶│  Ethereum Sepolia Smart Contracts│    │
│  │  App Router  │     │                                 │    │
│  │  + Wagmi v2  │     │  • ShadowMarketV2.sol           │    │
│  └─────────────┘     │  • IdentityGate.sol             │    │
│        │              │  • PrivatePayouts.sol            │    │
│        │              │  • SettlementReceiver.sol        │    │
│        ▼              └────────────┬────────────────────┘    │
│  ┌─────────────┐                   │                         │
│  │  World ID   │                   │                         │
│  │  IDKit v2   │                   ▼                         │
│  └──────┬──────┘     ┌─────────────────────────────────┐    │
│         │            │     CHAINLINK CRE (DON)          │    │
│         │            │                                   │    │
│         └───────────▶│  Identity Workflow:               │    │
│                      │    HTTP → WorldID API → onchain   │    │
│                      │                                   │    │
│                      │  Settlement Workflow:              │    │
│                      │    EVM Log → Confidential HTTP     │    │
│                      │    → Deterministic Resolve         │    │
│                      │    → onchain write                 │    │
│                      └───────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔗 Chainlink Integration — File Links

> **All files that use Chainlink CRE:**

### CRE Workflows

| File | Purpose |
|------|---------|
| [`settlement-workflow/main.ts`](cre-workflows/settlement-workflow/main.ts) | **Core CRE workflow** — EVM log trigger → Confidential HTTP (CoinGecko) → deterministic resolution → SettlementReceiver onchain write |
| [`settlement-workflow/workflow.yaml`](cre-workflows/settlement-workflow/workflow.yaml) | Workflow definition — triggers, consensus (identical), targets |
| [`settlement-workflow/cre.config.json`](cre-workflows/settlement-workflow/cre.config.json) | Runtime configuration — contract addresses, chain, API URL |
| [`identity-workflow/main.ts`](cre-workflows/identity-workflow/main.ts) | **Identity CRE workflow** — HTTP trigger → World ID API verify → IdentityGate onchain write |
| [`identity-workflow/workflow.yaml`](cre-workflows/identity-workflow/workflow.yaml) | Workflow definition — HTTP trigger, identical consensus |
| [`identity-workflow/cre.config.json`](cre-workflows/identity-workflow/cre.config.json) | Runtime configuration — World ID app ID, IdentityGate address |

### Smart Contracts (Chainlink CRE Targets)

| File | Purpose |
|------|---------|
| [`SettlementReceiver.sol`](packages/contracts/contracts/SettlementReceiver.sol) | Receives settlement data from CRE DON → calls `settleMarket()` on ShadowMarketV2 |
| [`ShadowMarketV2.sol`](packages/contracts/contracts/ShadowMarketV2.sol) | V2 market contract — upgraded with CRE-compatible settlement + proportional claims |

### Frontend (Chainlink-Related UI)

| File | Purpose |
|------|---------|
| [`settlements/page.tsx`](apps/web/app/settlements/page.tsx) | Settlements feed showing CRE workflow activity and tx hashes |
| [`contracts.ts`](apps/web/lib/contracts.ts) | ABI definitions + Sepolia addresses for all CRE-connected contracts |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Wallet** | Wagmi v2, viem, WalletConnect |
| **Identity** | World ID (IDKit v2), Chainlink CRE Identity Workflow |
| **Oracle / Settlement** | Chainlink CRE (TypeScript SDK → WASM), Confidential HTTP |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin |
| **Network** | Ethereum Sepolia Testnet |
| **Privacy** | Commit-Reveal scheme, Merkle proof payouts |

---

## 📦 Smart Contracts (Sepolia Testnet)

**Deployed on:** 2026-03-04  
**Deployer:** `0x6602130E170195670407CeE93932C1B0b9454aDD`

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **IdentityGate** | `0x50DF50C761bA75Da4d5edf29943e7da310A8E135` | [View](https://sepolia.etherscan.io/address/0x50DF50C761bA75Da4d5edf29943e7da310A8E135) |
| **ShadowMarketV2** | `0x54576aC5a0cF7566287d7fcb410c8f523357889d` | [View](https://sepolia.etherscan.io/address/0x54576aC5a0cF7566287d7fcb410c8f523357889d) |
| **PrivatePayouts** | `0x34eb886073984C7c3a063351530D057886FA78Af` | [View](https://sepolia.etherscan.io/address/0x34eb886073984C7c3a063351530D057886FA78Af) |
| **SettlementReceiver** | `0x25Fb1b433Db1dFAfF1C73Dd189E7183d8fDe0FC4` | [View](https://sepolia.etherscan.io/address/0x25Fb1b433Db1dFAfF1C73Dd189E7183d8fDe0FC4) |
| **WorldID Router** | `0x469449f251692e0779667583026b5a1e99512157` | [View](https://sepolia.etherscan.io/address/0x469449f251692e0779667583026b5a1e99512157) |

---

## 🚀 How to Run

### Prerequisites

- Node.js v18+
- [Bun](https://bun.sh) v1.3+ (for CRE workflows)
- [CRE CLI](https://docs.chain.link/cre) (`curl -sSL https://cre.chain.link/install.sh | bash`)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Fill in:
#   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
#   NEXT_PUBLIC_WORLD_ID_APP_ID
#   PRIVATE_KEY (for contract deployment)
```

### 3. Run Frontend (Dev)

```bash
cd apps/web
npm run dev
# → http://localhost:3000
```

### 4. Deploy Contracts

```bash
cd packages/contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

### 5. Simulate CRE Workflow

```bash
# Install CRE CLI
curl -sSL https://cre.chain.link/install.sh | bash

# Login to CRE
cre login

# Simulate Settlement Workflow
cd cre-workflows/settlement-workflow
bun install
cre workflow simulate .

# Simulate Identity Workflow
cd ../identity-workflow
bun install
cre workflow simulate .
```

---

## 📂 Repository Structure

```
mirage/
├── apps/web/                        # Next.js 14 frontend
│   ├── app/
│   │   ├── markets/[id]/            # Market detail + commit position
│   │   ├── markets/[id]/reveal/     # Reveal & claim winnings
│   │   ├── markets/create/          # Create new market
│   │   ├── portfolio/               # User portfolio dashboard
│   │   └── settlements/             # CRE settlement feed
│   ├── components/web3/             # WorldIDButton, CommitPosition, ClaimWinnings
│   └── lib/                         # contracts.ts, types.ts, wagmi.ts
├── packages/contracts/              # Solidity smart contracts
│   ├── contracts/
│   │   ├── ShadowMarketV2.sol       # V2 prediction market
│   │   ├── IdentityGate.sol         # World ID sybil gate
│   │   ├── PrivatePayouts.sol       # Merkle proof payouts
│   │   └── SettlementReceiver.sol   # CRE settlement target
│   └── scripts/deploy.ts           # Hardhat deployment script
├── cre-workflows/                   # ★ Chainlink CRE Workflows
│   ├── settlement-workflow/         # EVM Log → API → Settle
│   │   ├── main.ts                  # Handler logic (CRE SDK)
│   │   ├── workflow.yaml            # Workflow definition
│   │   └── cre.config.json          # Runtime config
│   └── identity-workflow/           # HTTP → WorldID → Onchain
│       ├── main.ts                  # Handler logic (CRE SDK)
│       ├── workflow.yaml            # Workflow definition
│       └── cre.config.json          # Runtime config
└── README.md
```

---

## 🏆 Prize Tracks

| Track | How Mirage Qualifies |
|-------|---------------------|
| **Chainlink CRE & AI** ($17k) | Settlement workflow uses CRE with Confidential HTTP, deterministic resolution, and EVM log triggers |
| **Prediction Markets** ($16k) | Full prediction market with commit-reveal privacy, proportional payouts, and automated settlement |
| **Privacy** ($16k) | Encrypted commitments, Merkle proof payouts, Confidential HTTP — positions never visible on-chain |
| **World ID + CRE** ($5k) | Identity workflow brings World ID verification to Sepolia via CRE, enabling sybil resistance on any chain |

---

## 📝 License

MIT