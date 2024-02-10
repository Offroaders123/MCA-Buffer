import { read, write, NBTData } from "nbtify";

import type { Format } from "nbtify";
import type { Chunk as ChunkData } from "../Region-Types/src/java/index.js";
import type { Region, Entry } from "./region.js";

export class Chunk extends NBTData<ChunkData> {
  constructor(data: NBTData<ChunkData>, public timestamp: number, public index?: number) {
    super(data);
  }
}

export const CHUNK_NBT_FORMAT = {
  rootName: "",
  endian: "big",
  compression: "deflate",
  bedrockLevel: null
} as const satisfies Format;

export async function readChunks(region: Region): Promise<(Chunk | null)[]> {
  return Promise.all(region.map(readEntry));
}

export async function readEntry(entry: Entry | null): Promise<Chunk | null> {
  if (entry === null) return null;
  const { data, timestamp, compression, index } = entry;
  const nbt: NBTData<ChunkData> = await read(data,{ ...CHUNK_NBT_FORMAT, compression });
  return new Chunk(nbt,timestamp,index);
}

export async function writeChunks(chunks: (Chunk | null)[]): Promise<Region> {
  return Promise.all(chunks.map(writeEntry));
}

export async function writeEntry(chunk: Chunk | null): Promise<Entry | null> {
  if (chunk === null) return null;
  const { data: nbt, timestamp, compression, index } = chunk;
  const data: Uint8Array = await write(nbt,{ ...CHUNK_NBT_FORMAT, compression });
  return { data, timestamp, compression, index };
}