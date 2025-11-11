#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env};

#[test]
fn test_deploy_from_wasm_success() {
    let env = Env::default();
    let contract_id = env.register(DeploymentManager, ());
    let client = DeploymentManagerClient::new(&env, &contract_id);

    env.mock_all_auths();

    let deployer = Address::generate(&env);
    let wasm_hash = BytesN::from_array(&env, &[1u8; 32]);
    let salt = BytesN::from_array(&env, &[2u8; 32]);
    let contract_registry_id = 1u32;

    let init_args = vec![&env];
    let deployment_id = client.deploy_from_wasm(
        &contract_registry_id,
        &deployer,
        &wasm_hash,
        &salt,
        &init_args,
    );

    assert_eq!(deployment_id, 1);
}

#[test]
fn test_get_deployment() {
    let env = Env::default();
    let contract_id = env.register(DeploymentManager, ());
    let client = DeploymentManagerClient::new(&env, &contract_id);

    env.mock_all_auths();

    let deployer = Address::generate(&env);
    let wasm_hash = BytesN::from_array(&env, &[1u8; 32]);
    let salt = BytesN::from_array(&env, &[2u8; 32]);
    let contract_registry_id = 1u32;

    let init_args = vec![&env];
    let deployment_id = client.deploy_from_wasm(
        &contract_registry_id,
        &deployer,
        &wasm_hash,
        &salt,
        &init_args,
    );

    let record = client.get_deployment(&deployment_id);
    assert_eq!(record.deployment_id, deployment_id);
    assert_eq!(record.contract_id, contract_registry_id);
    assert_eq!(record.deployer, deployer);
}

#[test]
#[should_panic]
fn test_get_deployment_not_found() {
    let env = Env::default();
    let contract_id = env.register(DeploymentManager, ());
    let client = DeploymentManagerClient::new(&env, &contract_id);

    let fake_id = 999u32;
    client.get_deployment(&fake_id);
}

#[test]
fn test_get_deployment_history() {
    let env = Env::default();
    let contract_id = env.register(DeploymentManager, ());
    let client = DeploymentManagerClient::new(&env, &contract_id);

    env.mock_all_auths();

    let deployer = Address::generate(&env);
    let wasm_hash = BytesN::from_array(&env, &[1u8; 32]);
    let salt1 = BytesN::from_array(&env, &[2u8; 32]);
    let salt2 = BytesN::from_array(&env, &[3u8; 32]);
    let contract_id1 = 1u32;
    let contract_id2 = 2u32;

    // Deploy twice with same deployer
    let init_args = vec![&env];
    client.deploy_from_wasm(&contract_id1, &deployer, &wasm_hash, &salt1, &init_args);

    client.deploy_from_wasm(&contract_id2, &deployer, &wasm_hash, &salt2, &init_args);

    // Get deployment history
    let history = client.get_deployment_history(&deployer);
    assert_eq!(history.len(), 2);
}

#[test]
fn test_get_contract_deployments() {
    let env = Env::default();
    let contract_id = env.register(DeploymentManager, ());
    let client = DeploymentManagerClient::new(&env, &contract_id);

    env.mock_all_auths();

    let deployer1 = Address::generate(&env);
    let deployer2 = Address::generate(&env);
    let wasm_hash = BytesN::from_array(&env, &[1u8; 32]);
    let salt1 = BytesN::from_array(&env, &[2u8; 32]);
    let salt2 = BytesN::from_array(&env, &[3u8; 32]);
    let contract_registry_id = 1u32;

    // Deploy same contract twice by different deployers
    let init_args = vec![&env];
    client.deploy_from_wasm(&contract_registry_id, &deployer1, &wasm_hash, &salt1, &init_args);

    client.deploy_from_wasm(&contract_registry_id, &deployer2, &wasm_hash, &salt2, &init_args);

    // Get contract deployments
    let deployments = client.get_contract_deployments(&contract_registry_id);
    assert_eq!(deployments.len(), 2);
}

#[test]
fn test_get_all_deployments() {
    let env = Env::default();
    let contract_id = env.register(DeploymentManager, ());
    let client = DeploymentManagerClient::new(&env, &contract_id);

    env.mock_all_auths();

    let deployer = Address::generate(&env);
    let wasm_hash = BytesN::from_array(&env, &[1u8; 32]);
    let salt1 = BytesN::from_array(&env, &[2u8; 32]);
    let salt2 = BytesN::from_array(&env, &[3u8; 32]);
    let salt3 = BytesN::from_array(&env, &[4u8; 32]);
    let contract_id1 = 1u32;
    let contract_id2 = 2u32;
    let contract_id3 = 3u32;

    // Deploy multiple contracts
    let init_args = vec![&env];
    client.deploy_from_wasm(&contract_id1, &deployer, &wasm_hash, &salt1, &init_args);

    client.deploy_from_wasm(&contract_id2, &deployer, &wasm_hash, &salt2, &init_args);

    client.deploy_from_wasm(&contract_id3, &deployer, &wasm_hash, &salt3, &init_args);

    // Get all deployments
    let all = client.get_all_deployments();
    assert_eq!(all.len(), 3);
}

#[test]
fn test_get_total_deployments() {
    let env = Env::default();
    let contract_id = env.register(DeploymentManager, ());
    let client = DeploymentManagerClient::new(&env, &contract_id);

    env.mock_all_auths();

    // Initial count should be 0
    assert_eq!(client.get_total_deployments(), 0);

    let deployer = Address::generate(&env);
    let wasm_hash = BytesN::from_array(&env, &[1u8; 32]);
    let salt = BytesN::from_array(&env, &[2u8; 32]);
    let contract_registry_id = 1u32;

    // Deploy a contract
    let init_args = vec![&env];
    client.deploy_from_wasm(&contract_registry_id, &deployer, &wasm_hash, &salt, &init_args);

    assert_eq!(client.get_total_deployments(), 1);

    // Deploy another
    let salt2 = BytesN::from_array(&env, &[3u8; 32]);
    client.deploy_from_wasm(&contract_registry_id, &deployer, &wasm_hash, &salt2, &init_args);

    assert_eq!(client.get_total_deployments(), 2);
}

#[test]
fn test_multiple_deployments_same_contract() {
    let env = Env::default();
    let contract_id = env.register(DeploymentManager, ());
    let client = DeploymentManagerClient::new(&env, &contract_id);

    env.mock_all_auths();

    let deployer = Address::generate(&env);
    let wasm_hash = BytesN::from_array(&env, &[1u8; 32]);
    let contract_registry_id = 1u32;

    // Deploy same contract 3 times with different salts
    let init_args = vec![&env];
    for i in 0..3 {
        let salt = BytesN::from_array(&env, &[i as u8; 32]);
        client.deploy_from_wasm(&contract_registry_id, &deployer, &wasm_hash, &salt, &init_args);
    }

    // Verify all deployments recorded
    let contract_deployments = client.get_contract_deployments(&contract_registry_id);
    assert_eq!(contract_deployments.len(), 3);

    let deployer_history = client.get_deployment_history(&deployer);
    assert_eq!(deployer_history.len(), 3);
}
