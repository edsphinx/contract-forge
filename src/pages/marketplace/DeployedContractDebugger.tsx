import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Heading,
  Text,
  Layout,
  Loader,
  Icon,
  Code,
} from "@stellar/design-system";
import { useDeploymentManager } from "../../hooks/useDeploymentManager";
import { useContractRegistry } from "../../hooks/useContractRegistry";
import { useWallet } from "../../hooks/useWallet";
import { useNotification } from "../../hooks/useNotification";
import type { DeploymentRecord } from "deployment_manager";
import type { ContractMetadata } from "contract_registry";
import { ContractForm } from "../../debug/components/ContractForm";
import { Client } from "@stellar/stellar-sdk/contract";
import "./DeployedContractDebugger.css";

export function DeployedContractDebugger() {
  const { deploymentId } = useParams<{ deploymentId: string }>();
  const navigate = useNavigate();
  const wallet = useWallet();
  const deploymentManager = useDeploymentManager();
  const registry = useContractRegistry();
  const { addNotification } = useNotification();

  const [deployment, setDeployment] = useState<DeploymentRecord | null>(null);
  const [contract, setContract] = useState<ContractMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractClient, setContractClient] = useState<any>(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

  useEffect(() => {
    if (
      deploymentManager.isReady &&
      registry.isReady &&
      wallet.address &&
      deploymentId
    ) {
      loadDeploymentAndContract();
    } else {
      setLoading(false);
    }
  }, [
    deploymentManager.isReady,
    registry.isReady,
    wallet.address,
    deploymentId,
  ]);

  const loadDeploymentAndContract = async () => {
    if (
      !deploymentManager.client ||
      !registry.client ||
      !wallet.address ||
      !deploymentId
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load all deployments to find the one we want
      const deploymentsResult =
        await deploymentManager.client.get_deployment_history({
          deployer: wallet.address,
        });

      const deploymentsSimulation = await deploymentsResult.simulate();
      const deploymentsValue =
        (deploymentsSimulation.result as any)?.value ||
        deploymentsSimulation.result;
      const deploymentList = deploymentsValue as DeploymentRecord[];

      const foundDeployment = deploymentList.find(
        (d) => d.deployment_id === parseInt(deploymentId),
      );

      if (!foundDeployment) {
        throw new Error("Deployment not found");
      }

      setDeployment(foundDeployment);

      // Load contract metadata
      const contractResult = await registry.client.get_contract({
        contract_id: foundDeployment.contract_id,
      });

      const contractSimulation = await contractResult.simulate();
      const contractValue =
        (contractSimulation.result as any)?.value || contractSimulation.result;
      const contractData = contractValue as unknown as ContractMetadata;

      setContract(contractData);

      // Create a dynamic contract client for the deployed instance
      await createDynamicClient(foundDeployment.deployed_contract_address);
    } catch (err) {
      console.error("Failed to load deployment:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      addNotification(`Failed to load deployment: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const createDynamicClient = async (contractAddress: string) => {
    if (!wallet.signTransaction) {
      addNotification("Wallet sign transaction not available", "error");
      return;
    }

    try {
      // Try to create a client by fetching and parsing the spec from the contract
      // Note: This approach fetches the spec directly from the deployed contract on-chain
      const client = await Client.from({
        contractId: contractAddress,
        networkPassphrase: import.meta.env.PUBLIC_STELLAR_NETWORK_PASSPHRASE,
        rpcUrl: import.meta.env.PUBLIC_STELLAR_RPC_URL,
        publicKey: wallet.address,
        signTransaction: wallet.signTransaction,
      });

      setContractClient(client);
    } catch (err) {
      console.error("Failed to create contract client:", err);
      addNotification(
        "Failed to load contract interface. The contract may not have a readable spec.",
        "error",
      );
    }
  };

  const formatDate = (timestamp: bigint | number) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification(`${label} copied to clipboard`, "success");
  };

  if (!wallet.address) {
    return (
      <Layout.Content>
        <div className="deployed-debugger-container">
          <div className="connect-prompt">
            <Card>
              <Heading size="lg" as="h2">
                Connect Your Wallet
              </Heading>
              <Text as="p" size="md">
                Please connect your wallet to debug deployed contracts.
              </Text>
            </Card>
          </div>
        </div>
      </Layout.Content>
    );
  }

  if (loading) {
    return (
      <Layout.Content>
        <div className="deployed-debugger-container">
          <div className="loading-container">
            <Loader size="lg" />
            <Text as="p" size="md">
              Loading deployment for debugging...
            </Text>
          </div>
        </div>
      </Layout.Content>
    );
  }

  if (error || !deployment || !contract) {
    return (
      <Layout.Content>
        <div className="deployed-debugger-container">
          <div className="error-card">
            <Card>
              <Heading size="md" as="h3">
                Deployment Not Found
              </Heading>
              <Text as="p" size="sm">
                {error || "The requested deployment could not be found."}
              </Text>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate("/deployments")}
              >
                Back to Deployments
              </Button>
            </Card>
          </div>
        </div>
      </Layout.Content>
    );
  }

  return (
    <Layout.Content>
      <div className="deployed-debugger-container">
        <div className="debugger-header">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => navigate("/deployments")}
          >
            <Icon.ArrowLeft size="sm" />
            Back to Deployments
          </Button>
        </div>

        <div className="debugger-content">
          <div className="debugger-main">
            <Card>
              <div className="deployment-info-header">
                <Heading size="xl" as="h1">
                  Debug: {contract.name}
                </Heading>
                <Text as="p" size="md" className="deployment-subtitle">
                  Interactive debugging for deployment #
                  {deployment.deployment_id}
                </Text>
              </div>

              <div className="deployment-metadata">
                <div className="metadata-grid">
                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      Contract Address
                    </Text>
                    <div className="address-with-copy">
                      <Text
                        as="span"
                        size="xs"
                        className="metadata-value monospace"
                      >
                        {truncateAddress(deployment.deployed_contract_address)}
                      </Text>
                      <button
                        className="copy-button"
                        onClick={() =>
                          copyToClipboard(
                            deployment.deployed_contract_address,
                            "Contract address",
                          )
                        }
                        aria-label="Copy contract address"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      Deployed At
                    </Text>
                    <Text as="span" size="sm" className="metadata-value">
                      {formatDate(deployment.deployed_at)}
                    </Text>
                  </div>

                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      Contract Version
                    </Text>
                    <Text as="span" size="sm" className="metadata-value">
                      {contract.version}
                    </Text>
                  </div>

                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      WASM Hash
                    </Text>
                    <Text
                      as="span"
                      size="xs"
                      className="metadata-value monospace"
                    >
                      {Buffer.from(deployment.wasm_hash)
                        .toString("hex")
                        .substring(0, 16)}
                      ...
                    </Text>
                  </div>
                </div>
              </div>

              {isDetailExpanded && (
                <div className="expanded-details">
                  <div className="detail-section">
                    <Text as="span" size="sm" className="detail-label">
                      Full Contract Address
                    </Text>
                    <Code size="sm" style={{ wordBreak: "break-all" }}>
                      {deployment.deployed_contract_address}
                    </Code>
                  </div>

                  <div className="detail-section">
                    <Text as="span" size="sm" className="detail-label">
                      Full WASM Hash
                    </Text>
                    <Code size="sm" style={{ wordBreak: "break-all" }}>
                      {Buffer.from(deployment.wasm_hash).toString("hex")}
                    </Code>
                  </div>

                  <div className="detail-section">
                    <Text as="span" size="sm" className="detail-label">
                      Description
                    </Text>
                    <Text as="p" size="sm">
                      {contract.description}
                    </Text>
                  </div>
                </div>
              )}

              <Button
                variant="tertiary"
                size="sm"
                onClick={() => setIsDetailExpanded(!isDetailExpanded)}
                style={{ marginTop: "1rem" }}
              >
                {isDetailExpanded ? "Hide Details" : "Show Details"}
              </Button>
            </Card>

            {/* Contract interaction section */}
            <div className="contract-interaction">
              {contractClient ? (
                <ContractForm
                  contractClient={contractClient}
                  contractClientError={null}
                />
              ) : (
                <Card>
                  <Heading size="md" as="h3">
                    Contract Interface
                  </Heading>
                  <Text as="p" size="sm" style={{ marginTop: "1rem" }}>
                    Setting up contract interface...
                  </Text>
                </Card>
              )}
            </div>
          </div>

          <div className="debugger-sidebar">
            <Card>
              <Heading size="sm" as="h3">
                Quick Actions
              </Heading>
              <div className="action-buttons">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate(`/marketplace/${contract.id}`)}
                  style={{ width: "100%" }}
                >
                  <Icon.Package size="md" />
                  View in Marketplace
                </Button>
                {contract.source_url && (
                  <Button
                    variant="tertiary"
                    size="md"
                    onClick={() => window.open(contract.source_url, "_blank")}
                    style={{ width: "100%" }}
                  >
                    <Icon.Code01 size="md" />
                    View Source
                  </Button>
                )}
              </div>
            </Card>

            <Card>
              <Heading size="sm" as="h3">
                Contract Info
              </Heading>
              <div className="sidebar-info">
                <div className="info-item">
                  <Text as="span" size="xs" className="info-label">
                    Author
                  </Text>
                  <Text as="p" size="xs" className="info-value monospace">
                    {truncateAddress(contract.author)}
                  </Text>
                </div>
                <div className="info-item">
                  <Text as="span" size="xs" className="info-label">
                    License
                  </Text>
                  <Text as="p" size="xs" className="info-value">
                    {contract.license || "Unknown"}
                  </Text>
                </div>
                <div className="info-item">
                  <Text as="span" size="xs" className="info-label">
                    Total Deployments
                  </Text>
                  <Text as="p" size="xs" className="info-value">
                    {Number(contract.total_deployments || 0)}
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout.Content>
  );
}
