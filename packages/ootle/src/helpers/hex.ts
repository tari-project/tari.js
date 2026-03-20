// TODO - this can be removed when typescript v6 comes out
export function toHexStr(uint8: Uint8Array): string {
  return Array.from(uint8, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function fromHexStr(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
