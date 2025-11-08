use soroban_sdk::{symbol_short, Env, Symbol, Vec};

use crate::types::{Category, ContractMetadata};

// Storage keys
const COUNTER: Symbol = symbol_short!("COUNTER");
const ALL_CONTRACTS: Symbol = symbol_short!("ALL");

pub fn get_counter(env: &Env) -> u32 {
    env.storage().instance().get(&COUNTER).unwrap_or(0)
}

pub fn increment_counter(env: &Env) -> u32 {
    let counter = get_counter(env);
    let new_counter = counter.checked_add(1).unwrap_or_else(|| {
        // If overflow occurs, we could either:
        // 1. Panic (current behavior)
        // 2. Return an error
        // 3. Reset to 1 (not recommended as it could cause ID conflicts)
        panic!("Contract ID counter overflow")
    });
    env.storage().instance().set(&COUNTER, &new_counter);
    new_counter
}

pub fn save_contract(env: &Env, contract_id: u32, metadata: &ContractMetadata) {
    env.storage().instance().set(&contract_id, metadata);
}

pub fn get_contract(env: &Env, contract_id: u32) -> Option<ContractMetadata> {
    env.storage().instance().get(&contract_id)
}

pub fn get_all_contract_ids(env: &Env) -> Vec<u32> {
    env.storage()
        .instance()
        .get(&ALL_CONTRACTS)
        .unwrap_or(Vec::new(env))
}

pub fn add_to_all_contracts(env: &Env, contract_id: u32) {
    let mut all = get_all_contract_ids(env);
    all.push_back(contract_id);
    env.storage().instance().set(&ALL_CONTRACTS, &all);
}

pub fn get_category_contracts(env: &Env, category: &Category) -> Vec<u32> {
    let cat_key = Symbol::new(env, &format!("CAT_{}", *category as u32));
    env.storage()
        .instance()
        .get(&cat_key)
        .unwrap_or(Vec::new(env))
}

pub fn add_to_category(env: &Env, category: &Category, contract_id: u32) {
    let mut contracts = get_category_contracts(env, category);
    contracts.push_back(contract_id);
    let cat_num = *category as u32;
    env.storage().instance().set(&cat_num, &contracts);
}
