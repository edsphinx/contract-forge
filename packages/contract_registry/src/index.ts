import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAPTDA3MLS7UEL64BK4CG4BNN7L4QSE7POTZ6W2PKLEJZCHWRHHAENSQ",
  },
} as const;

export interface PublishParams {
  category: Category;
  description: string;
  documentation_url: string;
  license: string;
  name: string;
  source_url: string;
  tags: Array<string>;
  version: string;
  wasm_hash: Buffer;
}

export interface ContractMetadata {
  author: string;
  category: Category;
  description: string;
  documentation_url: string;
  id: u32;
  license: string;
  name: string;
  published_at: u64;
  source_url: string;
  tags: Array<string>;
  total_deployments: u32;
  updated_at: u64;
  verified: boolean;
  version: string;
  wasm_hash: Buffer;
}

export enum Category {
  DeFi = 0,
  NFT = 1,
  DAO = 2,
  Gaming = 3,
  Utility = 4,
  Oracle = 5,
  Other = 6,
}

export const Errors = {
  1: { message: "ContractAlreadyExists" },
  2: { message: "ContractNotFound" },
  3: { message: "UnauthorizedUpdate" },
  4: { message: "InvalidMetadata" },
  5: { message: "InvalidWasmHash" },
  6: { message: "UnauthorizedVerification" },
};

