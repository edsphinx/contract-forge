import { useMemo } from "react";
import { Client as ReviewSystemClient } from "review-system";
import { useWallet } from "./useWallet";

export function useReviewSystem() {
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.address) return null;

    return new ReviewSystemClient({
      publicKey: wallet.address,
      contractId: process.env.VITE_REVIEW_SYSTEM_ID || "",
      networkPassphrase: wallet.networkPassphrase || "Standalone Network ; February 2017",
      rpcUrl: "http://localhost:8000/rpc",
    });
  }, [wallet.address, wallet.networkPassphrase]);

  return {
    client,
    isReady: !!client,
  };
}
