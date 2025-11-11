import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Heading,
  Input,
  Text,
  Layout,
  Loader,
  Icon,
  Badge,
} from "@stellar/design-system";
import { useContractRegistry } from "../../hooks/useContractRegistry";
import { useDeploymentManager } from "../../hooks/useDeploymentManager";
import { useWallet } from "../../hooks/useWallet";
import { useNotification } from "../../hooks/useNotification";
import type { ContractMetadata } from "contract_registry";
import "./DeployWizard.css";

enum DeploymentStep {
  Configure = "configure",
  Deploying = "deploying",
  Success = "success",
}

export function DeployWizard() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const wallet = useWallet();
  const registry = useContractRegistry();
  const deploymentManager = useDeploymentManager();
  const { addNotification } = useNotification();

  const [contract, setContract] = useState<ContractMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<DeploymentStep>(DeploymentStep.Configure);
  const [salt, setSalt] = useState("");
  const [deploymentId, setDeploymentId] = useState<string | null>(null);

  useEffect(() => {
    // Generate random salt (32 bytes = 64 hex characters)
    const randomSalt = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setSalt(randomSalt);

    if (registry.isReady && contractId) {
      loadContract();
    } else {
      setLoading(false);
    }
  }, [registry.isReady, contractId]);

  const loadContract = async () => {
    if (!registry.client || !contractId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await registry.client.get_contract({
        contract_id: parseInt(contractId),
      });

      const simulation = await result.simulate();
      let contractData: ContractMetadata;
      if (simulation.result && typeof simulation.result === "object") {
        // Check if it's wrapped in Ok/Err with a value property
        const resultValue =
          (simulation.result as any).value || simulation.result;
        contractData = resultValue as unknown as ContractMetadata;
      } else {
        throw new Error("Invalid contract data");
      }

      setContract(contractData);
    } catch (err) {
      console.error("Failed to load contract:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      addNotification(`Failed to load contract: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Constructor params are automatically handled:
  // We pass the connected wallet address as the first argument
  // This works for most common contract patterns (admin address initialization)

  const handleDeploy = async () => {
    if (
      !wallet.address ||
      !deploymentManager.client ||
      !contract ||
      !contractId
    ) {
      addNotification("Please ensure wallet and contract are ready", "error");
      return;
    }

    if (!contract.wasm_hash) {
      addNotification("Contract WASM hash is missing", "error");
      return;
    }

    try {
      setStep(DeploymentStep.Deploying);

      // Deploy the contract with admin parameter
      // Use deploy_with_admin which accepts a typed Address parameter
      // This automatically passes the connected wallet address as the admin
      const tx = await deploymentManager.client.deploy_with_admin({
        deployer: wallet.address,
        contract_id: parseInt(contractId),
        wasm_hash: Buffer.from(contract.wasm_hash),
        salt: Buffer.from(salt, "hex"),
        admin: wallet.address,
      });

      // Sign and send
      const result = await tx.signAndSend();

      console.log("Deployment result:", result);
      console.log("result.result:", result.result);

      // Get deployment ID from result (it's likely a number or wrapped in an object)
      let newDeploymentId: string;
      if (result.result) {
        // Check if it has a value property (wrapped in Ok)
        const deploymentValue =
          (result.result as any).value !== undefined
            ? (result.result as any).value
            : result.result;

        // If it's still an object, try to get a reasonable string representation
        if (typeof deploymentValue === "object" && deploymentValue !== null) {
          newDeploymentId = JSON.stringify(deploymentValue);
        } else {
          newDeploymentId = String(deploymentValue);
        }
      } else {
        newDeploymentId = `${contractId}-${Date.now()}`;
      }

      console.log("Final deployment ID:", newDeploymentId);
      setDeploymentId(newDeploymentId);

      // Increment deployment count in the registry
      try {
        if (registry.client) {
          const incrementTx = await registry.client.increment_deployment_count({
            contract_id: parseInt(contractId),
          });
          await incrementTx.signAndSend();
          console.log("Successfully incremented deployment count");
        }
      } catch (incrementErr) {
        console.error("Failed to increment deployment count:", incrementErr);
        // Don't fail the whole deployment if this fails
      }

      setStep(DeploymentStep.Success);
      addNotification("Contract deployed successfully!", "success");
    } catch (err) {
      console.error("Deployment failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      addNotification(`Deployment failed: ${errorMessage}`, "error");
      setStep(DeploymentStep.Configure);
    }
  };

  if (!wallet.address) {
    return (
      <Layout.Content>
        <div className="deploy-container">
          <div className="connect-prompt">
            <Card>
              <Heading size="lg" as="h2">
                Connect Your Wallet
              </Heading>
              <Text as="p" size="md">
                Please connect your wallet to deploy contracts.
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
        <div className="deploy-container">
          <div className="loading-container">
            <Loader size="lg" />
            <Text as="p" size="md">
              Loading contract...
            </Text>
          </div>
        </div>
      </Layout.Content>
    );
  }

  if (error || !contract) {
    return (
      <Layout.Content>
        <div className="deploy-container">
          <div className="error-card">
            <Card>
              <Heading size="md" as="h3">
                Contract Not Found
              </Heading>
              <Text as="p" size="sm">
                {error || "The requested contract could not be found."}
              </Text>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate("/marketplace")}
              >
                Back to Marketplace
              </Button>
            </Card>
          </div>
        </div>
      </Layout.Content>
    );
  }

  return (
    <Layout.Content>
      <div className="deploy-container">
        <div className="deploy-header">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => navigate(`/marketplace/${contractId}`)}
          >
            <Icon.ArrowLeft size="sm" />
            Back to Contract
          </Button>
        </div>

        <header className="wizard-header">
          <Heading size="xl" as="h1">
            Deploy Contract
          </Heading>
          <Text as="p" size="lg">
            {contract.name}
          </Text>
        </header>

        {step === DeploymentStep.Configure && (
          <div className="wizard-content">
            <Card>
              <div className="wizard-section">
                <Heading size="md" as="h3">
                  Contract Information
                </Heading>

                <div className="info-grid">
                  <div className="info-item">
                    <Text as="span" size="sm" className="info-label">
                      Name
                    </Text>
                    <Text as="span" size="md" className="info-value">
                      {contract.name}
                    </Text>
                  </div>

                  <div className="info-item">
                    <Text as="span" size="sm" className="info-label">
                      Version
                    </Text>
                    <Text as="span" size="md" className="info-value">
                      {contract.version}
                    </Text>
                  </div>

                  <div className="info-item">
                    <Text as="span" size="sm" className="info-label">
                      Author
                    </Text>
                    <Text as="span" size="xs" className="info-value monospace">
                      {contract.author
                        ? `${contract.author.substring(0, 16)}...`
                        : "Unknown"}
                    </Text>
                  </div>

                  <div className="info-item">
                    <Text as="span" size="sm" className="info-label">
                      Status
                    </Text>
                    {contract.verified ? (
                      <Badge variant="success" size="sm">
                        ✓ Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="wizard-section">
                <Heading size="md" as="h3">
                  Deployment Configuration
                </Heading>

                <div className="form-group">
                  <Input
                    id="salt"
                    label="Deployment Salt"
                    fieldSize="md"
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)}
                    placeholder="Random salt (auto-generated)"
                  />
                  <Text as="p" size="xs" className="field-hint">
                    A unique salt ensures your deployment has a unique address.
                    This is auto-generated but you can customize it.
                  </Text>
                </div>

                <Text as="p" size="sm" className="field-hint">
                  If this contract requires initialization, your connected
                  wallet address will be used automatically as the admin.
                </Text>
              </div>

              <div className="wizard-actions">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate(`/marketplace/${contractId}`)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" onClick={handleDeploy}>
                  <Icon.Rocket01 size="md" />
                  Deploy Contract
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === DeploymentStep.Deploying && (
          <div className="wizard-content">
            <div className="deploying-card">
              <Card>
                <div className="deploying-content">
                  <Loader size="lg" />
                  <Heading size="md" as="h3">
                    Deploying Contract...
                  </Heading>
                  <Text as="p" size="md">
                    Please confirm the transaction in your wallet
                  </Text>
                  <div className="deployment-steps">
                    <div className="step active">
                      <Icon.CheckCircle size="sm" />
                      <Text as="span" size="sm">
                        Preparing deployment
                      </Text>
                    </div>
                    <div className="step active">
                      <Loader size="sm" />
                      <Text as="span" size="sm">
                        Submitting transaction
                      </Text>
                    </div>
                    <div className="step">
                      <Icon.Circle size="sm" />
                      <Text as="span" size="sm">
                        Confirming on network
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {step === DeploymentStep.Success && (
          <div className="wizard-content">
            <div className="success-card">
              <Card>
                <div className="success-content">
                  <div className="success-icon">
                    <Icon.CheckCircle size="xl" />
                  </div>
                  <Heading size="lg" as="h2">
                    Deployment Successful!
                  </Heading>
                  <Text as="p" size="md">
                    Your contract has been deployed to the Stellar network
                  </Text>

                  {deploymentId && (
                    <div className="deployment-info">
                      <Text as="span" size="sm" className="info-label">
                        Deployment ID
                      </Text>
                      <Text as="p" size="sm" className="deployment-id">
                        {deploymentId}
                      </Text>
                    </div>
                  )}

                  <div className="success-actions">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => navigate("/marketplace")}
                    >
                      Back to Marketplace
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate(`/marketplace/${contractId}`)}
                    >
                      View Contract Details
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout.Content>
  );
}
