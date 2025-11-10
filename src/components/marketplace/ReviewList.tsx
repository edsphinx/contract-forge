import { useEffect, useState } from "react";
import { Button, Card, Text } from "@stellar/design-system";
import { Review } from "review-system";
import { useReviewSystem } from "../../hooks/useReviewSystem";
import { useWallet } from "../../hooks/useWallet";
import { useNotification } from "../../hooks/useNotification";
import "./ReviewList.css";

interface ReviewListProps {
  contractId: number;
  onRefresh?: number; // Increment this to trigger refresh
}

export function ReviewList({ contractId, onRefresh }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upvotingId, setUpvotingId] = useState<number | null>(null);

  const reviewSystem = useReviewSystem();
  const wallet = useWallet();
  const { addNotification } = useNotification();

  useEffect(() => {
    loadReviews();
  }, [contractId, reviewSystem.client, onRefresh]);

  const loadReviews = async () => {
    if (!reviewSystem.client) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const tx = await reviewSystem.client.get_reviews_for_contract({
        contract_id: contractId,
      });

      const result = await tx.simulate();
      setReviews(result.result as Review[]);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async (reviewId: number) => {
    if (!reviewSystem.client || !wallet.address) {
      addNotification("Please connect your wallet", "error");
      return;
    }

    try {
      setUpvotingId(reviewId);

      const tx = await reviewSystem.client.upvote_review({
        review_id: reviewId,
        voter: wallet.address,
      });

      await tx.signAndSend();

      addNotification("Upvoted successfully!", "success");
      await loadReviews();
    } catch (error: any) {
      console.error("Error upvoting review:", error);

      let errorMessage = "Failed to upvote review";
      if (error.message?.includes("AlreadyVoted")) {
        errorMessage = "You have already upvoted this review";
      }

      addNotification(errorMessage, "error");
    } finally {
      setUpvotingId(null);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? "filled" : ""}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (timestamp: bigint | number) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="review-list-loading">
        <Text as="p" size="md">Loading reviews...</Text>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="review-list-empty">
        <Text as="p" size="md">No reviews yet. Be the first to review this contract!</Text>
      </div>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.review_id} className="review-card-wrapper">
          <Card>
            <div className="review-header">
              <div className="review-author">
                <Text as="span" size="sm" className="author-address">
                  {truncateAddress(review.reviewer)}
                </Text>
                <div className="review-stars">{renderStars(review.rating)}</div>
              </div>
              <Text as="span" size="xs" className="review-date">
                {formatDate(review.created_at)}
              </Text>
            </div>

            <div className="review-content">
              <Text as="p" size="md">{review.comment}</Text>
            </div>

            <div className="review-footer">
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => handleUpvote(review.review_id)}
                disabled={upvotingId === review.review_id || !wallet.address}
              >
                👍 {review.upvotes > 0 ? review.upvotes : "Helpful"}
              </Button>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
