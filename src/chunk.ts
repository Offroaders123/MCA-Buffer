import { read, NBTData } from "nbtify";

import type { IntTag, CompoundTag } from "nbtify";
import type { Region, Entry } from "./region.js";

/* These types should eventually be derived from Region-Types. */

export class Chunk extends NBTData<ChunkData> {
  constructor(data: NBTData<ChunkData>, public timestamp: number) {
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
  const { data, timestamp, compression } = entry;
  const nbt: NBTData<ChunkData> = await read(data,{ endian: "big", compression, name: true, bedrockLevel: false });
  return new Chunk(nbt,timestamp);
}