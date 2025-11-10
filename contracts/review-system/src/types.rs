use soroban_sdk::{contracterror, contracttype, Address, String, Vec};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Review {
    pub review_id: u32,
    pub contract_id: u32,
    pub reviewer: Address,
    pub rating: u32,
    pub comment: String,
    pub created_at: u64,
    pub upvotes: u32,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct ReviewSummary {
    pub contract_id: u32,
    pub total_reviews: u32,
    pub average_rating: u32, // Average * 100 (e.g., 450 = 4.5 stars)
    pub rating_distribution: Vec<u32>, // [1-star, 2-star, 3-star, 4-star, 5-star]
}

#[contracterror]
#[derive(Clone, Copy, Debug, PartialEq, PartialOrd, Ord, Eq)]
#[repr(u32)]
pub enum Error {
    InvalidRating = 1,
    AlreadyReviewed = 2,
    ReviewNotFound = 3,
    EmptyComment = 4,
    CommentTooLong = 5,
    UnauthorizedAction = 6,
    AlreadyVoted = 7,
    CannotReviewOwnContract = 8,
}
