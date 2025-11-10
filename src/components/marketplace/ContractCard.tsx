import { Badge, Card, Heading, Text } from "@stellar/design-system";
import type { ContractMetadata } from "contract-registry";
import "./ContractCard.css";

interface ContractCardProps {
  contract: ContractMetadata;
  onClick: () => void;
  averageRating?: number; // Rating * 100 (e.g., 450 = 4.5 stars)
  totalReviews?: number;
}

const categoryColors: Record<number, string> = {
  0: "primary", // DeFi
  1: "secondary", // NFT
  2: "tertiary", // DAO
  3: "error", // Gaming
  4: "success", // Utility
  5: "warning", // Oracle
  6: "default", // Other
};

const categoryNames: Record<number, string> = {
  0: "DeFi",
  1: "NFT",
  2: "DAO",
  3: "Gaming",
  4: "Utility",
  5: "Oracle",
  6: "Other",
};

export function ContractCard({ contract, onClick, averageRating, totalReviews }: ContractCardProps) {
  const shortAuthor = contract.author.substring(0, 8) + "...";
  const categoryName = categoryNames[contract.category as number] || "Other";
  const categoryColor = categoryColors[contract.category as number] || "default";

  const renderStars = (rating: number) => {
    const stars = [];
    const starCount = Math.round(rating / 100);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= starCount ? "filled" : ""}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="contract-card" onClick={onClick}>
      <Card>
        <div className="contract-card-header">
          <Heading size="sm" as="h3">
            {contract.name}
          </Heading>
          {contract.verified && (
            <Badge variant="success" size="sm">
              ✓ Verified
            </Badge>
          )}
        </div>

        <Text as="p" size="sm" className="contract-description">
          {contract.description}
        </Text>

        {averageRating !== undefined && totalReviews !== undefined && totalReviews > 0 && (
          <div className="contract-rating">
            <div className="stars">{renderStars(averageRating)}</div>
            <Text as="span" size="xs" className="rating-text">
              {(averageRating / 100).toFixed(1)} ({totalReviews})
            </Text>
          </div>
        )}

        <div className="contract-metadata">
          <Badge variant={categoryColor as any} size="sm">
            {categoryName}
          </Badge>
          <Text as="span" size="xs" className="deployments">
            📦 {Number(contract.total_deployments)} deploys
          </Text>
        </div>

        <div className="contract-footer">
          <Text as="span" size="xs" className="author" title={contract.author}>
            By {shortAuthor}
          </Text>
          <Text as="span" size="xs" className="version">
            v{contract.version}
          </Text>
        </div>
      </Card>
    </div>
  );
}
