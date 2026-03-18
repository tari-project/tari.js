export function toHexStr(uint8: Uint8Array): string {
  return Buffer.from(uint8).toString("hex");
}
