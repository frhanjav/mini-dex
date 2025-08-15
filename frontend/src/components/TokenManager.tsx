"use client";

import SimpleTokenAbi from "@/contracts/abis/SimpleToken.json";
import { contractAddresses } from "@/contracts/addresses";
import {
  useAppKitAccount,
  useAppKitProvider,
  type Provider,
} from "@reown/appkit/react";
import { BrowserProvider, Contract, ethers, Signer } from "ethers";
import { useEffect, useState } from "react";

export const TokenManager = () => {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  const [signer, setSigner] = useState<Signer | null>(null);
  const [tokenAContract, setTokenAContract] = useState<Contract | null>(null);
  const [tokenBContract, setTokenBContract] = useState<Contract | null>(null);

  const [balanceA, setBalanceA] = useState("0");
  const [balanceB, setBalanceB] = useState("0");
  const [symbolA, setSymbolA] = useState("");
  const [symbolB, setSymbolB] = useState("");
  const [loading, setLoading] = useState(false);
  const [contractsLoaded, setContractsLoaded] = useState(false);

  useEffect(() => {
    if (walletProvider && isConnected) {
      const provider = new BrowserProvider(walletProvider);
      const getSignerAndContracts = async () => {
        const currentSigner = await provider.getSigner();
        setSigner(currentSigner);

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

        setTokenAContract(tokenA);
        setTokenBContract(tokenB);

        try {
          const [symA, symB, balA, balB] = await Promise.all([
            tokenA.symbol(),
            tokenB.symbol(),
            tokenA.balanceOf(address),
            tokenB.balanceOf(address),
          ]);

          setSymbolA(symA);
          setSymbolB(symB);
          setBalanceA(ethers.formatUnits(balA, 18));
          setBalanceB(ethers.formatUnits(balB, 18));
          setContractsLoaded(true);
        } catch (e) {
          console.error("Error fetching token info:", e);
          setSymbolA("TOM");
          setSymbolB("BEN");
          setBalanceA("0");
          setBalanceB("0");
          setContractsLoaded(true);
        }
      };
      getSignerAndContracts();
    }
  }, [walletProvider, isConnected, address]);

  const mintTokens = async (tokenContract: Contract, symbol: string) => {
    if (!tokenContract || !signer) return;

    setLoading(true);
    try {
      const mintAmount = ethers.parseUnits("1000", 18);
      const tx = await tokenContract.mint(address, mintAmount);
      await tx.wait();

      const newBalance = await tokenContract.balanceOf(address);
      if (symbol === symbolA) {
        setBalanceA(ethers.formatUnits(newBalance, 18));
      } else {
        setBalanceB(ethers.formatUnits(newBalance, 18));
      }

      alert(`Minted 1000 ${symbol} tokens!`);
    } catch (err: any) {
      console.error("Mint error:", err);
      alert(`Mint failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-xl text-white">
        <p className="text-center">Connect wallet to view token balances</p>
      </div>
    );
  }

  if (!contractsLoaded) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-lg shadow-xl text-white">
        <p className="text-center">Loading contracts...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Token Manager
      </h2>

      <div className="space-y-4">
        <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300 font-medium">
                Token {symbolA}
              </span>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                {contractAddresses.tokenA.slice(0, 6)}...
                {contractAddresses.tokenA.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  Balance
                </span>
                <span className="text-lg font-mono text-blue-400">
                  {parseFloat(balanceA).toFixed(2)} {symbolA}
                </span>
              </div>
              <button
                onClick={() => mintTokens(tokenAContract!, symbolA)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors border border-blue-500"
              >
                {loading ? "Minting..." : `Mint 1000 ${symbolA}`}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300 font-medium">
                Token {symbolB}
              </span>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                {contractAddresses.tokenB.slice(0, 6)}...
                {contractAddresses.tokenB.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  Balance
                </span>
                <span className="text-lg font-mono text-green-400">
                  {parseFloat(balanceB).toFixed(2)} {symbolB}
                </span>
              </div>
              <button
                onClick={() => mintTokens(tokenBContract!, symbolB)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors border border-green-500"
              >
                {loading ? "Minting..." : `Mint 1000 ${symbolB}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-gray-800 border border-gray-600 rounded-lg">
        <div className="flex flex-col items-center space-y-1">
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            Your Address
          </span>
          <span className="text-sm font-mono text-gray-300 bg-gray-700 px-3 py-1 rounded">
            {address?.slice(0, 8)}...{address?.slice(-6)}
          </span>
        </div>
      </div>
    </div>
  );
};
