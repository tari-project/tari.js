//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

/**
 * A parsed workspace key string into an object with name and optional offset.
 *
 * Examples:
 *   "bucket"   -> { name: "bucket", offset: null }
 *   "bucket.0" -> { name: "bucket", offset: 0 }
 */
export interface ParsedWorkspaceKey {
  name: string;
  offset: number | null;
}

/**
 * Parses a workspace key string, supporting dot-notation offsets.
 *
 * @example
 *   parseWorkspaceStringKey("bucket")   // { name: "bucket", offset: null }
 *   parseWorkspaceStringKey("bucket.0") // { name: "bucket", offset: 0 }
 *   parseWorkspaceStringKey("bucket.1") // { name: "bucket", offset: 1 }
 */
export function parseWorkspaceStringKey(key: string): ParsedWorkspaceKey {
  const parts = key.split(".");
  if (parts.length > 2) {
    throw new Error("Invalid workspace key format. Only one dot is allowed.");
  }
  const name = parts[0];
  const offset = parts[1] !== undefined ? parseInt(parts[1], 10) : null;
  return { name, offset };
}

