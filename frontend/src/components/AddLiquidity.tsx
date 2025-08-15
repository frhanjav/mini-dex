"use client";

import SimpleDEXAbi from "@/contracts/abis/SimpleDEX.json";
import SimpleTokenAbi from "@/contracts/abis/SimpleToken.json";
import { contractAddresses } from "@/contracts/addresses";
import {
  useAppKitAccount,
  useAppKitProvider,
  type Provider,
} from "@reown/appkit/react";
import { BrowserProvider, Contract, ethers, Signer } from "ethers";
import { useEffect, useState } from "react";

export const AddLiquidity = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  const [signer, setSigner] = useState<Signer | null>(null);
  const [dexContract, setDexContract] = useState<Contract | null>(null);
  const [tokenAContract, setTokenAContract] = useState<Contract | null>(null);
  const [tokenBContract, setTokenBContract] = useState<Contract | null>(null);

  const [tokenASymbol, setTokenASymbol] = useState("TOM");
  const [tokenBSymbol, setTokenBSymbol] = useState("BEN");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletProvider && isConnected) {
      const provider = new BrowserProvider(walletProvider);
      const getSignerAndContracts = async () => {
        const currentSigner = await provider.getSigner();
        setSigner(currentSigner);

        const dex = new ethers.Contract(
          contractAddresses.dex,
          SimpleDEXAbi.abi,
          currentSigner
        );
        const tokenA = new ethers.Contract(
          contractAddresses.tokenA,
          SimpleTokenAbi.abi,
          currentSigner
        );
        const tokenB = new ethers.Contract(
          contractAddresses.tokenB,
          SimpleTokenAbi.abi,
          currentSigner
        );

        setDexContract(dex);
        setTokenAContract(tokenA);
        setTokenBContract(tokenB);

        // Using predefined symbols instead of fetching to avoid continuous calls
        setTokenASymbol("TOM");
        setTokenBSymbol("BEN");
      };
      getSignerAndContracts();
    } else {
      setSigner(null);
      setDexContract(null);
      setTokenAContract(null);
      setTokenBContract(null);
    }
  }, [walletProvider, isConnected]);

  const handleAddLiquidity = async () => {
    if (
      !dexContract ||
      !tokenAContract ||
      !tokenBContract ||
      !signer ||
      !amountA ||
      !amountB
    )
      return;

    setLoading(true);
    setTxStatus("pending");
    setError(null);

    try {
      const amountAWei = ethers.parseUnits(amountA, 18);
      const amountBWei = ethers.parseUnits(amountB, 18);

      const [allowanceA, allowanceB] = await Promise.all([
        tokenAContract.allowance(address, contractAddresses.dex),
        tokenBContract.allowance(address, contractAddresses.dex),
      ]);

      if (allowanceA < amountAWei) {
        const approveTxA = await tokenAContract.approve(
          contractAddresses.dex,
          amountAWei
        );
        await approveTxA.wait();
      }

      if (allowanceB < amountBWei) {
        const approveTxB = await tokenBContract.approve(
          contractAddresses.dex,
          amountBWei
        );
        await approveTxB.wait();
      }

      const addLiquidityTx = await dexContract.addLiquidity(
        amountAWei,
        amountBWei
      );
      await addLiquidityTx.wait();

      setTxStatus("success");
      setAmountA("");
      setAmountB("");
    } catch (err: unknown) {
      console.error("Add liquidity error:", err);
      let errorMessage = "Add liquidity failed.";

      const error = err as Error & { reason?: string; message?: string };
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes("ZeroAmount")) {
          errorMessage = "Amount cannot be zero.";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user.";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient token balance.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setTxStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Add Liquidity
      </h2>

      <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300 font-medium">Amount</span>
          <span className="text-sm text-blue-400 font-medium bg-gray-700 px-2 py-1 rounded">
            {tokenASymbol}
          </span>
        </div>
        <input
          type="number"
          value={amountA}
          onChange={(e) => setAmountA(e.target.value)}
          placeholder="0.0"
          className="w-full bg-transparent text-2xl text-white outline-none placeholder-gray-400 no-spinner"
          disabled={loading || !isConnected}
        />
      </div>

      <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300 font-medium">Amount</span>
          <span className="text-sm text-green-400 font-medium bg-gray-700 px-2 py-1 rounded">
            {tokenBSymbol}
          </span>
        </div>
        <input
          type="number"
          value={amountB}
          onChange={(e) => setAmountB(e.target.value)}
          placeholder="0.0"
          className="w-full bg-transparent text-2xl text-white outline-none placeholder-gray-400 no-spinner"
          disabled={loading || !isConnected}
        />
      </div>

      <button
        onClick={handleAddLiquidity}
        disabled={loading || !isConnected || !amountA || !amountB}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors border border-green-500 disabled:border-gray-500"
      >
        {loading ? "Processing..." : "Add Liquidity"}
      </button>

      <div className="mt-4 min-h-[24px]">
        {txStatus === "pending" && (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
            <p className="text-yellow-400 text-center font-medium">
              Transaction is pending...
            </p>
          </div>
        )}
        {txStatus === "success" && (
          <div className="bg-green-900 border border-green-600 rounded-lg p-3">
            <p className="text-green-400 text-center font-medium">
              ✅ Liquidity Added Successfully!
            </p>
          </div>
        )}
        {txStatus === "error" && error && (
          <div className="bg-red-900 border border-red-600 rounded-lg p-3">
            <p className="text-red-400 text-sm leading-relaxed break-words">
              <span className="font-semibold">❌ Error:</span> {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
