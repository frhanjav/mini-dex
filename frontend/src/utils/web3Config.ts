import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { defineChain, sepolia } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";

export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_WC_PROJECT_ID env variable");
}

const metadata = {
  name: "Mini DEX",
  description: "A simple and powerful Mini DEX for swapping tokens.",
  url: "https://localhost:3000",
  icons: ["https://media.frhn.me/cool.png"],
};

const hardhat = defineChain({
  id: 31337,
  name: "Hardhat Localhost",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  chainNamespace: "eip155",
  caipNetworkId: "eip155:31337",
});

export const networks = [hardhat, sepolia] as [
  AppKitNetwork,
  ...AppKitNetwork[]
];

export const ethersAdapter = new EthersAdapter();

export const appKitConfig = createAppKit({
  adapters: [ethersAdapter],
  networks,
  projectId,
  metadata,
  themeMode: "dark" as const,
  themeVariables: {
    "--w3m-accent": "#667eea",
    "--w3m-border-radius-master": "12px",
    "--w3m-font-family": "Arial, sans-serif",
  },
  features: {
    analytics: false,
  },
});
