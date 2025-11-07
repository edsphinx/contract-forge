use soroban_sdk::{contracterror, contracttype, Address, BytesN, String, Vec};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct PublishParams {
    pub wasm_hash: BytesN<32>,
    pub name: String,
    pub description: String,
    pub version: String,
    pub category: Category,
    pub tags: Vec<String>,
    pub source_url: String,
    pub documentation_url: String,
    pub license: String,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct ContractMetadata {
    pub id: u32, // Changed to numeric ID for simplicity
    pub wasm_hash: BytesN<32>,
    pub name: String,
    pub description: String,
    pub version: String,
    pub author: Address,
    pub category: Category,
    pub tags: Vec<String>,
    pub source_url: String,
    pub documentation_url: String,
    pub license: String,
    pub published_at: u64,
    pub updated_at: u64,
    pub total_deployments: u32,
    pub verified: bool,
}

#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq)]
#[repr(u32)]
pub enum Category {
    DeFi = 0,
    NFT = 1,
    DAO = 2,
    Gaming = 3,
    Utility = 4,
    Oracle = 5,
    Other = 6,
}

#[contracterror]
#[derive(Clone, Copy, Debug, PartialEq, PartialOrd, Ord, Eq)]
#[repr(u32)]
pub enum Error {
    ContractAlreadyExists = 1,
    ContractNotFound = 2,
    UnauthorizedUpdate = 3,
    InvalidMetadata = 4,
    InvalidWasmHash = 5,
    UnauthorizedVerification = 6,
}
