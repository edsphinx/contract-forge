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
    contractId: "CDPEFPPNJTF6DHRWQVHB7OB22GAQIKQVJOFOTOLLOEPHXBXEW3ZNPK5N",
  },
} as const;

export interface DeploymentRecord {
  contract_id: u32;
  deployed_at: u64;
  deployed_contract_address: string;
  deployer: string;
  deployment_id: u32;
  salt: Buffer;
  wasm_hash: Buffer;
}

export const Errors = {
  1: { message: "ContractNotFound" },
  2: { message: "DeploymentFailed" },
  3: { message: "InvalidParameters" },
  4: { message: "InvalidWasmHash" },
  5: { message: "UnauthorizedAccess" },
};

export interface Client {
  /**
   * Construct and simulate a deploy_with_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deploy a contract with an admin address constructor parameter
   * This is a convenience method for the common pattern of contracts with admin initialization
   */
  deploy_with_admin: (
    {
      contract_id,
      deployer,
      wasm_hash,
      salt,
      admin,
    }: {
      contract_id: u32;
      deployer: string;
      wasm_hash: Buffer;
      salt: Buffer;
      admin: string;
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
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Construct and simulate a deploy_from_wasm transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deploy a contract from the registry
   * This deploys a new contract instance on-chain from the WASM hash
   * init_args: Constructor arguments for the contract (empty vec if no constructor)
   */
  deploy_from_wasm: (
    {
      contract_id,
      deployer,
      wasm_hash,
      salt,
      init_args,
    }: {
      contract_id: u32;
      deployer: string;
      wasm_hash: Buffer;
      salt: Buffer;
      init_args: Array<any>;
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
  ) => Promise<AssembledTransaction<Result<u32>>>;

  /**
   * Construct and simulate a get_deployment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get a specific deployment record
   */
  get_deployment: (
    { deployment_id }: { deployment_id: u32 },
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
  ) => Promise<AssembledTransaction<Result<DeploymentRecord>>>;

  /**
   * Construct and simulate a get_deployment_history transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get deployment history for a specific deployer
   */
  get_deployment_history: (
    { deployer }: { deployer: string },
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
  ) => Promise<AssembledTransaction<Array<DeploymentRecord>>>;

  /**
   * Construct and simulate a get_contract_deployments transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all deployments of a specific contract
   */
  get_contract_deployments: (
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
  ) => Promise<AssembledTransaction<Array<DeploymentRecord>>>;

  /**
   * Construct and simulate a get_all_deployments transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all deployment records
   */
  get_all_deployments: (options?: {
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
  }) => Promise<AssembledTransaction<Array<DeploymentRecord>>>;

  /**
   * Construct and simulate a get_total_deployments transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total number of deployments
   */
  get_total_deployments: (options?: {
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
        "AAAAAQAAAAAAAAAAAAAAEERlcGxveW1lbnRSZWNvcmQAAAAHAAAAAAAAAAtjb250cmFjdF9pZAAAAAAEAAAAAAAAAAtkZXBsb3llZF9hdAAAAAAGAAAAAAAAABlkZXBsb3llZF9jb250cmFjdF9hZGRyZXNzAAAAAAAAEwAAAAAAAAAIZGVwbG95ZXIAAAATAAAAAAAAAA1kZXBsb3ltZW50X2lkAAAAAAAABAAAAAAAAAAEc2FsdAAAA+4AAAAgAAAAAAAAAAl3YXNtX2hhc2gAAAAAAAPuAAAAIA==",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABQAAAAAAAAAQQ29udHJhY3ROb3RGb3VuZAAAAAEAAAAAAAAAEERlcGxveW1lbnRGYWlsZWQAAAACAAAAAAAAABFJbnZhbGlkUGFyYW1ldGVycwAAAAAAAAMAAAAAAAAAD0ludmFsaWRXYXNtSGFzaAAAAAAEAAAAAAAAABJVbmF1dGhvcml6ZWRBY2Nlc3MAAAAAAAU=",
        "AAAABQAAAAAAAAAAAAAADURlcGxveWVkRXZlbnQAAAAAAAABAAAADmRlcGxveWVkX2V2ZW50AAAAAAACAAAAAAAAAA1kZXBsb3ltZW50X2lkAAAAAAAABAAAAAAAAAAAAAAAEGRlcGxveWVkX2FkZHJlc3MAAAATAAAAAAAAAAI=",
        "AAAAAAAAAJhEZXBsb3kgYSBjb250cmFjdCB3aXRoIGFuIGFkbWluIGFkZHJlc3MgY29uc3RydWN0b3IgcGFyYW1ldGVyClRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIHRoZSBjb21tb24gcGF0dGVybiBvZiBjb250cmFjdHMgd2l0aCBhZG1pbiBpbml0aWFsaXphdGlvbgAAABFkZXBsb3lfd2l0aF9hZG1pbgAAAAAAAAUAAAAAAAAAC2NvbnRyYWN0X2lkAAAAAAQAAAAAAAAACGRlcGxveWVyAAAAEwAAAAAAAAAJd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAAAAAABHNhbHQAAAPuAAAAIAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+kAAAAEAAAAAw==",
        "AAAAAAAAALREZXBsb3kgYSBjb250cmFjdCBmcm9tIHRoZSByZWdpc3RyeQpUaGlzIGRlcGxveXMgYSBuZXcgY29udHJhY3QgaW5zdGFuY2Ugb24tY2hhaW4gZnJvbSB0aGUgV0FTTSBoYXNoCmluaXRfYXJnczogQ29uc3RydWN0b3IgYXJndW1lbnRzIGZvciB0aGUgY29udHJhY3QgKGVtcHR5IHZlYyBpZiBubyBjb25zdHJ1Y3RvcikAAAAQZGVwbG95X2Zyb21fd2FzbQAAAAUAAAAAAAAAC2NvbnRyYWN0X2lkAAAAAAQAAAAAAAAACGRlcGxveWVyAAAAEwAAAAAAAAAJd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAAAAAABHNhbHQAAAPuAAAAIAAAAAAAAAAJaW5pdF9hcmdzAAAAAAAD6gAAAAAAAAABAAAD6QAAAAQAAAAD",
        "AAAAAAAAACBHZXQgYSBzcGVjaWZpYyBkZXBsb3ltZW50IHJlY29yZAAAAA5nZXRfZGVwbG95bWVudAAAAAAAAQAAAAAAAAANZGVwbG95bWVudF9pZAAAAAAAAAQAAAABAAAD6QAAB9AAAAAQRGVwbG95bWVudFJlY29yZAAAAAM=",
        "AAAAAAAAAC5HZXQgZGVwbG95bWVudCBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGRlcGxveWVyAAAAAAAWZ2V0X2RlcGxveW1lbnRfaGlzdG9yeQAAAAAAAQAAAAAAAAAIZGVwbG95ZXIAAAATAAAAAQAAA+oAAAfQAAAAEERlcGxveW1lbnRSZWNvcmQ=",
        "AAAAAAAAACpHZXQgYWxsIGRlcGxveW1lbnRzIG9mIGEgc3BlY2lmaWMgY29udHJhY3QAAAAAABhnZXRfY29udHJhY3RfZGVwbG95bWVudHMAAAABAAAAAAAAAAtjb250cmFjdF9pZAAAAAAEAAAAAQAAA+oAAAfQAAAAEERlcGxveW1lbnRSZWNvcmQ=",
        "AAAAAAAAABpHZXQgYWxsIGRlcGxveW1lbnQgcmVjb3JkcwAAAAAAE2dldF9hbGxfZGVwbG95bWVudHMAAAAAAAAAAAEAAAPqAAAH0AAAABBEZXBsb3ltZW50UmVjb3Jk",
        "AAAAAAAAAB9HZXQgdG90YWwgbnVtYmVyIG9mIGRlcGxveW1lbnRzAAAAABVnZXRfdG90YWxfZGVwbG95bWVudHMAAAAAAAAAAAAAAQAAAAQ=",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    deploy_with_admin: this.txFromJSON<Result<u32>>,
    deploy_from_wasm: this.txFromJSON<Result<u32>>,
    get_deployment: this.txFromJSON<Result<DeploymentRecord>>,
    get_deployment_history: this.txFromJSON<Array<DeploymentRecord>>,
    get_contract_deployments: this.txFromJSON<Array<DeploymentRecord>>,
    get_all_deployments: this.txFromJSON<Array<DeploymentRecord>>,
    get_total_deployments: this.txFromJSON<u32>,
  };
}
