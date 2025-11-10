import { useMemo } from "react";
import { Client as DeploymentManagerClient } from "deployment-manager";
import { useWallet } from "./useWallet";

export function useDeploymentManager() {
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.address) return null;

    return new DeploymentManagerClient({
      publicKey: wallet.address,
      // These will be set after contract deployment
      contractId: process.env.VITE_DEPLOYMENT_MANAGER_ID || "",
      networkPassphrase: wallet.networkPassphrase || "Standalone Network ; February 2017",
      rpcUrl: "http://localhost:8000/rpc",
    });
  }, [wallet.address, wallet.networkPassphrase]);

  return {
    client,
    isReady: !!client,
  };
}
