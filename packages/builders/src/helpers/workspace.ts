import { TransactionArg, WorkspaceArg } from "@tari-project/tarijs-types";

/**
 * A parsed workspace key string into an object with name and optional offset.
 * Examples:
 * "bucket"   -> { name: "bucket", offset: undefined }
 * "bucket.0" -> { name: "bucket", offset: 0 }
 */
export interface ParsedBuildersWorkspaceKey {
  name: string;
  offset?: number;
}

/**
 *
 * @param key workspace name. Offsets can be specified with a dot notation, e.g. "bucket.0"
 * @returns Parsed workspace key object
 * @example
 * key: "bucket"   -> { name: "bucket", offset: undefined }
 * key: "bucket.0" -> { name: "bucket", offset: 0 }
 * key: "bucket.1" -> { name: "bucket", offset: 1 }
 */
export function parseWorkspaceStringKey(key: string): ParsedBuildersWorkspaceKey {
  const parts = key.split(".");
  if (parts.length > 2) {
    throw new Error("Invalid workspace key format. Only one dot is allowed.");
  }
  const name = parts[0];
  const offset = parts[1] ? parseInt(parts[1], 10) : undefined;

  return {
    name,
    offset,
  };
}

/**
 * Either a literal Transaction Arg or a named workspace argument.
 * Named workspace arguments are used to refer to a workspace by name,
 * and are converted to numeric IDs by the TransactionBuilder.
 */
export type NamedArg = { Workspace: string } | TransactionArg;