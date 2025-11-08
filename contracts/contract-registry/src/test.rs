#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, BytesN, Env};

fn create_test_params(env: &Env) -> PublishParams {
    PublishParams {
        wasm_hash: BytesN::from_array(env, &[0u8; 32]),
        name: String::from_str(env, "TestContract"),
        description: String::from_str(env, "A test contract for the marketplace"),
        version: String::from_str(env, "1.0.0"),
        category: Category::Utility,
        tags: vec![
            env,
            String::from_str(env, "test"),
            String::from_str(env, "utility"),
        ],
        source_url: String::from_str(env, "https://github.com/test/contract"),
        documentation_url: String::from_str(env, "https://docs.test.com"),
        license: String::from_str(env, "MIT"),
    }
}

#[test]
fn test_publish_contract_success() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();

    let author = Address::generate(&env);
    let params = create_test_params(&env);
    let name = params.name.clone();

    let published_id = client.publish_contract(&author, &params);

    assert_eq!(published_id, 1);

    // Verify contract was stored
    let metadata = client.get_contract(&published_id);
    assert_eq!(metadata.name, name);
    assert_eq!(metadata.author, author);
    assert!(!metadata.verified);
    assert_eq!(metadata.total_deployments, 0);
}

#[test]
#[should_panic]
fn test_publish_contract_empty_name() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();

    let author = Address::generate(&env);
    let mut params = create_test_params(&env);
    params.name = String::from_str(&env, "");

    // This should panic due to InvalidMetadata error
    client.publish_contract(&author, &params);
}

#[test]
fn test_get_contract_exists() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();

    let author = Address::generate(&env);
    let params = create_test_params(&env);
    let name = params.name.clone();

    let published_id = client.publish_contract(&author, &params);

    let metadata = client.get_contract(&published_id);
    assert_eq!(metadata.id, published_id);
    assert_eq!(metadata.name, name);
}

#[test]
#[should_panic]
fn test_get_contract_not_found() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    let fake_id = 999;
    // This should panic with ContractNotFound error
    client.get_contract(&fake_id);
}

#[test]
fn test_update_metadata_by_author() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();

    let author = Address::generate(&env);
    let params = create_test_params(&env);

    let published_id = client.publish_contract(&author, &params);

    // Update description
    let new_desc = String::from_str(&env, "Updated description");
    client.update_metadata(&published_id, &Some(new_desc.clone()), &None, &None);

    // Verify update
    let metadata = client.get_contract(&published_id);
    assert_eq!(metadata.description, new_desc);
}

#[test]
fn test_search_by_category() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();

    let author = Address::generate(&env);
    let mut params = create_test_params(&env);

    // Publish DeFi contract
    params.category = Category::DeFi;
    client.publish_contract(&author, &params);

    // Publish Utility contract
    params.name = String::from_str(&env, "UtilityContract");
    params.category = Category::Utility;
    client.publish_contract(&author, &params);

    // Search DeFi
    let defi_contracts = client.search_by_category(&Category::DeFi);
    assert_eq!(defi_contracts.len(), 1);
    assert_eq!(defi_contracts.get(0).unwrap().category, Category::DeFi);

    // Search Utility
    let utility_contracts = client.search_by_category(&Category::Utility);
    assert_eq!(utility_contracts.len(), 1);
    assert_eq!(
        utility_contracts.get(0).unwrap().category,
        Category::Utility
    );
}

#[test]
fn test_increment_deployment_count() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();

    let author = Address::generate(&env);
    let params = create_test_params(&env);

    let published_id = client.publish_contract(&author, &params);

    // Initial deployment count should be 0
    let metadata = client.get_contract(&published_id);
    assert_eq!(metadata.total_deployments, 0);

    // Increment deployment count
    client.increment_deployment_count(&published_id);

    // Verify count incremented
    let metadata = client.get_contract(&published_id);
    assert_eq!(metadata.total_deployments, 1);

    // Increment again
    client.increment_deployment_count(&published_id);
    let metadata = client.get_contract(&published_id);
    assert_eq!(metadata.total_deployments, 2);
}

#[test]
fn test_verify_contract() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();

    let author = Address::generate(&env);
    let auditor = Address::generate(&env);
    let params = create_test_params(&env);

    let published_id = client.publish_contract(&author, &params);

    // Initial verified status should be false
    let metadata = client.get_contract(&published_id);
    assert!(!metadata.verified);

    // Verify contract
    client.verify_contract(&published_id, &auditor);

    // Verify status changed
    let metadata = client.get_contract(&published_id);
    assert!(metadata.verified);
}

#[test]
fn test_get_all_contracts() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();

    let author = Address::generate(&env);
    let mut params = create_test_params(&env);

    // Publish multiple contracts
    client.publish_contract(&author, &params);

    params.name = String::from_str(&env, "Contract2");
    client.publish_contract(&author, &params);

    params.name = String::from_str(&env, "Contract3");
    client.publish_contract(&author, &params);

    // Get all contracts
    let all_contracts = client.get_all_contracts();
    assert_eq!(all_contracts.len(), 3);
}

#[test]
fn test_get_contract_count() {
    let env = Env::default();
    let contract_id = env.register(ContractRegistry, ());
    let client = ContractRegistryClient::new(&env, &contract_id);

    env.mock_all_auths();

    // Initial count should be 0
    assert_eq!(client.get_contract_count(), 0);

    let author = Address::generate(&env);
    let mut params = create_test_params(&env);

    // Publish a contract
    client.publish_contract(&author, &params);

    assert_eq!(client.get_contract_count(), 1);

    // Publish another
    params.name = String::from_str(&env, "Contract2");
    client.publish_contract(&author, &params);

    assert_eq!(client.get_contract_count(), 2);
}
