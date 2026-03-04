// ═══════════════════════════════════════════════
// MIRAGE MARKET — Hardhat Configuration
// ═══════════════════════════════════════════════

import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'

// Load .env from project root
dotenv.config({ path: '../../.env' })

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '0x0000000000000000000000000000000000000000000000000000000000000001'
const TENDERLY_RPC = process.env.TENDERLY_RPC_URL ?? ''

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.24',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: true,
        },
    },

    networks: {
        hardhat: {
            chainId: 31337,
        },
        sepolia: {
            url: `https://ethereum-sepolia-rpc.publicnode.com`,
            accounts: [DEPLOYER_KEY],
            chainId: 11155111,
        },
        'tenderly-vtn': {
            url: TENDERLY_RPC,
            accounts: [DEPLOYER_KEY],
            chainId: 99999, // Replace with actual Tenderly VTN chain ID
        },
    },

    typechain: {
        outDir: 'typechain-types',
        target: 'ethers-v6',
    },

    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
}

export default config

// ✓ hardhat.config.ts complete
