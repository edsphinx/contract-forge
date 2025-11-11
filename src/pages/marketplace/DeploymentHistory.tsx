import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Heading,
  Text,
  Layout,
  Loader,
  Badge,
  Icon,
} from "@stellar/design-system";
import { useDeploymentManager } from "../../hooks/useDeploymentManager";
import { useContractRegistry } from "../../hooks/useContractRegistry";
import { useWallet } from "../../hooks/useWallet";
import { useNotification } from "../../hooks/useNotification";
import { useNavigate } from "react-router-dom";
import type { DeploymentRecord } from "deployment_manager";
import type { ContractMetadata } from "contract_registry";
import "./DeploymentHistory.css";

export function DeploymentHistory() {
  const wallet = useWallet();
  const deploymentManager = useDeploymentManager();
  const registry = useContractRegistry();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [contracts, setContracts] = useState<Map<number, ContractMetadata>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deploymentManager.isReady && wallet.address) {
      loadDeployments();
    } else {
      setLoading(false);
    }
  }, [deploymentManager.isReady, wallet.address]);

  const loadDeployments = async () => {
    if (!deploymentManager.client || !wallet.address) return;

    try {
      setLoading(true);
      setError(null);

      const result = await deploymentManager.client.get_deployment_history({
        deployer: wallet.address,
      });

      const simulation = await result.simulate();
      // Extract the value from the result (it's wrapped in Ok)
      const resultValue =
        (simulation.result as any)?.value || simulation.result;
      const deploymentList = resultValue as DeploymentRecord[];

      setDeployments(deploymentList);

      // Load contract metadata for each deployment
      if (registry.client && deploymentList.length > 0) {
        await loadContractMetadata(deploymentList);
      }
    } catch (err) {
      console.error("Failed to load deployments:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      addNotification(`Failed to load deployments: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadContractMetadata = async (deploymentList: DeploymentRecord[]) => {
    if (!registry.client) return;

    const contractMap = new Map<number, ContractMetadata>();

    await Promise.all(
      deploymentList.map(async (deployment) => {
        try {
          const result = await registry.client!.get_contract({
            contract_id: deployment.contract_id,
          });
          const simulation = await result.simulate();
          // Extract the value from the result (it's wrapped in Ok)
          const resultValue =
            (simulation.result as any)?.value || simulation.result;
          const metadata = resultValue as unknown as ContractMetadata;
          contractMap.set(deployment.contract_id, metadata);
        } catch (err) {
          console.error(
            `Failed to load contract ${deployment.contract_id}:`,
            err,
          );
        }
      }),
    );

    setContracts(contractMap);
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
        <div className="deployment-history-container">
          <div className="connect-prompt">
            <Card>
              <Heading size="lg" as="h2">
                Connect Your Wallet
              </Heading>
              <Text as="p" size="md">
                Please connect your wallet to view your deployment history.
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
        <div className="deployment-history-container">
          <div className="loading-container">
            <Loader size="lg" />
            <Text as="p" size="md">
              Loading deployment history...
            </Text>
          </div>
        </div>
      </Layout.Content>
    );
  }

  if (error) {
    return (
      <Layout.Content>
        <div className="deployment-history-container">
          <div className="error-card">
            <Card>
              <Heading size="md" as="h3">
                Error Loading Deployments
              </Heading>
              <Text as="p" size="sm">
                {error}
              </Text>
              <Button variant="secondary" size="md" onClick={loadDeployments}>
                Retry
              </Button>
            </Card>
          </div>
        </div>
      </Layout.Content>
    );
  }

  return (
    <Layout.Content>
      <div className="deployment-history-container">
        <header className="deployment-history-header">
          <div>
            <Heading size="xl" as="h1">
              My Deployments
            </Heading>
            <Text as="p" size="lg" className="deployment-subtitle">
              View and manage your contract deployments
            </Text>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/marketplace")}
          >
            <Icon.Plus size="md" />
            Deploy New Contract
          </Button>
        </header>

        {deployments.length === 0 ? (
          <div className="empty-state">
            <Card>
              <Heading size="md" as="h3">
                No Deployments Yet
              </Heading>
              <Text as="p" size="md">
                You haven't deployed any contracts yet. Browse the marketplace
                to get started!
              </Text>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/marketplace")}
              >
                Browse Marketplace
              </Button>
            </Card>
          </div>
        ) : (
          <div className="deployments-list">
            {deployments.map((deployment) => {
              const contract = contracts.get(deployment.contract_id);

              return (
                <div
                  key={deployment.deployment_id}
                  className="deployment-card-wrapper"
                >
                  <Card>
                    <div className="deployment-header">
                      <div className="deployment-title">
                        <Heading size="sm" as="h3">
                          {contract?.name ||
                            `Contract #${deployment.contract_id}`}
                        </Heading>
                        <Badge variant="success" size="sm">
                          Deployed
                        </Badge>
                      </div>
                      <Text as="span" size="xs" className="deployment-date">
                        {formatDate(deployment.deployed_at)}
                      </Text>
                    </div>

                    {contract && (
                      <div className="deployment-description">
                        <Text as="p" size="sm">
                          {contract.description}
                        </Text>
                      </div>
                    )}

                    <div className="deployment-details">
                      <div className="detail-row">
                        <Text as="span" size="xs" className="detail-label">
                          Deployment ID
                        </Text>
                        <Text as="span" size="xs" className="detail-value">
                          #{deployment.deployment_id}
                        </Text>
                      </div>

                      <div className="detail-row">
                        <Text as="span" size="xs" className="detail-label">
                          Contract Address
                        </Text>
                        <div className="detail-value-with-copy">
                          <Text
                            as="span"
                            size="xs"
                            className="detail-value monospace"
                          >
                            {truncateAddress(
                              deployment.deployed_contract_address,
                            )}
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

                      <div className="detail-row">
                        <Text as="span" size="xs" className="detail-label">
                          WASM Hash
                        </Text>
                        <Text
                          as="span"
                          size="xs"
                          className="detail-value monospace"
                        >
                          {Buffer.from(deployment.wasm_hash)
                            .toString("hex")
                            .substring(0, 16)}
                          ...
                        </Text>
                      </div>
                    </div>

                    <div className="deployment-actions">
                      {contract && (
                        <>
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() =>
                              navigate(`/marketplace/${deployment.contract_id}`)
                            }
                          >
                            View Contract
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/deployments/${deployment.deployment_id}/debug`,
                              )
                            }
                          >
                            <Icon.Tool01 size="sm" />
                            Debug
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout.Content>
  );
}
