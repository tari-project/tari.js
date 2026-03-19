// TODO - this can be removed when typescript v6 comes out
export function toHexStr(uint8: Uint8Array): string {
  return Array.from(uint8, (b) => b.toString(16).padStart(2, "0")).join("");
}
