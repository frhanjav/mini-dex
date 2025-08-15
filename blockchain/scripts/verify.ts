import { run } from "hardhat";

const ADDRESSES = {
  tokenA: "0xFda6691C96F1b48819EE16A782aAecC720237E2b",
  tokenB: "0x16D3f4D3631E275b4D3c89Fa80DcCdd360E5d3Bc",
  dex: "0x5Ed6038971F5a7Cd05a5BC2b37a2eFa7547eeB8B",
};

async function main() {
  console.log("Starting contract verification on Sepolia...\n");

  try {
    console.log("1. Verifying TOM Token...");
    await run("verify:verify", {
      address: ADDRESSES.tokenA,
      constructorArguments: [
        "TomTheCat",
        "TOM",
        "10000000000000000000000",
      ],
    });
    console.log("TOM Token verified!\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("TOM Token already verified!\n");
    } else {
      console.log("TOM Token verification failed:", error.message, "\n");
    }
  }

  try {
    console.log("2. Verifying BEN Token...");
    await run("verify:verify", {
      address: ADDRESSES.tokenB,
      constructorArguments: [
        "BenTheDog",
        "BEN",
        "10000000000000000000000",
      ],
    });
    console.log("BEN Token verified!\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("BEN Token already verified!\n");
    } else {
      console.log("BEN Token verification failed:", error.message, "\n");
    }
  }

  try {
    console.log("3. Verifying SimpleDEX...");
    await run("verify:verify", {
      address: ADDRESSES.dex,
      constructorArguments: [
        ADDRESSES.tokenA,
        ADDRESSES.tokenB,
      ],
    });
    console.log("SimpleDEX verified!\n");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("SimpleDEX already verified!\n");
    } else {
      console.log("SimpleDEX verification failed:", error.message, "\n");
    }
  }

  console.log("=== VERIFICATION COMPLETE ===");
  console.log("Check your contracts on Sepolia Etherscan:");
  console.log(
    `TOM Token: https://sepolia.etherscan.io/address/${ADDRESSES.tokenA}`
  );
  console.log(
    `BEN Token: https://sepolia.etherscan.io/address/${ADDRESSES.tokenB}`
  );
  console.log(
    `SimpleDEX: https://sepolia.etherscan.io/address/${ADDRESSES.dex}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
