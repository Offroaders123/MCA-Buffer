import { read } from "nbtify";

import type { Format } from "nbtify";
import type { Chunk as ChunkData } from "../Region-Types/src/java/index.js";
import type { Region, Chunk } from "./region.js";

export const ENTRY_HEADER_LENGTH = 5;

export const CHUNK_NBT_FORMAT = {
  rootName: "",
  endian: "big",
  compression: "deflate",
  bedrockLevel: false
} as const satisfies Format;

export async function readChunks(data: Uint8Array, region: Region) {
  return Promise.all(region.map(chunk => readChunk(data, chunk)));
}

export async function readChunk(region: Uint8Array, entry: Chunk) {
  const { byteOffset, byteLength } = entry;
  const data: Uint8Array | null = byteLength !== 0 ? region.subarray(byteOffset, byteOffset + byteLength) : null;
  if (data === null) return null;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const payloadLength = view.getUint32(0, false) - 1;
  const compression = view.getUint8(4);
  const payload = data.subarray(ENTRY_HEADER_LENGTH, ENTRY_HEADER_LENGTH + payloadLength);
  const nbt = await read<ChunkData>(payload, { ...CHUNK_NBT_FORMAT });
  return { payload, payloadLength, compression, nbt };
}