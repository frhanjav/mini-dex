"use client";

import { AddLiquidity } from "@/components/AddLiquidity";
import { SwapInterface } from "@/components/SwapInterface";
import { TokenFaucet } from "@/components/TokenFaucet";
import { TokenManager } from "@/components/TokenManager";
import { WalletConnection } from "@/components/WalletConnection";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "swap" | "liquidity" | "faucet" | "tokens"
  >("swap");

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header>
        <WalletConnection />
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Mini DEX</h1>
          <p className="text-gray-400 mb-6">Swap tokens on Sepolia testnet</p>
          <div className="flex justify-center mb-4">
            <appkit-button />
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("swap")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "swap"
                  ? "bg-pink-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Swap
            </button>
            <button
              onClick={() => setActiveTab("faucet")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "faucet"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🚰 Faucet
            </button>
            <button
              onClick={() => setActiveTab("liquidity")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "liquidity"
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Add Liquidity
            </button>
            <button
              onClick={() => setActiveTab("tokens")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "tokens"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Manage Tokens
            </button>
          </div>
        </div>

        {activeTab === "swap" && <SwapInterface />}
        {activeTab === "faucet" && <TokenFaucet />}
        {activeTab === "liquidity" && <AddLiquidity />}
        {activeTab === "tokens" && <TokenManager />}
      </main>
    </div>
  );
}
