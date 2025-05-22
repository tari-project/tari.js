import { WorkspaceArg } from "@tari-project/tarijs-types";

/**
 *
 * @param key workspace name
 * @returns encoded hex value
 * @example
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
