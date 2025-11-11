import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Card,
  Heading,
  Loader,
  Text,
  Layout,
  Input,
  Select,
} from "@stellar/design-system";
import { ContractCard } from "../../components/marketplace/ContractCard";
import { useContractRegistry } from "../../hooks/useContractRegistry";
import { useReviewSystem } from "../../hooks/useReviewSystem";
import { useWallet } from "../../hooks/useWallet";
import { useNotification } from "../../hooks/useNotification";
import { useNavigate } from "react-router-dom";
import type { ContractMetadata } from "contract_registry";
import type { ReviewSummary } from "review_system";
import "./Marketplace.css";

export function Marketplace() {
  const wallet = useWallet();
  const registry = useContractRegistry();
  const reviewSystem = useReviewSystem();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSummaries, setReviewSummaries] = useState<
    Map<number, ReviewSummary>
  >(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "deploys" | "rating">(
    "newest",
  );

  useEffect(() => {
    if (registry.isReady) {
      loadContracts();
    } else {
      setLoading(false);
    }
  }, [registry.isReady]);

  const loadContracts = async () => {
    if (!registry.client) return;

    try {
      setLoading(true);
      setError(null);

      // Call the get_all_contracts function
      const result = await registry.client.get_all_contracts();

      // The result is an AssembledTransaction, we need to simulate it
      const simulation = await result.simulate();

      // Extract the value from the result (it's wrapped in Ok)
      const resultValue =
        (simulation.result as any)?.value || simulation.result;
      const allContracts = resultValue as ContractMetadata[];

      setContracts(allContracts);
      console.log(`Loaded ${allContracts.length} contracts`);

      // Load review summaries for all contracts
      if (reviewSystem.client) {
        loadReviewSummaries(allContracts);
      }
    } catch (err) {
      console.error("Failed to load contracts:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      addNotification(`Failed to load contracts: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadReviewSummaries = async (contractsList: ContractMetadata[]) => {
    if (!reviewSystem.client) return;

    const summaries = new Map<number, ReviewSummary>();

    // Load summaries in parallel
    await Promise.all(
      contractsList.map(async (contract) => {
        try {
          const result = await reviewSystem.client!.get_review_summary({
            contract_id: contract.id,
          });
          const summary = await result.simulate();
          // Extract the value from the result (it's wrapped in Ok)
          const summaryValue = (summary.result as any)?.value || summary.result;
          summaries.set(contract.id, summaryValue as ReviewSummary);
        } catch (err) {
          console.error(
            `Failed to load review summary for contract ${contract.id}:`,
            err,
          );
          // Continue loading other summaries even if one fails
        }
      }),
    );

    setReviewSummaries(summaries);
  };

  const handleCardClick = (contractId: number) => {
    navigate(`/marketplace/${contractId}`);
  };

  // Filter and sort contracts
  const filteredAndSortedContracts = useMemo(() => {
    let filtered = [...contracts];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (contract) =>
          contract.name.toLowerCase().includes(search) ||
          contract.description.toLowerCase().includes(search) ||
          contract.tags.some((tag) => tag.toLowerCase().includes(search)),
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (contract) => contract.category === categoryFilter,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return Number(b.published_at) - Number(a.published_at);
        case "deploys":
          return Number(b.total_deployments) - Number(a.total_deployments);
        case "rating": {
          const summaryA = reviewSummaries.get(a.id);
          const summaryB = reviewSummaries.get(b.id);
          const ratingA = summaryA?.average_rating || 0;
          const ratingB = summaryB?.average_rating || 0;
          return ratingB - ratingA;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [contracts, searchTerm, categoryFilter, sortBy, reviewSummaries]);

  if (!wallet.address) {
    return (
      <Layout.Content>
        <div className="marketplace-container">
          <div className="connect-prompt">
            <Card>
              <Heading size="lg" as="h2">
                Connect Your Wallet
              </Heading>
              <Text as="p" size="md">
                Please connect your Stellar wallet to browse the marketplace.
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
        <div className="marketplace-container">
          <div className="loading-container">
            <Loader size="lg" />
            <Text as="p" size="md">
              Loading contracts...
            </Text>
          </div>
        </div>
      </Layout.Content>
    );
  }

  if (error) {
    return (
      <Layout.Content>
        <div className="marketplace-container">
          <div className="error-card">
            <Card>
              <Heading size="md" as="h3">
                Error Loading Contracts
              </Heading>
              <Text as="p" size="sm">
                {error}
              </Text>
              <Button variant="secondary" size="md" onClick={loadContracts}>
                Retry
              </Button>
            </Card>
          </div>
        </div>
      </Layout.Content>
    );
  }

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "0", label: "DeFi" },
    { value: "1", label: "NFT" },
    { value: "2", label: "DAO" },
    { value: "3", label: "Gaming" },
    { value: "4", label: "Utility" },
    { value: "5", label: "Oracle" },
    { value: "6", label: "Other" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "deploys", label: "Most Deployed" },
    { value: "rating", label: "Highest Rated" },
  ];

  return (
    <Layout.Content>
      <div className="marketplace-container">
        <header className="marketplace-header">
          <Heading size="xl" as="h1">
            Contract Marketplace
          </Heading>
          <Text as="p" size="lg" className="marketplace-subtitle">
            Discover, deploy, and share Stellar smart contracts
          </Text>
        </header>

        {/* Filters Section */}
        {contracts.length > 0 && (
          <div className="marketplace-filters">
            <div className="search-box">
              <Input
                id="search"
                fieldSize="md"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <Select
                id="category"
                fieldSize="md"
                value={String(categoryFilter)}
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value === "all" ? "all" : parseInt(e.target.value),
                  )
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select
                id="sort"
                fieldSize="md"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "deploys" | "rating")
                }
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {contracts.length === 0 ? (
          <div className="empty-state">
            <Card>
              <Heading size="md" as="h3">
                No contracts yet
              </Heading>
              <Text as="p" size="md">
                Be the first to publish a contract to the marketplace!
              </Text>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/publish")}
              >
                Publish Contract
              </Button>
            </Card>
          </div>
        ) : filteredAndSortedContracts.length === 0 ? (
          <div className="empty-state">
            <Card>
              <Heading size="md" as="h3">
                No contracts found
              </Heading>
              <Text as="p" size="md">
                Try adjusting your search or filters.
              </Text>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </Card>
          </div>
        ) : (
          <div className="contracts-grid">
            {filteredAndSortedContracts.map((contract) => {
              const summary = reviewSummaries.get(contract.id);
              return (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onClick={() => handleCardClick(Number(contract.id))}
                  averageRating={summary?.average_rating}
                  totalReviews={summary?.total_reviews}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout.Content>
  );
}
