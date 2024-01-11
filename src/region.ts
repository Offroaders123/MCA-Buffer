export const REGION_LENGTH = 1024;

export interface Region extends ReadonlyArray<Entry> {
  [index: number]: Entry;
}

export function readRegion(region: Uint8Array): Region {
  const entries: Region = Object.seal(Array.from<Region[number]>({ length: REGION_LENGTH }));
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    const index: number = i / LOCATION_LENGTH;
    const byteOffset = (view.getUint32(i) >> 8) * ENTRY_LENGTH;
    const byteLength = view.getUint8(i + 3) * ENTRY_LENGTH;
    const timestamp = view.getUint32(i + TIMESTAMPS_OFFSET);
    const data: Uint8Array | null = byteLength !== 0 ? region.subarray(byteOffset + 5,byteOffset + byteLength) : null;
    entries[index] = { data, index, timestamp, byteOffset };
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
  index: number;
  timestamp: number;
  byteOffset: number;
}