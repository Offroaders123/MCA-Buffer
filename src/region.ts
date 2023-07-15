import { readLocations } from "./location.js";
import { readChunk } from "./chunk.js";

import type { Location } from "./location.js";
import type { Chunk } from "./chunk.js";

export type Region = (Chunk | null)[];

export async function readRegion(region: Uint8Array): Promise<Region> {
  const locations = readLocations(region);
  return Promise.all(locations.map(async location => {
    const data = readChunkLocation(region,location);
    return data === null ? data : readChunk(data);
  }));
}

export function readChunkLocation(region: Uint8Array, { byteOffset, byteLength }: Location): Uint8Array | null {
  if (byteLength === 0) return null;
  return region.subarray(byteOffset,byteOffset + byteLength);
}