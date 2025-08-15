import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with faucet functionality...");
  console.log("Deploying with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const initialSupplyA = ethers.parseUnits("10000", 18);
  const TokenA = await ethers.getContractFactory("SimpleToken");
  const tokenA = await TokenA.deploy("TomTheCat", "TOM", initialSupplyA);
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log(
    `TomTheCat Token (TOM) with faucet deployed to: ${tokenAAddress}`
  );

  const initialSupplyB = ethers.parseUnits("10000", 18);
  const TokenB = await ethers.getContractFactory("SimpleToken");
  const tokenB = await TokenB.deploy("BenTheDog", "BEN", initialSupplyB);
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log(
    `BenTheDog Token (BEN) with faucet deployed to: ${tokenBAddress}`
  );

  const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
  const simpleDEX = await SimpleDEX.deploy(tokenAAddress, tokenBAddress);
  await simpleDEX.waitForDeployment();
  const dexAddress = await simpleDEX.getAddress();
  console.log(`SimpleDEX deployed to: ${dexAddress}`);

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Contract Addresses:");
  console.log(`TOM Token (with faucet): ${tokenAAddress}`);
  console.log(`BEN Token (with faucet): ${tokenBAddress}`);
  console.log(`SimpleDEX: ${dexAddress}`);

  console.log("\n=== Adding initial liquidity... ===");

  try {
    const liquidityA = ethers.parseUnits("1000", 18);
    const liquidityB = ethers.parseUnits("2000", 18);

    // Approve tokens
    console.log("Approving tokens...");
    const approveTxA = await tokenA.approve(dexAddress, liquidityA);
    await approveTxA.wait();

    const approveTxB = await tokenB.approve(dexAddress, liquidityB);
    await approveTxB.wait();

    console.log("Tokens approved by deployer.");

    console.log("Adding liquidity...");
    const addLiquidityTx = await simpleDEX.addLiquidity(
      liquidityA,
      liquidityB,
      {
        gasLimit: 500000,
      }
    );
    await addLiquidityTx.wait();

    console.log("Liquidity added successfully!");

    const [finalReserveA, finalReserveB] = await Promise.all([
      simpleDEX.reserveA(),
      simpleDEX.reserveB(),
    ]);

    console.log(
      "Final reserves - A:",
      ethers.formatUnits(finalReserveA, 18),
      "B:",
      ethers.formatUnits(finalReserveB, 18)
    );
  } catch (error) {
    console.error("Error adding liquidity:", error);
    console.log(
      "\nContracts deployed successfully, but liquidity addition failed."
    );
  }

  console.log("\n=== FAUCET INFO ===");
  console.log("Users can now get test tokens!");
  console.log("- Faucet amount: 100 tokens per request");
  console.log("- Cooldown: 24 hours between requests");
  console.log("- Call faucet() on each token contract");

  console.log("\n=== UPDATE YOUR FRONTEND ===");
  console.log("Update addresses.ts with:");
  console.log(`export const contractAddresses = {`);
  console.log(`  tokenA: "${tokenAAddress}",`);
  console.log(`  tokenB: "${tokenBAddress}",`);
  console.log(`  dex: "${dexAddress}"`);
  console.log(`};`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
