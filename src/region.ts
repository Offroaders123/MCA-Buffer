import { read } from "nbtify";

export const REGION_LENGTH = 1024;

const format = { rootName: true, endian: "big", compression: "deflate", bedrockLevel: false } as const;

export interface Region extends ReadonlyArray<Entry | null> {
  [index: number]: Entry | null;
}

export async function readRegion(region: Uint8Array): Promise<Region> {
  const entries: Region = Object.seal(Array<Region[number]>(REGION_LENGTH).fill(null));
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    const byteOffset = (view.getUint32(i) >> 8) * ENTRY_LENGTH;
    const byteLength = view.getUint8(i + 3) * ENTRY_LENGTH;
    const timestamp = view.getUint32(i + TIMESTAMPS_OFFSET);
    const data: Uint8Array | null = byteLength !== 0 ? (await read(region.subarray(byteOffset + 5,byteOffset + byteLength),format)).data : null;
    if (data) var { xPos, yPos, zPos } = data;
    entries[i / LOCATION_LENGTH] = { data: data !== null ? { xPos, yPos, zPos } : data, byteOffset, timestamp };
  }

  return entries;
}

export const LOCATIONS_OFFSET = 0;
export const LOCATIONS_LENGTH = 4096;
export const LOCATION_LENGTH = 4;

export const TIMESTAMPS_OFFSET = LOCATIONS_LENGTH;
export const TIMESTAMPS_LENGTH = 4096;
export const TIMESTAMP_LENGTH = 4;

export const ENTRY_LENGTH = 4096;
export const ENTRY_HEADER_LENGTH = 5;

export interface Entry {
  data: Uint8Array | null;
  byteOffset: number;
  timestamp: number;
}