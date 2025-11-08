#![no_std]

use soroban_sdk::{contract, contractevent, contractimpl, Address, Env, String, Vec};

mod storage;
mod types;

pub use types::{Category, ContractMetadata, Error, PublishParams};

#[contractevent]
pub struct Published {
    pub contract_id: u32,
}

#[contractevent]
pub struct Updated {
    pub contract_id: u32,
}

#[contractevent]
pub struct Verified {
    pub contract_id: u32,
    pub auditor: Address,
}

#[contractevent]
pub struct Deployed {
    pub contract_id: u32,
    pub total_deployments: u32,
}

#[contract]
pub struct ContractRegistry;

#[contractimpl]
impl ContractRegistry {
    /// Publish a new contract to the registry
    pub fn publish_contract(
        env: Env,
        author: Address,
        params: PublishParams,
    ) -> Result<u32, Error> {
        // Require authentication from the author
        author.require_auth();

        // Validate inputs
        if params.name.is_empty() || params.name.len() > 100 {
            return Err(Error::InvalidMetadata);
        }
        if params.description.is_empty() || params.description.len() > 500 {
            return Err(Error::InvalidMetadata);
        }
        if params.source_url.is_empty() {
            return Err(Error::InvalidMetadata);
        }
        if params.tags.len() > 10 {
            return Err(Error::InvalidMetadata);
        }

        // Generate unique contract ID
        let contract_id = storage::increment_counter(&env);

        // Create metadata
        let metadata = ContractMetadata {
            id: contract_id,
            wasm_hash: params.wasm_hash,
            name: params.name,
            description: params.description,
            version: params.version,
            author,
            category: params.category,
            tags: params.tags,
            source_url: params.source_url,
            documentation_url: params.documentation_url,
            license: params.license,
            published_at: env.ledger().timestamp(),
            updated_at: env.ledger().timestamp(),
            total_deployments: 0,
            verified: false,
        };

        // Save to storage
        storage::save_contract(&env, contract_id, &metadata);
        storage::add_to_all_contracts(&env, contract_id);
        storage::add_to_category(&env, &metadata.category, contract_id);

        // Emit event
        Published { contract_id }.publish(&env);

        Ok(contract_id)
    }

    /// Update metadata for an existing contract (author only)
    pub fn update_metadata(
        env: Env,
        contract_id: u32,
        description: Option<String>,
        documentation_url: Option<String>,
        tags: Option<Vec<String>>,
    ) -> Result<(), Error> {
        // Retrieve existing metadata
        let mut metadata =
            storage::get_contract(&env, contract_id).ok_or(Error::ContractNotFound)?;

        // Verify caller is the author
        metadata.author.require_auth();

        // Update fields
        if let Some(desc) = description {
            if desc.is_empty() || desc.len() > 500 {
                return Err(Error::InvalidMetadata);
            }
            metadata.description = desc;
        }

        if let Some(doc_url) = documentation_url {
            metadata.documentation_url = doc_url;
        }

        if let Some(new_tags) = tags {
            if new_tags.len() > 10 {
                return Err(Error::InvalidMetadata);
            }
            metadata.tags = new_tags;
        }

        // Update timestamp
        metadata.updated_at = env.ledger().timestamp();

        // Save updated metadata
        storage::save_contract(&env, contract_id, &metadata);

        // Emit event
        Updated { contract_id }.publish(&env);

        Ok(())
    }

    /// Get metadata for a specific contract
    pub fn get_contract(env: Env, contract_id: u32) -> Result<ContractMetadata, Error> {
        storage::get_contract(&env, contract_id).ok_or(Error::ContractNotFound)
    }

    /// Get all published contracts
    pub fn get_all_contracts(env: Env) -> Vec<ContractMetadata> {
        let contract_ids = storage::get_all_contract_ids(&env);
        let mut contracts = Vec::new(&env);

        for id in contract_ids.iter() {
            if let Some(metadata) = storage::get_contract(&env, id) {
                contracts.push_back(metadata);
            }
        }

        contracts
    }

    /// Search contracts by category
    pub fn search_by_category(env: Env, category: Category) -> Vec<ContractMetadata> {
        let contract_ids = storage::get_category_contracts(&env, &category);
        let mut contracts = Vec::new(&env);

        for id in contract_ids.iter() {
            if let Some(metadata) = storage::get_contract(&env, id) {
                contracts.push_back(metadata);
            }
        }

        contracts
    }

    /// Search contracts by tag
    pub fn search_by_tag(env: Env, tag: String) -> Vec<ContractMetadata> {
        let all_contracts = Self::get_all_contracts(env.clone());
        let mut matching = Vec::new(&env);

        for contract in all_contracts.iter() {
            for contract_tag in contract.tags.iter() {
                if contract_tag == tag {
                    matching.push_back(contract.clone());
                    break;
                }
            }
        }

        matching
    }

    /// Verify a contract (auditors only - for MVP, anyone can verify for testing)
    pub fn verify_contract(env: Env, contract_id: u32, auditor: Address) -> Result<(), Error> {
        auditor.require_auth();

        let mut metadata =
            storage::get_contract(&env, contract_id).ok_or(Error::ContractNotFound)?;

        metadata.verified = true;
        storage::save_contract(&env, contract_id, &metadata);

        // Emit event
        Verified {
            contract_id,
            auditor,
        }
        .publish(&env);

        Ok(())
    }

    /// Increment deployment count (called by DeploymentManager)
    pub fn increment_deployment_count(
        env: Env, 
        contract_id: u32,
        caller: Address
    ) -> Result<(), Error> {
        // Require authentication from caller
        caller.require_auth();
        
        // TODO: Add proper access control - only authorized deployment managers should call this
        // For now, any authenticated caller can increment the count
        
        let mut metadata =
            storage::get_contract(&env, contract_id).ok_or(Error::ContractNotFound)?;

        metadata.total_deployments = metadata
            .total_deployments
            .checked_add(1)
            .unwrap_or(metadata.total_deployments);

        storage::save_contract(&env, contract_id, &metadata);

        // Emit event
        Deployed {
            contract_id,
            total_deployments: metadata.total_deployments,
        }
        .publish(&env);

        Ok(())
    }

    /// Get total number of contracts
    pub fn get_contract_count(env: Env) -> u32 {
        storage::get_counter(&env)
    }
}

mod test;
