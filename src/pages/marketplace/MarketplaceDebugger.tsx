import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Heading,
  Text,
  Layout,
  Loader,
  Code,
} from "@stellar/design-system";
import { useContractRegistry } from "../../hooks/useContractRegistry";
import { useWallet } from "../../hooks/useWallet";
import { useNotification } from "../../hooks/useNotification";
import type { ContractMetadata } from "contract_registry";

export function MarketplaceDebugger() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const wallet = useWallet();
  const registry = useContractRegistry();
  const { addNotification } = useNotification();

  const [contract, setContract] = useState<ContractMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (registry.isReady && contractId && wallet.address) {
      loadContractAndSpec();
    } else {
      setLoading(false);
    }
  }, [registry.isReady, contractId, wallet.address]);

  const loadContractAndSpec = async () => {
    if (!registry.client || !contractId || !wallet.address) return;

    try {
      setLoading(true);
      setError(null);

      // Load contract metadata
      const result = await registry.client.get_contract({
        contract_id: parseInt(contractId),
      });

      const simulation = await result.simulate();
      const resultValue =
        (simulation.result as any)?.value || simulation.result;
      const contractData = resultValue as ContractMetadata;

      setContract(contractData);

      // Try to create a contract client
      // Note: This requires the contract to be deployed
      // For now, we'll show a message that interactive debugging requires deployment
      addNotification(
        "Contract loaded. Note: Interactive debugging requires a deployed instance.",
        "success",
      );
    } catch (err) {
      console.error("Failed to load contract for debugging:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      addNotification(`Failed to load contract: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.address) {
    return (
      <Layout.Content>
        <div style={{ padding: "2rem" }}>
          <Card>
            <Heading size="lg" as="h2">
              Connect Your Wallet
            </Heading>
            <Text as="p" size="md">
              Please connect your wallet to debug contracts.
            </Text>
          </Card>
        </div>
      </Layout.Content>
    );
  }

  if (loading) {
    return (
      <Layout.Content>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Loader size="lg" />
          <Text as="p" size="md">
            Loading contract for debugging...
          </Text>
        </div>
      </Layout.Content>
    );
  }

  if (error || !contract) {
    return (
      <Layout.Content>
        <div style={{ padding: "2rem" }}>
          <Card>
            <Heading size="md" as="h3">
              Failed to Load Contract
            </Heading>
            <Text as="p" size="sm">
              {error ||
                "The requested contract could not be loaded for debugging."}
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate(`/marketplace/${contractId}`)}
              >
                Back to Contract Details
              </Button>
            </div>
          </Card>
        </div>
      </Layout.Content>
    );
  }

  return (
    <Layout.Content>
      <Layout.Inset>
        <div style={{ marginBottom: "1rem" }}>
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => navigate(`/marketplace/${contractId}`)}
          >
            ← Back to Contract Details
          </Button>
        </div>

        <Heading size="xl" as="h1">
          Debug: {contract.name}
        </Heading>
        <Text as="p" size="md" style={{ marginTop: "0.5rem" }}>
          Interactive debugging interface for marketplace contracts
        </Text>
        <hr style={{ margin: "1.5rem 0" }} />
      </Layout.Inset>

      <Layout.Inset>
        <Card>
          <Heading size="md" as="h3">
            Contract Information
          </Heading>

          <div style={{ marginTop: "1rem" }}>
            <Text as="p" size="sm">
              <strong>Name:</strong> {contract.name}
            </Text>
            <Text as="p" size="sm">
              <strong>Version:</strong> {contract.version}
            </Text>
            <Text as="p" size="sm">
              <strong>Author:</strong> <Code size="sm">{contract.author}</Code>
            </Text>
            <Text as="p" size="sm">
              <strong>Category:</strong> {contract.category}
            </Text>
            <Text as="p" size="sm">
              <strong>Description:</strong> {contract.description}
            </Text>
          </div>

          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <Heading size="sm" as="h4">
              Debug Instructions
            </Heading>
            <Text as="p" size="sm" style={{ marginTop: "0.5rem" }}>
              To debug this contract interactively:
            </Text>
            <ol style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
              <li>
                <Text as="span" size="sm">
                  Deploy an instance of this contract using the "Deploy
                  Contract" button
                </Text>
              </li>
              <li>
                <Text as="span" size="sm">
                  The deployed instance will appear in the main Debug page
                </Text>
              </li>
              <li>
                <Text as="span" size="sm">
                  You can then interact with all contract functions directly
                </Text>
              </li>
            </ol>
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/marketplace/${contractId}/deploy`)}
            >
              Deploy Instance
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate(`/debug`)}
            >
              Go to Main Debug Page
            </Button>
          </div>
        </Card>
      </Layout.Inset>

      <div style={{ marginTop: "2rem" }}>
        <Layout.Inset>
          <Card>
            <Heading size="md" as="h3">
              WASM Information
            </Heading>
            <div style={{ marginTop: "1rem" }}>
              <Text as="p" size="sm">
                <strong>WASM Hash:</strong>
              </Text>
              <Code
                size="sm"
                style={{
                  wordBreak: "break-all",
                  display: "block",
                  marginTop: "0.5rem",
                }}
              >
                {contract.wasm_hash
                  ? Buffer.from(contract.wasm_hash).toString("hex")
                  : "Not available"}
              </Code>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <Text as="p" size="xs" style={{ color: "#666" }}>
                Note: Full interactive debugging with function calls requires a
                deployed contract instance. Once deployed, you can use the
                standard Scaffold Stellar debugger to interact with it.
              </Text>
            </div>
          </Card>
        </Layout.Inset>
      </div>
    </Layout.Content>
  );
}
