import { ENTRY_LENGTH } from "./chunk.js";

import type { Chunk } from "./chunk.js";

export const LOCATIONS_OFFSET = 0;
export const LOCATIONS_LENGTH = 4096;
export const LOCATION_LENGTH = 4;

export const TIMESTAMPS_OFFSET = LOCATIONS_LENGTH;
export const TIMESTAMPS_LENGTH = 4096;
export const TIMESTAMP_LENGTH = 4;

export type Region = Chunk[];

export function readRegion(data: Uint8Array): Region {
  const chunks: Region = [];
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH) {
    const index: number = i / LOCATION_LENGTH;
    const byteOffset: number = (view.getUint32(i) >> 8) * ENTRY_LENGTH;
    const byteLength: number = view.getUint8(i + 3) * ENTRY_LENGTH;
    const timestamp: number = view.getUint32(i + TIMESTAMPS_OFFSET);
    const sector: Uint8Array | null = byteLength !== 0 ? data.subarray(byteOffset, byteOffset + byteLength) : null;

    chunks.push({ index, sector, timestamp });
  }

  return chunks;
}

export type Coordinate2D = [number, number];

export function chunkCoordinateFromIndex(index: number): Coordinate2D {
  return [
      index % 32,
      Math.floor(index / 32) % 32
  ];
}

export function indexFromChunkCoordinate(coordinate: Coordinate2D): number {
  const [ x, z ] = coordinate;
  return (z * 32) + x;
}