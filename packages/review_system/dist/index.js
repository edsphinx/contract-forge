import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CC3RZKTDLNYCXCALT6CA4IMGZLAOQE7ZABXGVRKFRUPUNNMKYRL7OMFW",
    }
};
export const Errors = {
    1: { message: "InvalidRating" },
    2: { message: "AlreadyReviewed" },
    3: { message: "ReviewNotFound" },
    4: { message: "EmptyComment" },
    5: { message: "CommentTooLong" },
    6: { message: "UnauthorizedAction" },
    7: { message: "AlreadyVoted" },
    8: { message: "CannotReviewOwnContract" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAABlJldmlldwAAAAAABwAAAAAAAAAHY29tbWVudAAAAAAQAAAAAAAAAAtjb250cmFjdF9pZAAAAAAEAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAZyYXRpbmcAAAAAAAQAAAAAAAAACXJldmlld19pZAAAAAAAAAQAAAAAAAAACHJldmlld2VyAAAAEwAAAAAAAAAHdXB2b3RlcwAAAAAE",
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
            "AAAAAAAAABtHZXQgdG90YWwgbnVtYmVyIG9mIHJldmlld3MAAAAAEGdldF9yZXZpZXdfY291bnQAAAAAAAAAAQAAAAQ="]), options);
        this.options = options;
    }
    fromJSON = {
        submit_review: (this.txFromJSON),
        upvote_review: (this.txFromJSON),
        get_review: (this.txFromJSON),
        get_reviews_for_contract: (this.txFromJSON),
        get_reviews_by_user: (this.txFromJSON),
        get_review_summary: (this.txFromJSON),
        get_review_count: (this.txFromJSON)
    };
}
