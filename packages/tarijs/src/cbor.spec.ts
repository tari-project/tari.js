import { assert, describe, expect, it, vi } from "vitest";
import { BinaryTag, CborValue, convertTaggedValue, getCborValueByPath, parseCbor } from "./cbor";

describe("convertTaggedValue", () => {
  it.each([
    {
      tag: BinaryTag.VaultId,
      value: { Bytes: [1, 2, 3, 4, 255] },
      expected: "vault_01020304ff",
    },
    {
      tag: BinaryTag.ComponentAddress,
      value: { Bytes: [1, 2, 3, 4, 255] },
      expected: "component_01020304ff",
    },
    {
      tag: BinaryTag.ResourceAddress,
      value: { Bytes: [1, 2, 3, 4, 255] },
      expected: "resource_01020304ff",
    },
  ])("converts tags with bytes into a string representation", ({ tag, value, expected }) => {
    expect(convertTaggedValue(tag, value)).toEqual(expected);
  });

  it.each([
    {
      tag: BinaryTag.Metadata,
      value: { Array: [{ Text: "One" }, { Text: "Two" }] },
      expected: ["metadata", ["One", "Two"]],
    },
    {
      tag: BinaryTag.Metadata,
      value: {
        Map: [
          [{ Text: "key1" }, { Integer: 5 }],
          [{ Text: "key2" }, { Integer: 3 }],
        ],
      },
      expected: ["metadata", { key1: 5, key2: 3 }],
    },
  ])(
    "converts other values into a tuple",
    ({ tag, value, expected }: { tag: BinaryTag; value: unknown; expected: unknown }) => {
      expect(convertTaggedValue(tag, value as CborValue)).toEqual(expected);
    },
  );

  it("falls back to 'unknown' for unknown tags", () => {
    expect(convertTaggedValue(55, { Bool: true })).toEqual(["unknown", true]);
  });
});

describe("parseCbor", () => {
  describe("Null", () => {
    it("returns null", () => {
      expect(parseCbor("Null")).toBeNull();
    });
  });

  describe("Integer", () => {
    it.each([
      {
        value: { Integer: 5 },
        expected: 5,
      },
      {
        value: { Integer: 3 },
        expected: 3,
      },
    ])("returns an integer", ({ value, expected }) => {
      expect(parseCbor(value)).toEqual(expected);
    });
  });

  describe("Float", () => {
    it.each([
      {
        value: { Float: 3.9 },
        expected: 3.9,
      },
      {
        value: { Float: 3 },
        expected: 3,
      },
    ])("returns a number", ({ value, expected }) => {
      expect(parseCbor(value)).toEqual(expected);
    });
  });

  describe("Text", () => {
    it.each([
      {
        value: { Text: "Some text" },
        expected: "Some text",
      },
      {
        value: { Text: "DEF" },
        expected: "DEF",
      },
    ])("returns a string", ({ value, expected }) => {
      expect(parseCbor(value)).toEqual(expected);
    });
  });

  describe("Bytes", () => {
    it.each([
      {
        value: { Bytes: [1, 2, 0xff] },
        expected: Uint8Array.from([1, 2, 0xff]),
      },
      {
        value: { Bytes: [] },
        expected: new Uint8Array(),
      },
    ])("returns Uint8Array", ({ value, expected }) => {
      expect(parseCbor(value)).toEqual(expected);
    });
  });

  describe("Bool", () => {
    it.each([
      {
        value: { Bool: true },
        expected: true,
      },
      {
        value: { Bool: false },
        expected: false,
      },
    ])("returns a boolean", ({ value, expected }) => {
      expect(parseCbor(value)).toEqual(expected);
    });
  });

  describe("Tag", () => {
    it.each([
      {
        value: {
          Tag: [BinaryTag.VaultId, { Bytes: [1, 2, 3, 4, 255] }],
        },
        expected: "vault_01020304ff",
      },
      {
        value: { Tag: [BinaryTag.Metadata, { Array: [{ Text: "One" }, { Text: "Two" }] }] },
        expected: ["metadata", ["One", "Two"]],
      },
    ])("returns a tag representation", ({ value, expected }: { value: unknown; expected: unknown }) => {
      expect(parseCbor(value as CborValue)).toEqual(expected);
    });
  });

  describe("Array", () => {
    it.each([
      {
        value: {
          Array: [{ Integer: 5 }, { Float: 3.9 }, { Text: "Some text" }, { Bytes: [1, 2, 0xff] }, { Bool: true }],
        },
        expected: [5, 3.9, "Some text", Uint8Array.from([1, 2, 0xff]), true],
      },
    ])("returns an array", ({ value, expected }) => {
      expect(parseCbor(value)).toEqual(expected);
    });
  });

  describe("Map", () => {
    it.each([
      {
        value: {
          Map: [
            [{ Text: "key1" }, { Integer: 5 }],
            [{ Text: "key2" }, { Float: 3.9 }],
            [{ Text: "key3" }, { Text: "Some text" }],
            [{ Text: "key4" }, { Bytes: [1, 2, 0xff] }],
            [{ Text: "key5" }, { Bool: true }],
            [{ Text: "key6" }, { Array: [{ Integer: 1 }, { Integer: 2 }] }],
            [
              { Text: "key_nested" },
              {
                Map: [
                  [{ Text: "nested1" }, { Text: "Nested text" }],
                  [{ Text: "nested2" }, { Integer: 2 }],
                ],
              },
            ],
          ],
        },
        expected: {
          key1: 5,
          key2: 3.9,
          key3: "Some text",
          key4: Uint8Array.from([1, 2, 0xff]),
          key5: true,
          key6: [1, 2],
          key_nested: {
            nested1: "Nested text",
            nested2: 2,
          },
        },
      },
    ])("returns an object", ({ value, expected }: { value: unknown; expected: unknown }) => {
      expect(parseCbor(value as CborValue)).toEqual(expected);
    });
  });
});

describe("getCborValueByPath", () => {
  it.each([
    {
      path: "$.key1",
      expected: 5,
    },
    {
      path: "$.key3",
      expected: "Some text",
    },
    {
      path: "$.key6.1",
      expected: 2,
    },
    {
      path: "$.key_nested.nested1",
      expected: "Nested text",
    },
  ])("gets value by path", ({ path, expected }) => {
    const cbor: CborValue = {
      Map: [
        [{ Text: "key1" }, { Integer: 5 }],
        [{ Text: "key2" }, { Float: 3.9 }],
        [{ Text: "key3" }, { Text: "Some text" }],
        [{ Text: "key4" }, { Bytes: [1, 2, 0xff] }],
        [{ Text: "key5" }, { Bool: true }],
        [{ Text: "key6" }, { Array: [{ Integer: 1 }, { Integer: 2 }] }],
        [
          { Text: "key_nested" },
          {
            Map: [
              [{ Text: "nested1" }, { Text: "Nested text" }],
              [{ Text: "nested2" }, { Integer: 2 }],
            ],
          },
        ],
      ],
    };

    expect(getCborValueByPath(cbor, path)).toEqual(expected);
  });
});
