use soroban_sdk::{symbol_short, Address, Env, Symbol, Vec};

use crate::types::DeploymentRecord;

// Storage keys
const DEPLOYMENT_COUNTER: Symbol = symbol_short!("DCOUNT");
const ALL_DEPLOYMENTS: Symbol = symbol_short!("ALLDEPL");
const DEPLOYER_PREFIX: Symbol = symbol_short!("DEPLOYER");
const CONTRACT_PREFIX: Symbol = symbol_short!("CONTRACT");

pub fn get_counter(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DEPLOYMENT_COUNTER)
        .unwrap_or(0)
}

pub fn increment_counter(env: &Env) -> u32 {
    let counter = get_counter(env);
    let new_counter = counter + 1;
    env.storage()
        .instance()
        .set(&DEPLOYMENT_COUNTER, &new_counter);
    new_counter
}

pub fn save_deployment(env: &Env, deployment_id: u32, record: &DeploymentRecord) {
    env.storage().instance().set(&deployment_id, record);
}

pub fn get_deployment(env: &Env, deployment_id: u32) -> Option<DeploymentRecord> {
    env.storage().instance().get(&deployment_id)
}

pub fn get_all_deployment_ids(env: &Env) -> Vec<u32> {
    env.storage()
        .instance()
        .get(&ALL_DEPLOYMENTS)
        .unwrap_or(Vec::new(env))
}

pub fn add_to_all_deployments(env: &Env, deployment_id: u32) {
    let mut all = get_all_deployment_ids(env);
    all.push_back(deployment_id);
    env.storage().instance().set(&ALL_DEPLOYMENTS, &all);
}

pub fn get_deployer_deployments(env: &Env, deployer: &Address) -> Vec<u32> {
    let key = (DEPLOYER_PREFIX, deployer);
    env.storage().instance().get(&key).unwrap_or(Vec::new(env))
}

pub fn add_to_deployer(env: &Env, deployer: &Address, deployment_id: u32) {
    let mut deployments = get_deployer_deployments(env, deployer);
    deployments.push_back(deployment_id);
    let key = (DEPLOYER_PREFIX, deployer);
    env.storage().instance().set(&key, &deployments);
}

pub fn get_contract_deployments(env: &Env, contract_id: u32) -> Vec<u32> {
    let key = (CONTRACT_PREFIX, contract_id);
    env.storage().instance().get(&key).unwrap_or(Vec::new(env))
}

pub fn add_to_contract_deployments(env: &Env, contract_id: u32, deployment_id: u32) {
    let mut deployments = get_contract_deployments(env, contract_id);
    deployments.push_back(deployment_id);
    let key = (CONTRACT_PREFIX, contract_id);
    env.storage().instance().set(&key, &deployments);
}
