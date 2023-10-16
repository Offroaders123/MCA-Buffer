import { readChunk, pos } from "./chunk.js";

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
  }));

  return chunks;
}

export const LOCATION_LENGTH = 4;
export const LOCATIONS_LENGTH = 4096;
export const LOCATIONS_OFFSET = 0;

export interface Location {
  byteOffset: number;
  byteLength: number;
}

export function readLocations(region: Uint8Array): Location[] {
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);
  const locations: Location[] = [];

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    const byteOffset = (view.getUint32(i) >> 8) * LOCATIONS_LENGTH;
    const byteLength = view.getUint8(i + 3) * LOCATIONS_LENGTH;
    locations.push({ byteOffset, byteLength });
  }

  return locations;
}

export const TIMESTAMP_LENGTH = 4;
export const TIMESTAMPS_LENGTH = 4096;
export const TIMESTAMPS_OFFSET = LOCATIONS_LENGTH;

export type Timestamp = number;

export function readTimestamps(region: Uint8Array): Timestamp[] {
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);
  const timestamps: Timestamp[] = [];

  for (let i = TIMESTAMPS_OFFSET; i < TIMESTAMPS_OFFSET + TIMESTAMPS_LENGTH; i += TIMESTAMP_LENGTH){
    const timestamp = view.getUint32(i);
    timestamps.push(timestamp);
  }

  return timestamps;
}

export function readChunkLocation(region: Uint8Array, { byteOffset, byteLength }: Location): Uint8Array | null {
  if (byteLength === 0) return null;
  return region.subarray(byteOffset,byteOffset + byteLength);
}