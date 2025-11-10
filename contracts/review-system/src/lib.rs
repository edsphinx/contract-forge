#![no_std]

use soroban_sdk::{contract, contractevent, contractimpl, vec, Address, Env, String, Vec};

mod storage;
mod types;

pub use types::{Error, Review, ReviewSummary};

#[contractevent]
pub struct Reviewed {
    pub review_id: u32,
    pub contract_id: u32,
    pub rating: u32,
}

#[contractevent]
pub struct Upvoted {
    pub review_id: u32,
    pub voter: Address,
}

#[contract]
pub struct ReviewSystem;

#[contractimpl]
impl ReviewSystem {
    /// Submit a new review for a contract
    pub fn submit_review(
        env: Env,
        contract_id: u32,
        reviewer: Address,
        rating: u32,
        comment: String,
    ) -> Result<u32, Error> {
        // Require authentication
        reviewer.require_auth();

        // Validate rating (1-5)
        if !(1..=5).contains(&rating) {
            return Err(Error::InvalidRating);
        }

        // Validate comment
        if comment.is_empty() {
            return Err(Error::EmptyComment);
        }
        if comment.len() > 500 {
            return Err(Error::CommentTooLong);
        }

        // Check anti-spam: has user already reviewed this contract?
        if storage::has_reviewed(&env, contract_id, &reviewer) {
            return Err(Error::AlreadyReviewed);
        }

        // Generate review ID
        let review_id = storage::increment_counter(&env);

        // Create review
        let review = Review {
            review_id,
            contract_id,
            reviewer: reviewer.clone(),
            rating,
            comment,
            created_at: env.ledger().timestamp(),
            upvotes: 0,
        };

        // Save to storage
        storage::save_review(&env, review_id, &review);
        storage::add_to_contract_reviews(&env, contract_id, review_id);
        storage::add_to_user_reviews(&env, &reviewer, review_id);
        storage::mark_as_reviewed(&env, contract_id, &reviewer);

        // Emit event
        Reviewed {
            review_id,
            contract_id,
            rating,
        }
        .publish(&env);

        Ok(review_id)
    }

    /// Upvote a helpful review
    pub fn upvote_review(env: Env, review_id: u32, voter: Address) -> Result<(), Error> {
        voter.require_auth();

        // Check if already upvoted
        if storage::has_upvoted(&env, review_id, &voter) {
            return Err(Error::AlreadyVoted);
        }

        // Get review
        let mut review = storage::get_review(&env, review_id).ok_or(Error::ReviewNotFound)?;

        // Increment upvotes
        review.upvotes = review.upvotes.checked_add(1).unwrap_or(review.upvotes);

        // Save updated review
        storage::save_review(&env, review_id, &review);
        storage::mark_as_upvoted(&env, review_id, &voter);

        // Emit event
        Upvoted { review_id, voter }.publish(&env);

        Ok(())
    }

    /// Get a specific review
    pub fn get_review(env: Env, review_id: u32) -> Result<Review, Error> {
        storage::get_review(&env, review_id).ok_or(Error::ReviewNotFound)
    }

    /// Get all reviews for a contract
    pub fn get_reviews_for_contract(env: Env, contract_id: u32) -> Vec<Review> {
        let review_ids = storage::get_contract_reviews(&env, contract_id);
        let mut reviews = Vec::new(&env);

        for id in review_ids.iter() {
            if let Some(review) = storage::get_review(&env, id) {
                reviews.push_back(review);
            }
        }

        reviews
    }

    /// Get all reviews by a specific user
    pub fn get_reviews_by_user(env: Env, reviewer: Address) -> Vec<Review> {
        let review_ids = storage::get_user_reviews(&env, &reviewer);
        let mut reviews = Vec::new(&env);

        for id in review_ids.iter() {
            if let Some(review) = storage::get_review(&env, id) {
                reviews.push_back(review);
            }
        }

        reviews
    }

    /// Get review summary (aggregate statistics) for a contract
    pub fn get_review_summary(env: Env, contract_id: u32) -> ReviewSummary {
        let reviews = Self::get_reviews_for_contract(env.clone(), contract_id);

        if reviews.is_empty() {
            return ReviewSummary {
                contract_id,
                total_reviews: 0,
                average_rating: 0,
                rating_distribution: vec![&env, 0, 0, 0, 0, 0],
            };
        }

        // Calculate statistics
        let total_reviews = reviews.len();
        let mut total_rating: u32 = 0;
        let mut distribution = vec![&env, 0u32, 0u32, 0u32, 0u32, 0u32];

        for review in reviews.iter() {
            total_rating += review.rating;

            // Update distribution (rating is 1-5, index is 0-4)
            let index = review.rating - 1;
            let current = distribution.get(index).unwrap_or(0);
            distribution.set(index, current + 1);
        }

        // Calculate average * 100 (e.g., 450 = 4.5 stars)
        let average_rating = (total_rating * 100) / total_reviews;

        ReviewSummary {
            contract_id,
            total_reviews,
            average_rating,
            rating_distribution: distribution,
        }
    }

    /// Get total number of reviews
    pub fn get_review_count(env: Env) -> u32 {
        storage::get_counter(&env)
    }
}

mod test;
