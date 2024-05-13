import { read, write } from "nbtify";

import type { Format } from "nbtify";
import type { Chunk as ChunkData } from "../Region-Types/src/java/index.js";
import type { Region, Chunk } from "./region.js";

export const ENTRY_HEADER_LENGTH = 5;
export const ENTRY_LENGTH = 4096;

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
  const { index, byteOffset, byteLength, timestamp } = entry;
  const data: Uint8Array | null = byteLength !== 0 ? region.subarray(byteOffset, byteOffset + byteLength) : null;
  if (data === null) return [ index, byteOffset, byteLength, timestamp ] as const; // array usage just for type limitations atm
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const payloadLength = view.getUint32(0, false) - 1;
  const compression = view.getUint8(4);
  const payload = data.subarray(ENTRY_HEADER_LENGTH, ENTRY_HEADER_LENGTH + payloadLength);
  const nbt = await read<ChunkData>(payload, { ...CHUNK_NBT_FORMAT });
  return { payload, data, payloadLength, compression, nbt, index, timestamp };
}

export async function writeChunk(chunk: Awaited<ReturnType<typeof readChunk>>): Promise<Chunk> {
  if (chunk instanceof Array) {
    const [ index, byteOffset, byteLength, timestamp ] = chunk;
    return { index, byteOffset, byteLength, timestamp };
  }

  const writtenNBT: Uint8Array = await write(chunk.nbt);
  const sectorLength: number = ENTRY_LENGTH * Math.ceil(writtenNBT.byteLength / ENTRY_LENGTH);
  const sector: Uint8Array = Buffer.alloc(sectorLength);
  const sectorView = new DataView(sector.buffer, sector.byteOffset, sector.byteLength);
  sector.set(writtenNBT, ENTRY_HEADER_LENGTH);
  sectorView.setUint32(0, writtenNBT.byteLength + 1, false);
  sectorView.setUint8(4, 2);
  return sector;
}