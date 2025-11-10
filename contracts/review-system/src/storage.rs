use soroban_sdk::{symbol_short, Address, Env, Symbol, Vec};

use crate::types::Review;

// Storage keys
const REVIEW_COUNTER: Symbol = symbol_short!("RCOUNT");
const HAS_REVIEWED_PREFIX: Symbol = symbol_short!("HASREV");
const UPVOTE_PREFIX: Symbol = symbol_short!("UPVOTE");
const CONTRACT_REVIEWS_PREFIX: Symbol = symbol_short!("CTREV");
const USER_REVIEWS_PREFIX: Symbol = symbol_short!("USERREV");

pub fn get_counter(env: &Env) -> u32 {
    env.storage().instance().get(&REVIEW_COUNTER).unwrap_or(0)
}

pub fn increment_counter(env: &Env) -> u32 {
    let counter = get_counter(env);
    let new_counter = counter + 1;
    env.storage().instance().set(&REVIEW_COUNTER, &new_counter);
    new_counter
}

pub fn save_review(env: &Env, review_id: u32, review: &Review) {
    env.storage().instance().set(&review_id, review);
}

pub fn get_review(env: &Env, review_id: u32) -> Option<Review> {
    env.storage().instance().get(&review_id)
}

pub fn has_reviewed(env: &Env, contract_id: u32, reviewer: &Address) -> bool {
    let key = (HAS_REVIEWED_PREFIX, contract_id, reviewer);
    env.storage().instance().get(&key).unwrap_or(false)
}

pub fn mark_as_reviewed(env: &Env, contract_id: u32, reviewer: &Address) {
    let key = (HAS_REVIEWED_PREFIX, contract_id, reviewer);
    env.storage().instance().set(&key, &true);
}

pub fn has_upvoted(env: &Env, review_id: u32, voter: &Address) -> bool {
    let key = (UPVOTE_PREFIX, review_id, voter);
    env.storage().instance().get(&key).unwrap_or(false)
}

pub fn mark_as_upvoted(env: &Env, review_id: u32, voter: &Address) {
    let key = (UPVOTE_PREFIX, review_id, voter);
    env.storage().instance().set(&key, &true);
}

pub fn get_contract_reviews(env: &Env, contract_id: u32) -> Vec<u32> {
    let key = (CONTRACT_REVIEWS_PREFIX, contract_id);
    env.storage().instance().get(&key).unwrap_or(Vec::new(env))
}

pub fn add_to_contract_reviews(env: &Env, contract_id: u32, review_id: u32) {
    let mut reviews = get_contract_reviews(env, contract_id);
    reviews.push_back(review_id);
    let key = (CONTRACT_REVIEWS_PREFIX, contract_id);
    env.storage().instance().set(&key, &reviews);
}

pub fn get_user_reviews(env: &Env, reviewer: &Address) -> Vec<u32> {
    let key = (USER_REVIEWS_PREFIX, reviewer);
    env.storage().instance().get(&key).unwrap_or(Vec::new(env))
}

pub fn add_to_user_reviews(env: &Env, reviewer: &Address, review_id: u32) {
    let mut reviews = get_user_reviews(env, reviewer);
    reviews.push_back(review_id);
    let key = (USER_REVIEWS_PREFIX, reviewer);
    env.storage().instance().set(&key, &reviews);
}
