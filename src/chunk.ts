import { read } from "nbtify";

import type { IntTag, CompoundTag, NBTData } from "nbtify";
import type { Region, Entry } from "./region.js";

/* These types should eventually be derived from Region-Types. */

export interface Chunk extends NBTData<ChunkData> {}

export interface ChunkData extends CompoundTag {
  xPos: IntTag;
  yPos: IntTag;
  zPos: IntTag;
}

export async function readChunks(region: Region): Promise<(Chunk | null)[]> {
  return Promise.all(region.map(readEntry));
}

export async function readEntry({ data, compression }: Entry): Promise<Chunk | null> {
  if (data === null) return null;
  return read(data,{ endian: "big", compression, name: true, bedrockLevel: false });
}