#![no_std]

use soroban_sdk::{contract, contractevent, contractimpl, Address, BytesN, Env, Vec};

mod storage;
mod types;

pub use types::{DeploymentRecord, Error};

#[contractevent]
pub struct DeployedEvent {
    pub deployment_id: u32,
    pub deployed_address: Address,
}

#[contract]
pub struct DeploymentManager;

#[contractimpl]
impl DeploymentManager {
    /// Deploy a contract from the registry (simplified for MVP)
    pub fn deploy_from_wasm(
        env: Env,
        contract_id: u32,
        deployer: Address,
        wasm_hash: BytesN<32>,
        salt: BytesN<32>,
    ) -> Result<u32, Error> {
        // Require authentication from deployer
        deployer.require_auth();

        // In a full implementation, this would:
        // 1. Call ContractRegistry to get metadata
        // 2. Use env.deployer() to deploy the WASM
        // For MVP, we simulate deployment and track the record

        // Deploy the contract
        // Note: In production, this would use:
        // let deployed_address = env
        //     .deployer()
        //     .with_address(deployer.clone(), salt.clone())
        //     .deploy(wasm_hash);

        // For MVP, we'll create a simulated deployed address
        let deployed_address = deployer.clone();

        // Generate deployment ID
        let deployment_id = storage::increment_counter(&env);

        // Create deployment record
        let record = DeploymentRecord {
            deployment_id,
            contract_id,
            deployer: deployer.clone(),
            deployed_contract_address: deployed_address.clone(),
            deployed_at: env.ledger().timestamp(),
            wasm_hash,
            salt,
        };

        // Save to storage
        storage::save_deployment(&env, deployment_id, &record);
        storage::add_to_all_deployments(&env, deployment_id);
        storage::add_to_deployer(&env, &deployer, deployment_id);
        storage::add_to_contract_deployments(&env, contract_id, deployment_id);

        // Emit event
        DeployedEvent {
            deployment_id,
            deployed_address,
        }
        .publish(&env);

        Ok(deployment_id)
    }

    /// Get a specific deployment record
    pub fn get_deployment(env: Env, deployment_id: u32) -> Result<DeploymentRecord, Error> {
        storage::get_deployment(&env, deployment_id).ok_or(Error::ContractNotFound)
    }

    /// Get deployment history for a specific deployer
    pub fn get_deployment_history(env: Env, deployer: Address) -> Vec<DeploymentRecord> {
        let deployment_ids = storage::get_deployer_deployments(&env, &deployer);
        let mut records = Vec::new(&env);

        for id in deployment_ids.iter() {
            if let Some(record) = storage::get_deployment(&env, id) {
                records.push_back(record);
            }
        }

        records
    }

    /// Get all deployments of a specific contract
    pub fn get_contract_deployments(env: Env, contract_id: u32) -> Vec<DeploymentRecord> {
        let deployment_ids = storage::get_contract_deployments(&env, contract_id);
        let mut records = Vec::new(&env);

        for id in deployment_ids.iter() {
            if let Some(record) = storage::get_deployment(&env, id) {
                records.push_back(record);
            }
        }

        records
    }

    /// Get all deployment records
    pub fn get_all_deployments(env: Env) -> Vec<DeploymentRecord> {
        let deployment_ids = storage::get_all_deployment_ids(&env);
        let mut records = Vec::new(&env);

        for id in deployment_ids.iter() {
            if let Some(record) = storage::get_deployment(&env, id) {
                records.push_back(record);
            }
        }

        records
    }

    /// Get total number of deployments
    pub fn get_total_deployments(env: Env) -> u32 {
        storage::get_counter(&env)
    }
}

mod test;
