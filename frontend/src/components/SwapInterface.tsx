"use client";

import { BrowserProvider, Contract, ethers, Signer } from "ethers";
import { useCallback, useEffect, useState } from "react";
import SimpleDEXAbi from "@/contracts/abis/SimpleDEX.json";
import SimpleTokenAbi from "@/contracts/abis/SimpleToken.json";
import { contractAddresses } from "@/contracts/addresses";
import { TokenInfo } from "@/types";
import {
  useAppKitAccount,
  useAppKitProvider,
  type Provider,
} from "@reown/appkit/react";

const tokens: TokenInfo[] = [
  { address: contractAddresses.tokenA, symbol: "TOM", name: "TomTheCat" },
  { address: contractAddresses.tokenB, symbol: "BEN", name: "BenTheDog" },
];

export const SwapInterface = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  const [signer, setSigner] = useState<Signer | null>(null);
  const [dexContract, setDexContract] = useState<Contract | null>(null);
  const [tokenAContract, setTokenAContract] = useState<Contract | null>(null);
  const [tokenBContract, setTokenBContract] = useState<Contract | null>(null);

  const [tokenInfo, setTokenInfo] = useState<TokenInfo[]>(tokens);
  const [tokenIn, setTokenIn] = useState<TokenInfo>(tokens[0]);
  const [tokenOut, setTokenOut] = useState<TokenInfo>(tokens[1]);

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!dexContract || !amountIn || isNaN(parseFloat(amountIn))) {
      setAmountOut("");
      return;
    }
    try {
      const amountInWei = ethers.parseUnits(amountIn, 18);
      const reserves = await Promise.all([
        dexContract.reserveA(),
        dexContract.reserveB(),
      ]);
      const reserveIn =
        tokenIn.address === contractAddresses.tokenA
          ? reserves[0]
          : reserves[1];
      const reserveOut =
        tokenIn.address === contractAddresses.tokenA
          ? reserves[1]
          : reserves[0];

      if (reserveIn === BigInt(0) || reserveOut === BigInt(0)) {
        setAmountOut("Insufficient liquidity");
        return;
      }

      const amountOutWei = await dexContract.getAmountOut(
        amountInWei,
        reserveIn,
        reserveOut
      );
      setAmountOut(ethers.formatUnits(amountOutWei, 18));
    } catch (e) {
      console.error("Price fetch error:", e);
      setAmountOut("0");
    }
  }, [dexContract, amountIn, tokenIn]);


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (dexContract && amountIn && parseFloat(amountIn) > 0) {
        fetchPrice();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [dexContract, amountIn, tokenIn.address, fetchPrice]);

  useEffect(() => {
    if (walletProvider && isConnected) {
      const provider = new BrowserProvider(walletProvider);
      const getSignerAndContracts = async () => {
        const currentSigner = await provider.getSigner();
        setSigner(currentSigner);
        setDexContract(
          new ethers.Contract(
            contractAddresses.dex,
            SimpleDEXAbi.abi,
            currentSigner
          )
        );
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
      setDexContract(null);
      setTokenAContract(null);
      setTokenBContract(null);
    }
  }, [walletProvider, isConnected]);

  const handleSwap = async () => {
    if (!dexContract || !signer || !amountIn || !amountOut) return;
    setLoading(true);
    setTxStatus("pending");
    setError(null);

    try {
      const amountInWei = ethers.parseUnits(amountIn, 18);
      const tokenInContract =
        tokenIn.address === contractAddresses.tokenA
          ? tokenAContract
          : tokenBContract;

      if (!tokenInContract) throw new Error("Token contract not found");

      const allowance = await tokenInContract.allowance(
        address,
        contractAddresses.dex
      );
      if (allowance < amountInWei) {
        const approveTx = await tokenInContract.approve(
          contractAddresses.dex,
          amountInWei
        );
        await approveTx.wait();
      }

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      const minAmountOut = ethers.parseUnits(
        (parseFloat(amountOut) * 0.95).toFixed(18),
        18
      );

      const swapFunctionName =
        tokenIn.address === contractAddresses.tokenA ? "swapAtoB" : "swapBtoA";
      const swapTx = await dexContract[swapFunctionName](
        amountInWei,
        minAmountOut,
        deadline
      );
      await swapTx.wait();

      setTxStatus("success");
      setAmountIn("");
      setAmountOut("");
    } catch (err: unknown) {
      console.error("Swap error:", err);
      let errorMessage = "Swap failed.";

      const error = err as Error & { reason?: string; message?: string };
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes("InsufficientAmountOut")) {
          errorMessage =
            "Insufficient output amount. Try increasing slippage tolerance.";
        } else if (error.message.includes("InsufficientLiquidity")) {
          errorMessage = "Insufficient liquidity in the pool.";
        } else if (error.message.includes("DeadlineExceeded")) {
          errorMessage = "Transaction deadline exceeded.";
        } else if (error.message.includes("ZeroAmount")) {
          errorMessage = "Amount cannot be zero.";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user.";
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

  const switchTokens = () => {
    const newTokenIn = tokenOut;
    const newTokenOut = tokenIn;
    setTokenIn(newTokenIn);
    setTokenOut(newTokenOut);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Swap Tokens
      </h2>

      <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300 font-medium">You Pay</span>
          <span className="text-sm text-blue-400 font-medium bg-gray-700 px-2 py-1 rounded">
            {tokenIn.symbol}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="swap-amount-in"
            name="swap-amount-in"
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="w-full bg-transparent text-2xl text-white outline-none placeholder-gray-400 no-spinner"
            disabled={loading || !isConnected}
            min="0"
            step="any"
            inputMode="decimal"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex justify-center my-3">
        <button
          onClick={switchTokens}
          className="p-3 bg-gray-700 border border-gray-600 rounded-full hover:bg-gray-600 transition-colors text-white"
          disabled={loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-up-down"
            aria-hidden="true"
          >
            <path d="m21 16-4 4-4-4"></path>
            <path d="M17 20V4"></path>
            <path d="m3 8 4-4 4 4"></path>
            <path d="M7 4v16"></path>
          </svg>
        </button>
      </div>

      <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300 font-medium">You Receive</span>
          <span className="text-sm text-green-400 font-medium bg-gray-700 px-2 py-1 rounded">
            {tokenOut.symbol}
          </span>
        </div>
        <input
          type="text"
          value={amountOut}
          placeholder="0.0"
          className="w-full bg-transparent text-2xl text-white outline-none placeholder-gray-400"
          disabled
        />
      </div>

      <button
        onClick={handleSwap}
        disabled={loading || !isConnected || !amountIn}
        className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors border border-pink-500 disabled:border-gray-500"
      >
        {loading ? "Processing..." : "Swap"}
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
              ✅ Swap Successful!
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
