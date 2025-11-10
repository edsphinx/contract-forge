import { useMemo } from "react";
import { Client as ContractRegistryClient } from "contract-registry";
import { useWallet } from "./useWallet";

export function useContractRegistry() {
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.address) return null;

    return new ContractRegistryClient({
      publicKey: wallet.address,
      // These will be set after contract deployment
      contractId: process.env.VITE_CONTRACT_REGISTRY_ID || "",
      networkPassphrase: wallet.networkPassphrase || "Standalone Network ; February 2017",
      rpcUrl: "http://localhost:8000/rpc",
    });
  }, [wallet.address, wallet.networkPassphrase]);

  return {
    client,
    isReady: !!client,
  };
}
