import { NonFungibleId, NonFungibleToken, ResourceAddress } from "@tari-project/typescript-bindings";
import { TransactionStatus } from "../TransactionStatus";
export {
  substateIdToString,
  stringToSubstateId,
  shortenSubstateId,
  shortenString,
  rejectReasonToString,
  getSubstateDiffFromTransactionResult,
  getRejectReasonFromTransactionResult,
  jrpcPermissionToString,
} from "@tari-project/typescript-bindings";

export function convertStringToTransactionStatus(status: string): TransactionStatus {
  switch (status) {
    case "New":
      return TransactionStatus.New;
    case "DryRun":
      return TransactionStatus.DryRun;
    case "Pending":
      return TransactionStatus.Pending;
    case "Accepted":
      return TransactionStatus.Accepted;
    case "Rejected":
      return TransactionStatus.Rejected;
    case "InvalidTransaction":
      return TransactionStatus.InvalidTransaction;
    case "OnlyFeeAccepted":
      return TransactionStatus.OnlyFeeAccepted;
    default:
      throw new Error(`Unknown status: ${status}`);
  }
}

// Function to create the Nft address
// address format: nft_RESOURCEADDR_uuid_TOKENID
export function createNftAddressFromToken(token: NonFungibleToken): string {
  return createNftAddressFromResource(token.resource_address, token.nft_id);
}

export function convertU256ToHexString(id: NonFungibleId): string {
  if ("U256" in id && Array.isArray(id.U256)) {
    return id.U256.map((num) => num.toString(16).padStart(2, "0")).join("");
  }
  return "";
}

export function convertHexStringToU256Array(hexString: string): number[] {
  const cleanHexString = hexString.replace(/[^0-9a-fA-F]/g, "");
  const u256Array: number[] = [];

  for (let i = 0; i < cleanHexString.length; i += 2) {
    const hexPair = cleanHexString.slice(i, i + 2);
    u256Array.push(parseInt(hexPair, 16));
  }

  return u256Array;
}

export function createNftAddressFromResource(address: ResourceAddress, tokenId: NonFungibleId): string {
  let nftAddress = "nft_";
  const resourceAddress = address.replace(/^resource_/, "");
  nftAddress += resourceAddress;
  nftAddress += "_uuid_";
  const nftIdHexString = convertU256ToHexString(tokenId);
  nftAddress += nftIdHexString;

  return nftAddress;
}
