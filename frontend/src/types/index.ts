import { ethers } from "ethers";

export interface WalletState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

export interface ContractAddresses {
  tokenA: string;
  tokenB: string;
  dex: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name?: string;
}
