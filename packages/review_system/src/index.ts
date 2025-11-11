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
    contractId: "CC3RZKTDLNYCXCALT6CA4IMGZLAOQE7ZABXGVRKFRUPUNNMKYRL7OMFW",
  },
} as const;

export interface Review {
  comment: string;
  contract_id: u32;
  created_at: u64;
  rating: u32;
  review_id: u32;
  reviewer: string;
  upvotes: u32;
}

export interface ReviewSummary {
  average_rating: u32;
  contract_id: u32;
  rating_distribution: Array<u32>;
  total_reviews: u32;
}

export const Errors = {
  1: { message: "InvalidRating" },
  2: { message: "AlreadyReviewed" },
  3: { message: "ReviewNotFound" },
  4: { message: "EmptyComment" },
  5: { message: "CommentTooLong" },
  6: { message: "UnauthorizedAction" },
  7: { message: "AlreadyVoted" },
  8: { message: "CannotReviewOwnContract" },
};

export interface Client {
  /**
   * Construct and simulate a submit_review transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Submit a new review for a contract
   */
  submit_review: (
    {
      contract_id,
      reviewer,
      rating,
      comment,
    }: { contract_id: u32; reviewer: string; rating: u32; comment: string },
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
   * Construct and simulate a upvote_review transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Upvote a helpful review
   */
  upvote_review: (
    { review_id, voter }: { review_id: u32; voter: string },
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
   * Construct and simulate a get_review transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get a specific review
   */
  get_review: (
    { review_id }: { review_id: u32 },
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
  ) => Promise<AssembledTransaction<Result<Review>>>;

  /**
   * Construct and simulate a get_reviews_for_contract transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all reviews for a contract
   */
  get_reviews_for_contract: (
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
  ) => Promise<AssembledTransaction<Array<Review>>>;

  /**
   * Construct and simulate a get_reviews_by_user transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all reviews by a specific user
   */
  get_reviews_by_user: (
    { reviewer }: { reviewer: string },
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
  ) => Promise<AssembledTransaction<Array<Review>>>;

  /**
   * Construct and simulate a get_review_summary transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get review summary (aggregate statistics) for a contract
   */
  get_review_summary: (
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
  ) => Promise<AssembledTransaction<ReviewSummary>>;

  /**
   * Construct and simulate a get_review_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total number of reviews
   */
  get_review_count: (options?: {
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
        "AAAAAQAAAAAAAAAAAAAABlJldmlldwAAAAAABwAAAAAAAAAHY29tbWVudAAAAAAQAAAAAAAAAAtjb250cmFjdF9pZAAAAAAEAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAZyYXRpbmcAAAAAAAQAAAAAAAAACXJldmlld19pZAAAAAAAAAQAAAAAAAAACHJldmlld2VyAAAAEwAAAAAAAAAHdXB2b3RlcwAAAAAE",
        "AAAAAQAAAAAAAAAAAAAADVJldmlld1N1bW1hcnkAAAAAAAAEAAAAAAAAAA5hdmVyYWdlX3JhdGluZwAAAAAABAAAAAAAAAALY29udHJhY3RfaWQAAAAABAAAAAAAAAATcmF0aW5nX2Rpc3RyaWJ1dGlvbgAAAAPqAAAABAAAAAAAAAANdG90YWxfcmV2aWV3cwAAAAAAAAQ=",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAANSW52YWxpZFJhdGluZwAAAAAAAAEAAAAAAAAAD0FscmVhZHlSZXZpZXdlZAAAAAACAAAAAAAAAA5SZXZpZXdOb3RGb3VuZAAAAAAAAwAAAAAAAAAMRW1wdHlDb21tZW50AAAABAAAAAAAAAAOQ29tbWVudFRvb0xvbmcAAAAAAAUAAAAAAAAAElVuYXV0aG9yaXplZEFjdGlvbgAAAAAABgAAAAAAAAAMQWxyZWFkeVZvdGVkAAAABwAAAAAAAAAXQ2Fubm90UmV2aWV3T3duQ29udHJhY3QAAAAACA==",
        "AAAABQAAAAAAAAAAAAAACFJldmlld2VkAAAAAQAAAAhyZXZpZXdlZAAAAAMAAAAAAAAACXJldmlld19pZAAAAAAAAAQAAAAAAAAAAAAAAAtjb250cmFjdF9pZAAAAAAEAAAAAAAAAAAAAAAGcmF0aW5nAAAAAAAEAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAB1Vwdm90ZWQAAAAAAQAAAAd1cHZvdGVkAAAAAAIAAAAAAAAACXJldmlld19pZAAAAAAAAAQAAAAAAAAAAAAAAAV2b3RlcgAAAAAAABMAAAAAAAAAAg==",
        "AAAAAAAAACJTdWJtaXQgYSBuZXcgcmV2aWV3IGZvciBhIGNvbnRyYWN0AAAAAAANc3VibWl0X3JldmlldwAAAAAAAAQAAAAAAAAAC2NvbnRyYWN0X2lkAAAAAAQAAAAAAAAACHJldmlld2VyAAAAEwAAAAAAAAAGcmF0aW5nAAAAAAAEAAAAAAAAAAdjb21tZW50AAAAABAAAAABAAAD6QAAAAQAAAAD",
        "AAAAAAAAABdVcHZvdGUgYSBoZWxwZnVsIHJldmlldwAAAAANdXB2b3RlX3JldmlldwAAAAAAAAIAAAAAAAAACXJldmlld19pZAAAAAAAAAQAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAABVHZXQgYSBzcGVjaWZpYyByZXZpZXcAAAAAAAAKZ2V0X3JldmlldwAAAAAAAQAAAAAAAAAJcmV2aWV3X2lkAAAAAAAABAAAAAEAAAPpAAAH0AAAAAZSZXZpZXcAAAAAAAM=",
        "AAAAAAAAAB5HZXQgYWxsIHJldmlld3MgZm9yIGEgY29udHJhY3QAAAAAABhnZXRfcmV2aWV3c19mb3JfY29udHJhY3QAAAABAAAAAAAAAAtjb250cmFjdF9pZAAAAAAEAAAAAQAAA+oAAAfQAAAABlJldmlldwAA",
        "AAAAAAAAACJHZXQgYWxsIHJldmlld3MgYnkgYSBzcGVjaWZpYyB1c2VyAAAAAAATZ2V0X3Jldmlld3NfYnlfdXNlcgAAAAABAAAAAAAAAAhyZXZpZXdlcgAAABMAAAABAAAD6gAAB9AAAAAGUmV2aWV3AAA=",
        "AAAAAAAAADhHZXQgcmV2aWV3IHN1bW1hcnkgKGFnZ3JlZ2F0ZSBzdGF0aXN0aWNzKSBmb3IgYSBjb250cmFjdAAAABJnZXRfcmV2aWV3X3N1bW1hcnkAAAAAAAEAAAAAAAAAC2NvbnRyYWN0X2lkAAAAAAQAAAABAAAH0AAAAA1SZXZpZXdTdW1tYXJ5AAAA",
        "AAAAAAAAABtHZXQgdG90YWwgbnVtYmVyIG9mIHJldmlld3MAAAAAEGdldF9yZXZpZXdfY291bnQAAAAAAAAAAQAAAAQ=",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    submit_review: this.txFromJSON<Result<u32>>,
    upvote_review: this.txFromJSON<Result<void>>,
    get_review: this.txFromJSON<Result<Review>>,
    get_reviews_for_contract: this.txFromJSON<Array<Review>>,
    get_reviews_by_user: this.txFromJSON<Array<Review>>,
    get_review_summary: this.txFromJSON<ReviewSummary>,
    get_review_count: this.txFromJSON<u32>,
  };
}
