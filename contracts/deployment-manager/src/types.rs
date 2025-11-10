use soroban_sdk::{contracterror, contracttype, Address, BytesN};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct DeploymentRecord {
    pub deployment_id: u32,
    pub contract_id: u32,
    pub deployer: Address,
    pub deployed_contract_address: Address,
    pub deployed_at: u64,
    pub wasm_hash: BytesN<32>,
    pub salt: BytesN<32>,
}

#[contracterror]
#[derive(Clone, Copy, Debug, PartialEq, PartialOrd, Ord, Eq)]
#[repr(u32)]
pub enum Error {
    ContractNotFound = 1,
    DeploymentFailed = 2,
    InvalidParameters = 3,
    InvalidWasmHash = 4,
    UnauthorizedAccess = 5,
}
