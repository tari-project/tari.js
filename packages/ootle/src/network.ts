//   Copyright 2024 The Tari Project
//   SPDX-License-Identifier: BSD-3-Clause

/**
 * Tari network identifiers. Values match the Rust `Network` byte representation.
 */
export enum Network {
  MainNet = 0x00,
  StageNet = 0x01,
  NextNet = 0x02,
  LocalNet = 0x10,
  Igor = 0x24,
  Esmeralda = 0x26,
}
