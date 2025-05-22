import { WorkspaceArg } from "@tari-project/tarijs-types";

/**
 *
 * @param key workspace name
 * @returns encoded Uint8Array value
 * @example
 * key: "0"   -> [ 48 ]
 * key: "0.0" -> [ 48, 46, 48 ]
 * key: "0.1" -> [ 48, 46, 49 ]
 *
 * key: "bucket"   -> "6275636b6574"
 * key: "bucket.0" -> "6275636b65742e30"
 * key: "bucket.1" -> "6275636b65742e31"
 */
export function toWorkspace(key: string): string {
  return Buffer.from(key).toString("hex");
}

/**
 *
 * @param key workspace name
 * @returns formatted Workspace data
 * @example
 * key: "bucket" -> { Workspace: "6275636b6574" }
 */
export function fromWorkspace(key: string): WorkspaceArg {
  return { Workspace: Buffer.from(key).toString("hex") };
}