export interface Client {
  /**
   * Construct and simulate a publish_contract transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Publish a new contract to the registry
   */
  publish_contract: (
    { author, params }: { author: string; params: PublishParams },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Construct and simulate a update_metadata transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update metadata for an existing contract (author only)
   */
  update_metadata: (
    {
      contract_id,
      description,
      documentation_url,
      tags,
    }: {
      contract_id: u32;
      description: Option<string>;
      documentation_url: Option<string>;
      tags: Option<Array<string>>;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_contract transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get metadata for a specific contract
   */
  get_contract: (
    { contract_id }: { contract_id: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<ContractMetadata>>>;

  /**
   * Construct and simulate a get_all_contracts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all published contracts
   */
  get_all_contracts: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<ContractMetadata>>>;

  /**
   * Construct and simulate a search_by_category transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Search contracts by category
   */
  search_by_category: (
    { category }: { category: Category },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Array<ContractMetadata>>>;

  /**
   * Construct and simulate a search_by_tag transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Search contracts by tag
   */
  search_by_tag: (
    { tag }: { tag: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Array<ContractMetadata>>>;

  /**
   * Construct and simulate a verify_contract transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Verify a contract (auditors only - for MVP, anyone can verify for testing)
   */
  verify_contract: (
    { contract_id, auditor }: { contract_id: u32; auditor: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a increment_deployment_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Increment deployment count (called by DeploymentManager)
   */
  increment_deployment_count: (
    { contract_id }: { contract_id: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a get_contract_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total number of contracts
   */
  get_contract_count: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>;
}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      },
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAQAAAAAAAAAAAAAADVB1Ymxpc2hQYXJhbXMAAAAAAAAJAAAAAAAAAAhjYXRlZ29yeQAAB9AAAAAIQ2F0ZWdvcnkAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAEWRvY3VtZW50YXRpb25fdXJsAAAAAAAAEAAAAAAAAAAHbGljZW5zZQAAAAAQAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAKc291cmNlX3VybAAAAAAAEAAAAAAAAAAEdGFncwAAA+oAAAAQAAAAAAAAAAd2ZXJzaW9uAAAAABAAAAAAAAAACXdhc21faGFzaAAAAAAAA+4AAAAg",
        "AAAAAQAAAAAAAAAAAAAAEENvbnRyYWN0TWV0YWRhdGEAAAAPAAAAAAAAAAZhdXRob3IAAAAAABMAAAAAAAAACGNhdGVnb3J5AAAH0AAAAAhDYXRlZ29yeQAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAARZG9jdW1lbnRhdGlvbl91cmwAAAAAAAAQAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAHbGljZW5zZQAAAAAQAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAMcHVibGlzaGVkX2F0AAAABgAAAAAAAAAKc291cmNlX3VybAAAAAAAEAAAAAAAAAAEdGFncwAAA+oAAAAQAAAAAAAAABF0b3RhbF9kZXBsb3ltZW50cwAAAAAAAAQAAAAAAAAACnVwZGF0ZWRfYXQAAAAAAAYAAAAAAAAACHZlcmlmaWVkAAAAAQAAAAAAAAAHdmVyc2lvbgAAAAAQAAAAAAAAAAl3YXNtX2hhc2gAAAAAAAPuAAAAIA==",
        "AAAAAwAAAAAAAAAAAAAACENhdGVnb3J5AAAABwAAAAAAAAAERGVGaQAAAAAAAAAAAAAAA05GVAAAAAABAAAAAAAAAANEQU8AAAAAAgAAAAAAAAAGR2FtaW5nAAAAAAADAAAAAAAAAAdVdGlsaXR5AAAAAAQAAAAAAAAABk9yYWNsZQAAAAAABQAAAAAAAAAFT3RoZXIAAAAAAAAG",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABgAAAAAAAAAVQ29udHJhY3RBbHJlYWR5RXhpc3RzAAAAAAAAAQAAAAAAAAAQQ29udHJhY3ROb3RGb3VuZAAAAAIAAAAAAAAAElVuYXV0aG9yaXplZFVwZGF0ZQAAAAAAAwAAAAAAAAAPSW52YWxpZE1ldGFkYXRhAAAAAAQAAAAAAAAAD0ludmFsaWRXYXNtSGFzaAAAAAAFAAAAAAAAABhVbmF1dGhvcml6ZWRWZXJpZmljYXRpb24AAAAG",
        "AAAABQAAAAAAAAAAAAAACVB1Ymxpc2hlZAAAAAAAAAEAAAAJcHVibGlzaGVkAAAAAAAAAQAAAAAAAAALY29udHJhY3RfaWQAAAAABAAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAAB1VwZGF0ZWQAAAAAAQAAAAd1cGRhdGVkAAAAAAEAAAAAAAAAC2NvbnRyYWN0X2lkAAAAAAQAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAACFZlcmlmaWVkAAAAAQAAAAh2ZXJpZmllZAAAAAIAAAAAAAAAC2NvbnRyYWN0X2lkAAAAAAQAAAAAAAAAAAAAAAdhdWRpdG9yAAAAABMAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAACERlcGxveWVkAAAAAQAAAAhkZXBsb3llZAAAAAIAAAAAAAAAC2NvbnRyYWN0X2lkAAAAAAQAAAAAAAAAAAAAABF0b3RhbF9kZXBsb3ltZW50cwAAAAAAAAQAAAAAAAAAAg==",
        "AAAAAAAAACZQdWJsaXNoIGEgbmV3IGNvbnRyYWN0IHRvIHRoZSByZWdpc3RyeQAAAAAAEHB1Ymxpc2hfY29udHJhY3QAAAACAAAAAAAAAAZhdXRob3IAAAAAABMAAAAAAAAABnBhcmFtcwAAAAAH0AAAAA1QdWJsaXNoUGFyYW1zAAAAAAAAAQAAA+kAAAAEAAAAAw==",
        "AAAAAAAAADZVcGRhdGUgbWV0YWRhdGEgZm9yIGFuIGV4aXN0aW5nIGNvbnRyYWN0IChhdXRob3Igb25seSkAAAAAAA91cGRhdGVfbWV0YWRhdGEAAAAABAAAAAAAAAALY29udHJhY3RfaWQAAAAABAAAAAAAAAALZGVzY3JpcHRpb24AAAAD6AAAABAAAAAAAAAAEWRvY3VtZW50YXRpb25fdXJsAAAAAAAD6AAAABAAAAAAAAAABHRhZ3MAAAPoAAAD6gAAABAAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAACRHZXQgbWV0YWRhdGEgZm9yIGEgc3BlY2lmaWMgY29udHJhY3QAAAAMZ2V0X2NvbnRyYWN0AAAAAQAAAAAAAAALY29udHJhY3RfaWQAAAAABAAAAAEAAAPpAAAH0AAAABBDb250cmFjdE1ldGFkYXRhAAAAAw==",
        "AAAAAAAAABtHZXQgYWxsIHB1Ymxpc2hlZCBjb250cmFjdHMAAAAAEWdldF9hbGxfY29udHJhY3RzAAAAAAAAAAAAAAEAAAPqAAAH0AAAABBDb250cmFjdE1ldGFkYXRh",
        "AAAAAAAAABxTZWFyY2ggY29udHJhY3RzIGJ5IGNhdGVnb3J5AAAAEnNlYXJjaF9ieV9jYXRlZ29yeQAAAAAAAQAAAAAAAAAIY2F0ZWdvcnkAAAfQAAAACENhdGVnb3J5AAAAAQAAA+oAAAfQAAAAEENvbnRyYWN0TWV0YWRhdGE=",
        "AAAAAAAAABdTZWFyY2ggY29udHJhY3RzIGJ5IHRhZwAAAAANc2VhcmNoX2J5X3RhZwAAAAAAAAEAAAAAAAAAA3RhZwAAAAAQAAAAAQAAA+oAAAfQAAAAEENvbnRyYWN0TWV0YWRhdGE=",
        "AAAAAAAAAEpWZXJpZnkgYSBjb250cmFjdCAoYXVkaXRvcnMgb25seSAtIGZvciBNVlAsIGFueW9uZSBjYW4gdmVyaWZ5IGZvciB0ZXN0aW5nKQAAAAAAD3ZlcmlmeV9jb250cmFjdAAAAAACAAAAAAAAAAtjb250cmFjdF9pZAAAAAAEAAAAAAAAAAdhdWRpdG9yAAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAADhJbmNyZW1lbnQgZGVwbG95bWVudCBjb3VudCAoY2FsbGVkIGJ5IERlcGxveW1lbnRNYW5hZ2VyKQAAABppbmNyZW1lbnRfZGVwbG95bWVudF9jb3VudAAAAAAAAQAAAAAAAAALY29udHJhY3RfaWQAAAAABAAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAB1HZXQgdG90YWwgbnVtYmVyIG9mIGNvbnRyYWN0cwAAAAAAABJnZXRfY29udHJhY3RfY291bnQAAAAAAAAAAAABAAAABA==",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    publish_contract: this.txFromJSON<Result<u32>>,
    update_metadata: this.txFromJSON<Result<void>>,
    get_contract: this.txFromJSON<Result<ContractMetadata>>,
    get_all_contracts: this.txFromJSON<Array<ContractMetadata>>,
    search_by_category: this.txFromJSON<Array<ContractMetadata>>,
    search_by_tag: this.txFromJSON<Array<ContractMetadata>>,
    verify_contract: this.txFromJSON<Result<void>>,
    increment_deployment_count: this.txFromJSON<Result<void>>,
    get_contract_count: this.txFromJSON<u32>,
  };
}
