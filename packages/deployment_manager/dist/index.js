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
        contractId: "CDPEFPPNJTF6DHRWQVHB7OB22GAQIKQVJOFOTOLLOEPHXBXEW3ZNPK5N",
    }
};
export const Errors = {
    1: { message: "ContractNotFound" },
    2: { message: "DeploymentFailed" },
    3: { message: "InvalidParameters" },
    4: { message: "InvalidWasmHash" },
    5: { message: "UnauthorizedAccess" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAAEERlcGxveW1lbnRSZWNvcmQAAAAHAAAAAAAAAAtjb250cmFjdF9pZAAAAAAEAAAAAAAAAAtkZXBsb3llZF9hdAAAAAAGAAAAAAAAABlkZXBsb3llZF9jb250cmFjdF9hZGRyZXNzAAAAAAAAEwAAAAAAAAAIZGVwbG95ZXIAAAATAAAAAAAAAA1kZXBsb3ltZW50X2lkAAAAAAAABAAAAAAAAAAEc2FsdAAAA+4AAAAgAAAAAAAAAAl3YXNtX2hhc2gAAAAAAAPuAAAAIA==",
            "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABQAAAAAAAAAQQ29udHJhY3ROb3RGb3VuZAAAAAEAAAAAAAAAEERlcGxveW1lbnRGYWlsZWQAAAACAAAAAAAAABFJbnZhbGlkUGFyYW1ldGVycwAAAAAAAAMAAAAAAAAAD0ludmFsaWRXYXNtSGFzaAAAAAAEAAAAAAAAABJVbmF1dGhvcml6ZWRBY2Nlc3MAAAAAAAU=",
            "AAAABQAAAAAAAAAAAAAADURlcGxveWVkRXZlbnQAAAAAAAABAAAADmRlcGxveWVkX2V2ZW50AAAAAAACAAAAAAAAAA1kZXBsb3ltZW50X2lkAAAAAAAABAAAAAAAAAAAAAAAEGRlcGxveWVkX2FkZHJlc3MAAAATAAAAAAAAAAI=",
            "AAAAAAAAAJhEZXBsb3kgYSBjb250cmFjdCB3aXRoIGFuIGFkbWluIGFkZHJlc3MgY29uc3RydWN0b3IgcGFyYW1ldGVyClRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIHRoZSBjb21tb24gcGF0dGVybiBvZiBjb250cmFjdHMgd2l0aCBhZG1pbiBpbml0aWFsaXphdGlvbgAAABFkZXBsb3lfd2l0aF9hZG1pbgAAAAAAAAUAAAAAAAAAC2NvbnRyYWN0X2lkAAAAAAQAAAAAAAAACGRlcGxveWVyAAAAEwAAAAAAAAAJd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAAAAAABHNhbHQAAAPuAAAAIAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+kAAAAEAAAAAw==",
            "AAAAAAAAALREZXBsb3kgYSBjb250cmFjdCBmcm9tIHRoZSByZWdpc3RyeQpUaGlzIGRlcGxveXMgYSBuZXcgY29udHJhY3QgaW5zdGFuY2Ugb24tY2hhaW4gZnJvbSB0aGUgV0FTTSBoYXNoCmluaXRfYXJnczogQ29uc3RydWN0b3IgYXJndW1lbnRzIGZvciB0aGUgY29udHJhY3QgKGVtcHR5IHZlYyBpZiBubyBjb25zdHJ1Y3RvcikAAAAQZGVwbG95X2Zyb21fd2FzbQAAAAUAAAAAAAAAC2NvbnRyYWN0X2lkAAAAAAQAAAAAAAAACGRlcGxveWVyAAAAEwAAAAAAAAAJd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAAAAAABHNhbHQAAAPuAAAAIAAAAAAAAAAJaW5pdF9hcmdzAAAAAAAD6gAAAAAAAAABAAAD6QAAAAQAAAAD",
            "AAAAAAAAACBHZXQgYSBzcGVjaWZpYyBkZXBsb3ltZW50IHJlY29yZAAAAA5nZXRfZGVwbG95bWVudAAAAAAAAQAAAAAAAAANZGVwbG95bWVudF9pZAAAAAAAAAQAAAABAAAD6QAAB9AAAAAQRGVwbG95bWVudFJlY29yZAAAAAM=",
            "AAAAAAAAAC5HZXQgZGVwbG95bWVudCBoaXN0b3J5IGZvciBhIHNwZWNpZmljIGRlcGxveWVyAAAAAAAWZ2V0X2RlcGxveW1lbnRfaGlzdG9yeQAAAAAAAQAAAAAAAAAIZGVwbG95ZXIAAAATAAAAAQAAA+oAAAfQAAAAEERlcGxveW1lbnRSZWNvcmQ=",
            "AAAAAAAAACpHZXQgYWxsIGRlcGxveW1lbnRzIG9mIGEgc3BlY2lmaWMgY29udHJhY3QAAAAAABhnZXRfY29udHJhY3RfZGVwbG95bWVudHMAAAABAAAAAAAAAAtjb250cmFjdF9pZAAAAAAEAAAAAQAAA+oAAAfQAAAAEERlcGxveW1lbnRSZWNvcmQ=",
            "AAAAAAAAABpHZXQgYWxsIGRlcGxveW1lbnQgcmVjb3JkcwAAAAAAE2dldF9hbGxfZGVwbG95bWVudHMAAAAAAAAAAAEAAAPqAAAH0AAAABBEZXBsb3ltZW50UmVjb3Jk",
            "AAAAAAAAAB9HZXQgdG90YWwgbnVtYmVyIG9mIGRlcGxveW1lbnRzAAAAABVnZXRfdG90YWxfZGVwbG95bWVudHMAAAAAAAAAAAAAAQAAAAQ="]), options);
        this.options = options;
    }
    fromJSON = {
        deploy_with_admin: (this.txFromJSON),
        deploy_from_wasm: (this.txFromJSON),
        get_deployment: (this.txFromJSON),
        get_deployment_history: (this.txFromJSON),
        get_contract_deployments: (this.txFromJSON),
        get_all_deployments: (this.txFromJSON),
        get_total_deployments: (this.txFromJSON)
    };
}
