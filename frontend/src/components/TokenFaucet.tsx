"use client";

import SimpleTokenAbi from "@/contracts/abis/SimpleToken.json";
import { contractAddresses } from "@/contracts/addresses";
import {
  useAppKitAccount,
  useAppKitProvider,
  type Provider,
} from "@reown/appkit/react";
import { BrowserProvider, Contract, ethers, Signer } from "ethers";
import { useCallback, useEffect, useState } from "react";

export const TokenFaucet = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  const [signer, setSigner] = useState<Signer | null>(null);
  const [tokenAContract, setTokenAContract] = useState<Contract | null>(null);
  const [tokenBContract, setTokenBContract] = useState<Contract | null>(null);

  const [loadingTOM, setLoadingTOM] = useState(false);
  const [loadingBEN, setLoadingBEN] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    TOM: "idle" | "pending" | "success" | "error";
    BEN: "idle" | "pending" | "success" | "error";
  }>({ TOM: "idle", BEN: "idle" });

  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState({ TOM: "0", BEN: "0" });
  const [cooldowns, setCooldowns] = useState({ TOM: 0, BEN: 0 });

  useEffect(() => {
    if (walletProvider && isConnected) {
      const provider = new BrowserProvider(walletProvider);
      const getSignerAndContracts = async () => {
        const currentSigner = await provider.getSigner();
        setSigner(currentSigner);

        setTokenAContract(
          new ethers.Contract(
            contractAddresses.tokenA,
            SimpleTokenAbi.abi,
            currentSigner
          )
        );
        setTokenBContract(
          new ethers.Contract(
            contractAddresses.tokenB,
            SimpleTokenAbi.abi,
            currentSigner
          )
        );
      };
      getSignerAndContracts();
    } else {
      setSigner(null);
      setTokenAContract(null);
      setTokenBContract(null);
    }
  }, [walletProvider, isConnected]);

  const fetchBalancesAndCooldowns = useCallback(async () => {
    if (!tokenAContract || !tokenBContract || !address) return;

    try {
      const [tomBalance, benBalance, tomCooldown, benCooldown] =
        await Promise.all([
          tokenAContract.balanceOf(address),
          tokenBContract.balanceOf(address),
          tokenAContract.getFaucetCooldown(address),
          tokenBContract.getFaucetCooldown(address),
        ]);

      setBalances({
        TOM: parseFloat(ethers.formatUnits(tomBalance, 18)).toFixed(2),
        BEN: parseFloat(ethers.formatUnits(benBalance, 18)).toFixed(2),
      });

      setCooldowns({
        TOM: Number(tomCooldown),
        BEN: Number(benCooldown),
      });
    } catch (err) {
      console.error("Error fetching balances/cooldowns:", err);
    }
  }, [tokenAContract, tokenBContract, address]);

  useEffect(() => {
    if (isConnected && tokenAContract && tokenBContract) {
      fetchBalancesAndCooldowns();
      const interval = setInterval(fetchBalancesAndCooldowns, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, tokenAContract, tokenBContract, fetchBalancesAndCooldowns]);

  const handleFaucet = async (tokenType: "TOM" | "BEN") => {
    const contract = tokenType === "TOM" ? tokenAContract : tokenBContract;
    if (!contract || !signer) return;

    const setLoading = tokenType === "TOM" ? setLoadingTOM : setLoadingBEN;
    setLoading(true);
    setTxStatus((prev) => ({ ...prev, [tokenType]: "pending" }));
    setError(null);

    try {
      const tx = await contract.faucet();
      await tx.wait();

      setTxStatus((prev) => ({ ...prev, [tokenType]: "success" }));

      setTimeout(() => {
        fetchBalancesAndCooldowns();
        setTxStatus((prev) => ({ ...prev, [tokenType]: "idle" }));
      }, 2000);
    } catch (err: any) {
      console.error(`${tokenType} faucet error:`, err);
      let errorMessage = `${tokenType} faucet failed.`;

      if (err.reason || err.message) {
        if (err.message.includes("Faucet cooldown not met")) {
          errorMessage = `${tokenType} faucet cooldown not met. Try again later.`;
        } else if (err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user.";
        } else {
          errorMessage = err.reason || err.message;
        }
      }

      setError(errorMessage);
      setTxStatus((prev) => ({ ...prev, [tokenType]: "error" }));
      setTimeout(
        () => setTxStatus((prev) => ({ ...prev, [tokenType]: "idle" })),
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCooldown = (seconds: number) => {
    if (seconds <= 0) return "Ready!";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Token Faucet</h2>
        <p className="text-center text-gray-400">
          Connect your wallet to get test tokens
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Token Faucet</h2>
      <p className="text-center text-gray-400 mb-6 text-sm">
        Get 100 tokens every 24 hours to test the DEX
      </p>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3 text-center">
          Your Balances
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {balances.TOM}
            </div>
            <div className="text-sm text-gray-400">TOM</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {balances.BEN}
            </div>
            <div className="text-sm text-gray-400">BEN</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-blue-400">TOM Token</span>
            <span className="text-sm text-gray-400">
              {formatCooldown(cooldowns.TOM)}
            </span>
          </div>
          <button
            onClick={() => handleFaucet("TOM")}
            disabled={loadingTOM || cooldowns.TOM > 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {loadingTOM
              ? "Processing..."
              : cooldowns.TOM > 0
              ? `Wait ${formatCooldown(cooldowns.TOM)}`
              : "Get 100 TOM"}
          </button>
          {txStatus.TOM === "success" && (
            <div className="mt-2 text-green-400 text-sm text-center">
              ✅ 100 TOM tokens received!
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-green-400">BEN Token</span>
            <span className="text-sm text-gray-400">
              {formatCooldown(cooldowns.BEN)}
            </span>
          </div>
          <button
            onClick={() => handleFaucet("BEN")}
            disabled={loadingBEN || cooldowns.BEN > 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {loadingBEN
              ? "Processing..."
              : cooldowns.BEN > 0
              ? `Wait ${formatCooldown(cooldowns.BEN)}`
              : "Get 100 BEN"}
          </button>
          {txStatus.BEN === "success" && (
            <div className="mt-2 text-green-400 text-sm text-center">
              ✅ 100 BEN tokens received!
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-900 border border-red-600 rounded-lg p-3">
          <p className="text-red-400 text-sm">
            <span className="font-semibold">❌ Error:</span> {error}
          </p>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>• Each token has a 24-hour cooldown</p>
        <p>• Use these tokens to test swapping on the DEX</p>
      </div>
    </div>
  );
};
