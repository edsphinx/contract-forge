import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Card,
  Heading,
  Text,
  Layout,
  Loader,
  Icon,
} from "@stellar/design-system";
import { useContractRegistry } from "../../hooks/useContractRegistry";
import { useReviewSystem } from "../../hooks/useReviewSystem";
import { useWallet } from "../../hooks/useWallet";
import { useNotification } from "../../hooks/useNotification";
import type { ContractMetadata } from "contract_registry";
import type { ReviewSummary } from "review_system";
import { ReviewForm } from "../../components/marketplace/ReviewForm";
import { ReviewList } from "../../components/marketplace/ReviewList";
import "./ContractDetails.css";

const categoryNames: Record<number, string> = {
  0: "DeFi",
  1: "NFT",
  2: "DAO",
  3: "Gaming",
  4: "Utility",
  5: "Oracle",
  6: "Other",
};

const categoryColors: Record<number, string> = {
  0: "primary",
  1: "secondary",
  2: "tertiary",
  3: "error",
  4: "success",
  5: "warning",
  6: "secondary",
};

export function ContractDetails() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const wallet = useWallet();
  const registry = useContractRegistry();
  const reviewSystem = useReviewSystem();
  const { addNotification } = useNotification();

  const [contract, setContract] = useState<ContractMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(
    null,
  );
  const [reviewRefresh, setReviewRefresh] = useState(0);

  useEffect(() => {
    if (registry.isReady && contractId) {
      loadContract();
    } else {
      setLoading(false);
    }
  }, [registry.isReady, contractId]);

  useEffect(() => {
    if (reviewSystem.isReady && contractId) {
      loadReviewSummary();
    }
  }, [reviewSystem.isReady, contractId, reviewRefresh]);

  const loadContract = async () => {
    if (!registry.client || !contractId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await registry.client.get_contract({
        contract_id: parseInt(contractId),
      });

      const simulation = await result.simulate();

      // Handle the result (it's wrapped in Ok with a value property)
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

  const loadReviewSummary = async () => {
    if (!reviewSystem.client || !contractId) return;

    try {
      const result = await reviewSystem.client.get_review_summary({
        contract_id: parseInt(contractId),
      });

      const summary = await result.simulate();
      setReviewSummary(summary.result);
    } catch (err) {
      console.error("Failed to load review summary:", err);
      setReviewSummary(null);
    }
  };

  const handleReviewSubmitted = () => {
    setReviewRefresh((prev) => prev + 1);
  };

  const handleDeploy = () => {
    console.log(
      "Deploy button clicked, navigating to:",
      `/marketplace/${contractId}/deploy`,
    );
    navigate(`/marketplace/${contractId}/deploy`);
  };

  const handleSourceCode = () => {
    console.log("Source code button clicked, contract:", contract);
    console.log("source_url:", contract?.source_url);
    if (contract?.source_url) {
      window.open(contract.source_url, "_blank");
    } else {
      addNotification("Source URL not available", "error");
    }
  };

  const handleDocumentation = () => {
    console.log("Documentation button clicked");
    if (contract?.documentation_url) {
      window.open(contract.documentation_url, "_blank");
    } else {
      addNotification("Documentation URL not available", "error");
    }
  };

  const handleVerify = async () => {
    if (!wallet.address || !registry.client || !contractId) {
      addNotification("Please ensure wallet is connected", "error");
      return;
    }

    try {
      const tx = await registry.client.verify_contract({
        contract_id: parseInt(contractId),
        auditor: wallet.address,
      });

      await tx.signAndSend();

      addNotification("Contract verified successfully!", "success");

      // Reload contract to get updated verified status
      loadContract();
    } catch (err) {
      console.error("Verification failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      addNotification(`Verification failed: ${errorMessage}`, "error");
    }
  };

  if (!wallet.address) {
    return (
      <Layout.Content>
        <div className="details-container">
          <div className="connect-prompt">
            <Card>
              <Heading size="lg" as="h2">
                Connect Your Wallet
              </Heading>
              <Text as="p" size="md">
                Please connect your wallet to view contract details.
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
        <div className="details-container">
          <div className="loading-container">
            <Loader size="lg" />
            <Text as="p" size="md">
              Loading contract details...
            </Text>
          </div>
        </div>
      </Layout.Content>
    );
  }

  if (error || !contract) {
    return (
      <Layout.Content>
        <div className="details-container">
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

  const categoryName = categoryNames[contract.category as number] || "Other";
  const categoryColor =
    categoryColors[contract.category as number] || "default";

  // Safely convert BigInt or number to timestamp
  const safeTimestamp = (value: any): number => {
    if (!value) return 0;
    const num = typeof value === "bigint" ? Number(value) : Number(value);
    return isNaN(num) ? 0 : num;
  };

  const publishedTimestamp = safeTimestamp(contract.published_at);
  const updatedTimestamp = safeTimestamp(contract.updated_at);

  const publishedDate =
    publishedTimestamp > 0
      ? new Date(publishedTimestamp * 1000).toLocaleDateString()
      : "Unknown";
  const updatedDate =
    updatedTimestamp > 0
      ? new Date(updatedTimestamp * 1000).toLocaleDateString()
      : "Unknown";

  const totalDeployments = safeTimestamp(contract.total_deployments);

  // Safely handle string fields that might be empty or undefined
  const contractName = contract.name || "Unnamed Contract";
  const contractVersion = contract.version || "0.0.0";
  const contractLicense = contract.license || "Unknown";
  const contractNumericId = contract.id ? safeTimestamp(contract.id) : 0;

  return (
    <Layout.Content>
      <div className="details-container">
        <div className="details-header">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => navigate("/marketplace")}
          >
            <Icon.ArrowLeft size="sm" />
            Back to Marketplace
          </Button>
        </div>

        <div className="details-content">
          <div className="details-main">
            <Card>
              <div className="contract-header">
                <div className="title-section">
                  <Heading size="xl" as="h1">
                    {contractName}
                  </Heading>
                  <div className="badges">
                    <Badge variant={categoryColor as any} size="md">
                      {categoryName}
                    </Badge>
                    {contract.verified && (
                      <Badge variant="success" size="md">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="actions">
                  <Button variant="primary" size="md" onClick={handleDeploy}>
                    <Icon.Rocket01 size="md" />
                    Deploy Contract
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleSourceCode}
                  >
                    <Icon.Code01 size="md" />
                    View Source
                  </Button>
                  {!contract.verified && (
                    <Button variant="tertiary" size="md" onClick={handleVerify}>
                      <Icon.CheckCircle size="md" />
                      Verify Contract
                    </Button>
                  )}
                </div>
              </div>

              <div className="contract-description">
                <Text as="p" size="lg">
                  {contract.description}
                </Text>
              </div>

              <div className="contract-metadata">
                <div className="metadata-grid">
                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      Version
                    </Text>
                    <Text as="span" size="md" className="metadata-value">
                      {contractVersion}
                    </Text>
                  </div>

                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      License
                    </Text>
                    <Text as="span" size="md" className="metadata-value">
                      {contractLicense}
                    </Text>
                  </div>

                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      Deployments
                    </Text>
                    <Text as="span" size="md" className="metadata-value">
                      {totalDeployments}
                    </Text>
                  </div>

                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      Published
                    </Text>
                    <Text as="span" size="md" className="metadata-value">
                      {publishedDate}
                    </Text>
                  </div>

                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      Last Updated
                    </Text>
                    <Text as="span" size="md" className="metadata-value">
                      {updatedDate}
                    </Text>
                  </div>

                  <div className="metadata-item">
                    <Text as="span" size="sm" className="metadata-label">
                      Contract ID
                    </Text>
                    <Text as="span" size="md" className="metadata-value">
                      #{contractNumericId}
                    </Text>
                  </div>
                </div>
              </div>

              {contract.tags && contract.tags.length > 0 && (
                <div className="contract-tags">
                  <Text as="span" size="sm" className="tags-label">
                    Tags:
                  </Text>
                  <div className="tags-list">
                    {contract.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Reviews Section */}
            <div className="reviews-section">
              <div className="reviews-header">
                <Heading size="lg" as="h2">
                  Reviews & Ratings
                </Heading>
                {reviewSummary && reviewSummary.total_reviews > 0 && (
                  <div className="rating-summary">
                    <div className="average-rating">
                      <Text as="span" size="xl" className="rating-number">
                        {(reviewSummary.average_rating / 100).toFixed(1)}
                      </Text>
                      <div className="rating-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`star ${
                              i < Math.round(reviewSummary.average_rating / 100)
                                ? "filled"
                                : ""
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <Text as="span" size="sm" className="review-count">
                        {reviewSummary.total_reviews}{" "}
                        {reviewSummary.total_reviews === 1
                          ? "review"
                          : "reviews"}
                      </Text>
                    </div>
                  </div>
                )}
              </div>

              <ReviewForm
                contractId={parseInt(contractId!)}
                onReviewSubmitted={handleReviewSubmitted}
              />

              <div className="reviews-list-container">
                <ReviewList
                  contractId={parseInt(contractId!)}
                  onRefresh={reviewRefresh}
                />
              </div>
            </div>
          </div>

          <div className="details-sidebar">
            <Card>
              <Heading size="sm" as="h3">
                Author
              </Heading>
              <div className="author-info">
                <Text as="p" size="xs" className="author-address">
                  {contract.author}
                </Text>
              </div>
            </Card>

            <Card>
              <Heading size="sm" as="h3">
                Technical Info
              </Heading>
              <div className="tech-info">
                <div className="info-item">
                  <Text as="span" size="xs" className="info-label">
                    WASM Hash
                  </Text>
                  <Text as="p" size="xs" className="hash-value">
                    {contract.wasm_hash
                      ? Buffer.from(contract.wasm_hash)
                          .toString("hex")
                          .substring(0, 16) + "..."
                      : "N/A"}
                  </Text>
                </div>
              </div>
            </Card>

            {contract.documentation_url && (
              <Card>
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={handleDocumentation}
                  style={{ width: "100%" }}
                >
                  <Icon.BookOpen01 size="md" />
                  Documentation
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout.Content>
  );
}
