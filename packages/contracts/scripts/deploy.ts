// ═══════════════════════════════════════════════
// MIRAGE MARKET — Contract Deployment Script
// Deploys: IdentityGate → ShadowMarket → SettlementReceiver
// ═══════════════════════════════════════════════

import { ethers, network } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

// World ID Router on Sepolia / Tenderly VTN (forked from Sepolia)
const WORLD_ID_ROUTER = '0x469449f251692e0779667583026b5a1e99512157'

interface DeploymentAddresses {
    network: string
    chainId: number
    identityGate: string
    shadowMarket: string
    settlementReceiver: string
    worldIdRouter: string
    deployedAt: string
    deployer: string
}

async function main(): Promise<void> {
    const [deployer] = await ethers.getSigners()
    const chainId = Number((await ethers.provider.getNetwork()).chainId)

    console.log('═══════════════════════════════════════════════')
    console.log('  MIRAGE MARKET — Contract Deployment')
    console.log('═══════════════════════════════════════════════')
    console.log(`  Network:  ${network.name}`)
    console.log(`  Chain ID: ${chainId}`)
    console.log(`  Deployer: ${deployer.address}`)
    console.log(`  Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`)
    console.log('═══════════════════════════════════════════════\n')

    // ── Step 1: Deploy IdentityGate ──
    console.log('1/4 Deploying IdentityGate...')
    const IdentityGate = await ethers.getContractFactory('IdentityGate')
    const identityGate = await IdentityGate.deploy(WORLD_ID_ROUTER)
    await identityGate.waitForDeployment()
    const identityGateAddr = await identityGate.getAddress()
    console.log(`     ✓ IdentityGate: ${identityGateAddr}`)

    // ── Step 2: Deploy ShadowMarket ──
    console.log('2/4 Deploying ShadowMarket...')
    const ShadowMarket = await ethers.getContractFactory('ShadowMarket')
    const shadowMarket = await ShadowMarket.deploy(identityGateAddr)
    await shadowMarket.waitForDeployment()
    const shadowMarketAddr = await shadowMarket.getAddress()
    console.log(`     ✓ ShadowMarket: ${shadowMarketAddr}`)

    // ── Step 3: Deploy SettlementReceiver ──
    console.log('3/4 Deploying SettlementReceiver...')
    const SettlementReceiver = await ethers.getContractFactory('SettlementReceiver')
    const settlementReceiver = await SettlementReceiver.deploy(shadowMarketAddr)
    await settlementReceiver.waitForDeployment()
    const settlementReceiverAddr = await settlementReceiver.getAddress()
    console.log(`     ✓ SettlementReceiver: ${settlementReceiverAddr}`)

    // ── Step 4: Wire contracts together ──
    console.log('4/4 Wiring contracts...')
    const setReceiverTx = await shadowMarket.setSettlementReceiver(settlementReceiverAddr)
    await setReceiverTx.wait()
    console.log(`     ✓ ShadowMarket.setSettlementReceiver(${settlementReceiverAddr})`)

    // ── Summary ──
    console.log('\n═══════════════════════════════════════════════')
    console.log('  DEPLOYMENT COMPLETE')
    console.log('═══════════════════════════════════════════════')
    console.log(`  IdentityGate:       ${identityGateAddr}`)
    console.log(`  ShadowMarket:       ${shadowMarketAddr}`)
    console.log(`  SettlementReceiver: ${settlementReceiverAddr}`)
    console.log(`  WorldIDRouter:      ${WORLD_ID_ROUTER}`)
    console.log('═══════════════════════════════════════════════\n')

    // ── Write deployment addresses to frontend ──
    const deployment: DeploymentAddresses = {
        network: network.name,
        chainId,
        identityGate: identityGateAddr,
        shadowMarket: shadowMarketAddr,
        settlementReceiver: settlementReceiverAddr,
        worldIdRouter: WORLD_ID_ROUTER,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
    }

    const deploymentsPath = path.resolve(__dirname, '../../../apps/web/lib/deployments.json')
    fs.mkdirSync(path.dirname(deploymentsPath), { recursive: true })
    fs.writeFileSync(deploymentsPath, JSON.stringify(deployment, null, 2))
    console.log(`  📄 Deployment addresses written to: ${deploymentsPath}`)
}

main()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error('Deployment failed:', error)
        process.exit(1)
    })

// ✓ deploy.ts complete
