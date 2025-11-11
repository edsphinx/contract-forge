import { useMemo } from "react";
import { Client as DeploymentManagerClient } from "deployment_manager";
import { useWallet } from "./useWallet";

export function useDeploymentManager() {
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.address || !wallet.signTransaction) return null;

    return new DeploymentManagerClient({
      publicKey: wallet.address,
      contractId: import.meta.env.VITE_DEPLOYMENT_MANAGER_ID as string,
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
