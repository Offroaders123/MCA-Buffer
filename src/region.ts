import { readLocations } from "./location.js";
import { readChunk, pos } from "./chunk.js";

import type { Location } from "./location.js";
import type { Chunk, Pos } from "./chunk.js";

export class Region {
  [x: number]: {
    [y: number]: {
      [z: number]: Chunk | undefined;
    } | undefined;
  } | undefined;

  set(chunk: Chunk): void {
    const { x, y, z } = pos(chunk);
    if (this[x] === undefined) this[x] = {};
    if (this[x]![y] === undefined) this[x]![y] = {};
    this[x]![y]![z] = chunk;
  }

  get(pos: Pos): Chunk | null;
  get({ x, y, z }: Pos): Chunk | null {
    const chunk = this[x]?.[y]?.[z] ?? null;
    return chunk;
  }
}

export async function readRegion(region: Uint8Array): Promise<Region> {
  const locations = readLocations(region);
  const chunks = new Region();

  await Promise.all(locations.map(async location => {
    const data = readChunkLocation(region,location);
    if (data === null) return;
    const chunk = await readChunk(data);
    chunks.set(chunk);
    console.log(chunk.data.structures);
  }));

  return chunks;
}

export function readChunkLocation(region: Uint8Array, { byteOffset, byteLength }: Location): Uint8Array | null {
  if (byteLength === 0) return null;
  return region.subarray(byteOffset,byteOffset + byteLength);
}