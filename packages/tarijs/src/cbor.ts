export type CborValue =
  | { Map: Array<[CborValue, CborValue]> }
  | { Array: CborValue[] }
  | { Tag: [BinaryTag, CborValue] }
  | { Bool: boolean }
  | { Bytes: number[] }
  | { Text: string }
  | { Float: number }
  | { Integer: number }
  | "Null";

export function parseCbor(value: CborValue): unknown {
  if (typeof value === "string") {
    if (value === "Null") {
      return null;
    }
    throw new Error("Unknown CBOR value type");
  }
  if ("Map" in value) {
    return Object.fromEntries(value.Map.map(([k, v]) => [parseCbor(k), parseCbor(v)]));
  } else if ("Array" in value) {
    return value.Array.map(parseCbor);
  } else if ("Tag" in value) {
    const [type, data] = value.Tag;
    return convertTaggedValue(type, data);
  } else if ("Bool" in value) {
    return value.Bool;
  } else if ("Bytes" in value) {
    return new Uint8Array(value.Bytes);
  } else if ("Text" in value) {
    return value.Text;
  } else if ("Float" in value) {
    return value.Float;
  } else if ("Integer" in value) {
    return value.Integer;
  }
  throw new Error("Unknown CBOR value type");
}

export function getCborValueByPath(cborRepr: CborValue | null, path: string): unknown {
  if (!cborRepr) {
    return null;
  }
  let value = cborRepr;
  for (const part of path.split(".")) {
    if (part == "$") {
      continue;
    }
    if (typeof value !== "object") {
      return null;
    }
    if ("Map" in value) {
      const mapEntry = value.Map.find((v) => parseCbor(v[0]) === part)?.[1];
      if (mapEntry) {
        value = mapEntry;
        continue;
      } else {
        return null;
      }
    }

    if ("Array" in value) {
      value = value.Array[parseInt(part)];
      continue;
    }

    return null;
  }
  return parseCbor(value);
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export enum BinaryTag {
  ComponentAddress = 128,
  Metadata = 129,
  NonFungibleAddress = 130,
  ResourceAddress = 131,
  VaultId = 132,
  BucketId = 133,
  TransactionReceipt = 134,
  ProofId = 135,
  UnclaimedConfidentialOutputAddress = 136,
  TemplateAddress = 137,
  ValidatorNodeFeePool = 138,
}

const BINARY_TAG_KEYS = new Map<BinaryTag, string>([
  [BinaryTag.ComponentAddress, "component"],
  [BinaryTag.Metadata, "metadata"],
  [BinaryTag.NonFungibleAddress, "nft"],
  [BinaryTag.ResourceAddress, "resource"],
  [BinaryTag.VaultId, "vault"],
  [BinaryTag.BucketId, "bucket"],
  [BinaryTag.TransactionReceipt, "transaction-receipt"],
  [BinaryTag.ProofId, "proof"],
  [BinaryTag.UnclaimedConfidentialOutputAddress, "unclaimed-confidential-output-address"],
  [BinaryTag.TemplateAddress, "template-address"],
  [BinaryTag.ValidatorNodeFeePool, "validator-node-fee-pool"],
]);

export function convertTaggedValue(type: number, value: CborValue): string | unknown {
  const tag = BINARY_TAG_KEYS.get(type) ?? "unknown";
  const decoded = parseCbor(value);
  return decoded instanceof Uint8Array ? `${tag}_${uint8ArrayToHex(decoded)}` : [tag, decoded];
}
