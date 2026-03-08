import { ethers } from "hardhat";
import fs from "fs";

async function main() {
    console.log("Deploying persistent mock contracts for demo...");

    const [deployer] = await ethers.getSigners();
    const getGasOps = async () => {
        const feeData = await ethers.provider.getFeeData();
        const nonce = await ethers.provider.getTransactionCount(deployer.address, "pending");
        return {
            nonce,
            maxFeePerGas: feeData.maxFeePerGas ? (feeData.maxFeePerGas * 13n) / 10n : undefined,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 13n) / 10n : undefined,
        };
    };

    const MockIdentityGate = await ethers.getContractFactory("MockIdentityGate");
    const identityGate = await MockIdentityGate.deploy(await getGasOps());
    await identityGate.waitForDeployment();
    const idAddress = await identityGate.getAddress();

    // Auto-verify the deployer
    const tx1 = await identityGate.verifyAndRegister(0, 0, 12345, 0, [0, 0, 0, 0, 0, 0, 0, 0], await getGasOps());
    await tx1.wait();

    const ShadowMarketV2 = await ethers.getContractFactory("ShadowMarketV2");
    const shadowMarket = await ShadowMarketV2.deploy(idAddress, await getGasOps());
    await shadowMarket.waitForDeployment();
    const marketAddress = await shadowMarket.getAddress();

    const SettlementReceiver = await ethers.getContractFactory("SettlementReceiver");
    const settlementReceiver = await SettlementReceiver.deploy(marketAddress, await getGasOps());
    await settlementReceiver.waitForDeployment();
    const receiverAddress = await settlementReceiver.getAddress();

    const tx2 = await shadowMarket.setSettlementReceiver(receiverAddress, await getGasOps());
    await tx2.wait();

    const config = {
        IdentityGate: idAddress,
        ShadowMarketV2: marketAddress,
        SettlementReceiver: receiverAddress
    };

    fs.writeFileSync("demo-config.json", JSON.stringify(config, null, 2));
    console.log("Saved to demo-config.json", config);
}

main().catch(console.error);
