import { useMemo } from "react";
import { Client as ContractRegistryClient } from "contract_registry";
import { useWallet } from "./useWallet";

export function useContractRegistry() {
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.address || !wallet.signTransaction) return null;

    return new ContractRegistryClient({
      publicKey: wallet.address,
      contractId: import.meta.env.VITE_CONTRACT_REGISTRY_ID as string,
      networkPassphrase: import.meta.env
        .PUBLIC_STELLAR_NETWORK_PASSPHRASE as string,
      rpcUrl: import.meta.env.PUBLIC_STELLAR_RPC_URL as string,
      signTransaction: wallet.signTransaction,
    });
  }, [wallet.address, wallet.signTransaction]);

  return {
    client,
    isReady: !!client,
  };
}
