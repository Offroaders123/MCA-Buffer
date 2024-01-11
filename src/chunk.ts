import { read, write, NBTData } from "nbtify";

import type { IntTag, CompoundTag } from "nbtify";
import type { Region, Entry } from "./region.js";

/* These types should eventually be derived from Region-Types. */

export class Chunk extends NBTData<ChunkData> {
  constructor(data: NBTData<ChunkData>, public timestamp: number, public index?: number) {
    super(data);
  }
}

export interface ChunkData extends CompoundTag {
  xPos: IntTag;
  yPos: IntTag;
  zPos: IntTag;
}

export async function readChunks(region: Region): Promise<(Chunk | null)[]> {
  return Promise.all(region.map(readEntry));
}

export async function readEntry(entry: Entry | null): Promise<Chunk | null> {
  if (entry === null) return null;
  const { data, timestamp, compression, index } = entry;
  const nbt: NBTData<ChunkData> = await read(data,{ endian: "big", compression, rootName: true, bedrockLevel: false });
  return new Chunk(nbt,timestamp,index);
}

export async function writeChunks(chunks: (Chunk | null)[]): Promise<Region> {
  return Promise.all(chunks.map(writeEntry));
}

export async function writeEntry(chunk: Chunk | null): Promise<Entry | null> {
  if (chunk === null) return null;
  const { data: nbt, timestamp, compression, index } = chunk;
  const data: Uint8Array = await write(nbt,{ rootName: "", endian: "big", compression, bedrockLevel: null });
  return { data, timestamp, compression, index };
}