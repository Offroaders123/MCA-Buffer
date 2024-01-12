export const LOCATIONS_OFFSET = 0;
export const LOCATIONS_LENGTH = 4096;
export const LOCATION_LENGTH = 4;

export const TIMESTAMPS_OFFSET = LOCATIONS_LENGTH;
export const TIMESTAMPS_LENGTH = 4096;
export const TIMESTAMP_LENGTH = 4;

export const ENTRY_LENGTH = 4096;
export const ENTRY_HEADER_LENGTH = 5;

export const REGION_LENGTH = 1024;

export interface Region extends ReadonlyArray<Entry> {
  [index: number]: Entry;
}

export interface Entry {
  data: Uint8Array | null;
  index: number;
  timestamp: number;
  byteOffset: number;
  byteLength: number;
}

export function readRegion(region: Uint8Array): Region {
  const entries: Region = Object.seal(Array.from<Region[number]>({ length: REGION_LENGTH }));
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    const index: number = i / LOCATION_LENGTH;
    const byteOffset: number = (view.getUint32(i) >> 8) * ENTRY_LENGTH;
    const byteLength: number = view.getUint8(i + 3) * ENTRY_LENGTH;
    const timestamp: number = view.getUint32(i + TIMESTAMPS_OFFSET);
    const data: Uint8Array | null = byteLength !== 0 ? region.subarray(byteOffset,byteOffset + byteLength) : null;

    entries[index] = { data, index, timestamp, byteOffset, byteLength };
  }

  return entries;
}

export function writeRegion(region: Region): Uint8Array {
  const byteLength: number = region.reduce((accumulator,entry) => accumulator + (entry.data?.byteLength ?? 0),LOCATIONS_LENGTH + TIMESTAMPS_LENGTH);
  const data = new Uint8Array(byteLength);
  const view = new DataView(data.buffer,data.byteOffset,data.byteLength);

  const entries: Region = region.toSorted((previous,next) => previous.byteOffset - next.byteOffset);

  for (const entry of entries){
    const headerIndex: number = entry.index * LOCATION_LENGTH;
    view.setUint32(headerIndex,(entry.byteOffset / ENTRY_LENGTH) << 8);
    view.setUint8(headerIndex + 3,entry.byteLength / ENTRY_LENGTH);
    view.setUint32(headerIndex + TIMESTAMPS_OFFSET,entry.timestamp);
    if (entry.data !== null){
      data.set(entry.data,entry.byteOffset);
    }
  }

  return data;
}