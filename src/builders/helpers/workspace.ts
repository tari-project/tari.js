import { WorkspaceArg } from "../types";

/**
 *
 * @param key workspace name
 * @returns encoded Uint8Array value
 * @example
 * key: "0"   -> [ 48 ]
 * key: "0.0" -> [ 48, 46, 48 ]
 * key: "0.1" -> [ 48, 46, 49 ]
 *
 * key: "bucket"   -> [ 98, 117, 99, 107, 101, 116 ]
 * key: "bucket.0" -> [ 98, 117, 99, 107, 101, 116, 46, 48 ]
 * key: "bucket.1" -> [ 98, 117, 99, 107, 101, 116, 46, 49 ]
 */
export function toWorkspace(key: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(key);
}

/**
 *
 * @param key workspace name
 * @returns formatted Workspace data
 * @example
 * key: "bucket" -> { Workspace: [ 98, 117, 99, 107, 101, 116 ] }
 */
export function fromWorkspace(key: string): WorkspaceArg {
  const encoder = new TextEncoder();
  const encodedKey = encoder.encode(key);
  return { Workspace: encodedKey };
}
