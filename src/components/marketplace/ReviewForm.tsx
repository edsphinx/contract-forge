import { useState } from "react";
import { Button, Text, Textarea } from "@stellar/design-system";
import { useReviewSystem } from "../../hooks/useReviewSystem";
import { useWallet } from "../../hooks/useWallet";
import { useNotification } from "../../hooks/useNotification";
import "./ReviewForm.css";

interface ReviewFormProps {
  contractId: number;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ contractId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const reviewSystem = useReviewSystem();
  const wallet = useWallet();
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewSystem.client || !wallet.address) {
      addNotification("Please connect your wallet first", "error");
      return;
    }

    if (comment.trim().length === 0) {
      addNotification("Please enter a comment", "error");
      return;
    }

    if (comment.length > 500) {
      addNotification("Comment must be 500 characters or less", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const tx = await reviewSystem.client.submit_review({
        contract_id: contractId,
        reviewer: wallet.address,
        rating,
        comment,
      });

      await tx.signAndSend();

      addNotification("Review submitted successfully!", "success");
      setComment("");
      setRating(5);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);

      // Parse error message
      let errorMessage = "Failed to submit review";
      if (error.message?.includes("AlreadyReviewed")) {
        errorMessage = "You have already reviewed this contract";
      } else if (error.message?.includes("InvalidRating")) {
        errorMessage = "Invalid rating value";
      }

      addNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= (hoveredRating || rating);
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-button ${filled ? "filled" : ""}`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          aria-label={`Rate ${i} stars`}
        >
          ★
        </button>,
      );
    }
    return stars;
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <Text as="h3" size="md">
          Write a Review
        </Text>
      </div>

      <div className="form-group">
        <label htmlFor="rating">
          <Text as="span" size="sm">
            Rating
          </Text>
        </label>
        <div className="star-rating">{renderStars()}</div>
      </div>

      <div className="form-group">
        <label htmlFor="comment">
          <Text as="span" size="sm">
            Comment
          </Text>
        </label>
        <Textarea
          id="comment"
          fieldSize="md"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this contract..."
          rows={4}
          maxLength={500}
          disabled={isSubmitting}
        />
        <Text as="span" size="xs" className="char-count">
          {comment.length}/500 characters
        </Text>
      </div>

      <Button
        variant="primary"
        size="md"
        type="submit"
        disabled={isSubmitting || !wallet.address}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
