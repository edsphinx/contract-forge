#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_submit_review_success() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let reviewer = Address::generate(&env);
    let contract_to_review = 1u32;
    let rating = 5;
    let comment = String::from_str(&env, "Excellent contract!");

    let review_id = client.submit_review(&contract_to_review, &reviewer, &rating, &comment);
    assert_eq!(review_id, 1);

    // Verify review was stored
    let review = client.get_review(&review_id);
    assert_eq!(review.rating, 5);
    assert_eq!(review.comment, comment);
    assert_eq!(review.reviewer, reviewer);
}

#[test]
#[should_panic]
fn test_submit_review_invalid_rating_too_low() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let reviewer = Address::generate(&env);
    let contract_to_review = 1u32;
    let rating = 0; // Invalid: too low
    let comment = String::from_str(&env, "Test");

    client.submit_review(&contract_to_review, &reviewer, &rating, &comment);
}

#[test]
#[should_panic]
fn test_submit_review_invalid_rating_too_high() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let reviewer = Address::generate(&env);
    let contract_to_review = 1u32;
    let rating = 6; // Invalid: too high
    let comment = String::from_str(&env, "Test");

    client.submit_review(&contract_to_review, &reviewer, &rating, &comment);
}

#[test]
#[should_panic]
fn test_submit_review_empty_comment() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let reviewer = Address::generate(&env);
    let contract_to_review = 1u32;
    let rating = 5;
    let comment = String::from_str(&env, "");

    client.submit_review(&contract_to_review, &reviewer, &rating, &comment);
}

#[test]
#[should_panic]
fn test_submit_review_duplicate() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let reviewer = Address::generate(&env);
    let contract_to_review = 1u32;
    let rating = 5;
    let comment = String::from_str(&env, "Great!");

    // Submit first review
    client.submit_review(&contract_to_review, &reviewer, &rating, &comment);

    // Try to submit second review for same contract (should panic)
    client.submit_review(&contract_to_review, &reviewer, &rating, &comment);
}

#[test]
fn test_upvote_review() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let reviewer = Address::generate(&env);
    let voter = Address::generate(&env);
    let contract_to_review = 1u32;
    let rating = 5;
    let comment = String::from_str(&env, "Great!");

    // Submit review
    let review_id = client.submit_review(&contract_to_review, &reviewer, &rating, &comment);

    // Initial upvotes should be 0
    let review = client.get_review(&review_id);
    assert_eq!(review.upvotes, 0);

    // Upvote the review
    client.upvote_review(&review_id, &voter);

    // Verify upvote count increased
    let review = client.get_review(&review_id);
    assert_eq!(review.upvotes, 1);
}

#[test]
#[should_panic]
fn test_upvote_duplicate() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let reviewer = Address::generate(&env);
    let voter = Address::generate(&env);
    let contract_to_review = 1u32;
    let rating = 5;
    let comment = String::from_str(&env, "Great!");

    // Submit review
    let review_id = client.submit_review(&contract_to_review, &reviewer, &rating, &comment);

    // First upvote
    client.upvote_review(&review_id, &voter);

    // Try to upvote again (should panic)
    client.upvote_review(&review_id, &voter);
}

#[test]
fn test_get_reviews_for_contract() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let reviewer1 = Address::generate(&env);
    let reviewer2 = Address::generate(&env);
    let contract_to_review = 1u32;

    // Submit two reviews
    client.submit_review(
        &contract_to_review,
        &reviewer1,
        &5,
        &String::from_str(&env, "Great!"),
    );

    client.submit_review(
        &contract_to_review,
        &reviewer2,
        &4,
        &String::from_str(&env, "Good"),
    );

    // Get all reviews for the contract
    let reviews = client.get_reviews_for_contract(&contract_to_review);
    assert_eq!(reviews.len(), 2);
}

#[test]
fn test_get_review_summary() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let contract_to_review = 1u32;

    // Submit reviews with different ratings
    let reviewer1 = Address::generate(&env);
    client.submit_review(
        &contract_to_review,
        &reviewer1,
        &5,
        &String::from_str(&env, "Excellent!"),
    );

    let reviewer2 = Address::generate(&env);
    client.submit_review(
        &contract_to_review,
        &reviewer2,
        &4,
        &String::from_str(&env, "Good"),
    );

    let reviewer3 = Address::generate(&env);
    client.submit_review(
        &contract_to_review,
        &reviewer3,
        &5,
        &String::from_str(&env, "Great!"),
    );

    // Get summary
    let summary = client.get_review_summary(&contract_to_review);
    assert_eq!(summary.total_reviews, 3);

    // Average: (5 + 4 + 5) / 3 = 4.666... * 100 = 466
    assert_eq!(summary.average_rating, 466);

    // Distribution: [0, 0, 0, 1, 2] (one 4-star, two 5-star)
    assert_eq!(summary.rating_distribution.get(3).unwrap(), 1); // 4-star
    assert_eq!(summary.rating_distribution.get(4).unwrap(), 2); // 5-star
}

#[test]
fn test_get_review_summary_empty() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    let contract_to_review = 1u32;

    // Get summary for contract with no reviews
    let summary = client.get_review_summary(&contract_to_review);
    assert_eq!(summary.total_reviews, 0);
    assert_eq!(summary.average_rating, 0);
}

#[test]
fn test_get_reviews_by_user() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let reviewer = Address::generate(&env);
    let contract1 = 1u32;
    let contract2 = 2u32;

    // User reviews two different contracts
    client.submit_review(&contract1, &reviewer, &5, &String::from_str(&env, "Great!"));

    client.submit_review(&contract2, &reviewer, &4, &String::from_str(&env, "Good"));

    // Get all reviews by this user
    let reviews = client.get_reviews_by_user(&reviewer);
    assert_eq!(reviews.len(), 2);
}

#[test]
fn test_get_review_count() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    // Initial count should be 0
    assert_eq!(client.get_review_count(), 0);

    let reviewer = Address::generate(&env);
    let contract_to_review = 1u32;

    // Submit a review
    client.submit_review(
        &contract_to_review,
        &reviewer,
        &5,
        &String::from_str(&env, "Great!"),
    );

    assert_eq!(client.get_review_count(), 1);
}

#[test]
fn test_review_sorting_by_upvotes() {
    let env = Env::default();
    let contract_id = env.register(ReviewSystem, ());
    let client = ReviewSystemClient::new(&env, &contract_id);

    env.mock_all_auths();

    let contract_to_review = 1u32;

    // Submit three reviews
    let reviewer1 = Address::generate(&env);
    let review_id1 = client.submit_review(
        &contract_to_review,
        &reviewer1,
        &5,
        &String::from_str(&env, "Review 1"),
    );

    let reviewer2 = Address::generate(&env);
    let review_id2 = client.submit_review(
        &contract_to_review,
        &reviewer2,
        &4,
        &String::from_str(&env, "Review 2"),
    );

    let reviewer3 = Address::generate(&env);
    let review_id3 = client.submit_review(
        &contract_to_review,
        &reviewer3,
        &3,
        &String::from_str(&env, "Review 3"),
    );

    // Upvote review 2 twice
    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);
    client.upvote_review(&review_id2, &voter1);
    client.upvote_review(&review_id2, &voter2);

    // Upvote review 3 once
    client.upvote_review(&review_id3, &voter1);

    // Verify upvote counts
    assert_eq!(client.get_review(&review_id1).upvotes, 0);
    assert_eq!(client.get_review(&review_id2).upvotes, 2);
    assert_eq!(client.get_review(&review_id3).upvotes, 1);
}
