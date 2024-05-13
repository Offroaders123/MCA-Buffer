import { read } from "nbtify";

import type { Format } from "nbtify";
import type { Chunk as ChunkData } from "../Region-Types/src/java/index.js";
import type { Region, Chunk } from "./region.js";

export const CHUNK_NBT_FORMAT = {
  rootName: "",
  endian: "big",
  compression: "deflate",
  bedrockLevel: false
} as const satisfies Format;

export async function readChunks(region: Region) {
  return Promise.all(region.map(readEntry));
}

export async function readEntry(entry: Chunk) {
  if (entry.data === null) return null;
  const { data } = entry;
  const payloadLength = Buffer.from(data).readUInt32BE(0);
  const compression = Buffer.from(data).readUInt8(4);
  const nbt = await read<ChunkData>(data.subarray(5));
  return { data, payloadLength, compression, nbt };
}