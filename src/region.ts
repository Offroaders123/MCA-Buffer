import { readLocations } from "./location.js";
import { readChunk } from "./chunk.js";

import type { Location } from "./location.js";
import type { Chunk } from "./chunk.js";

export type Region = Chunk[][][];

export async function readRegion(region: Uint8Array): Promise<Region> {
  const locations = readLocations(region);
  const chunks: Region = [];

  await Promise.all(locations.map(async location => {
    const data = readChunkLocation(region,location);
    if (data === null) return;
    const chunk = await readChunk(data);
    const { x, y, z } = chunk.getPos();
    if (chunks[x] === undefined) chunks[x] = [];
    if (chunks[x][y] === undefined) chunks[x][y] = [];
    chunks[x][y][z] = chunk;
  }));

  return chunks;
}

export function readChunkLocation(region: Uint8Array, { byteOffset, byteLength }: Location): Uint8Array | null {
  if (byteLength === 0) return null;
  return region.subarray(byteOffset,byteOffset + byteLength);
}