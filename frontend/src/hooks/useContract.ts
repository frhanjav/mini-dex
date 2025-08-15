import { contractAddresses } from "@/contracts/addresses";
import {
  useAppKitAccount,
  useAppKitProvider,
  type Provider,
} from "@reown/appkit/react";
import { BrowserProvider, ethers, Signer } from "ethers";
import { useEffect, useMemo, useState } from "react";
import SimpleDEXAbi from "@/contracts/abis/SimpleDEX.json";
import SimpleTokenAbi from "@/contracts/abis/SimpleToken.json";

export const useContracts = () => {
  const { isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const [signer, setSigner] = useState<Signer | null>(null);

  useEffect(() => {
    if (walletProvider && isConnected) {
      const provider = new BrowserProvider(walletProvider);
      const getSigner = async () => {
        const currentSigner = await provider.getSigner();
        setSigner(currentSigner);
      };
      getSigner();
    } else {
      setSigner(null);
    }
  }, [walletProvider, isConnected]);

  const dexContract = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(contractAddresses.dex, SimpleDEXAbi.abi, signer);
  }, [signer]);

  const tokenAContract = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(
      contractAddresses.tokenA,
      SimpleTokenAbi.abi,
      signer
    );
  }, [signer]);

  const tokenBContract = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(
      contractAddresses.tokenB,
      SimpleTokenAbi.abi,
      signer
    );
  }, [signer]);

  return { dexContract, tokenAContract, tokenBContract, signer };
};
