import type { Compression } from "nbtify";

export const LOCATIONS_OFFSET = 0;
export const LOCATIONS_LENGTH = 4096;
export const LOCATION_LENGTH = 4;

export const TIMESTAMPS_OFFSET = LOCATIONS_LENGTH;
export const TIMESTAMPS_LENGTH = 4096;
export const TIMESTAMP_LENGTH = 4;

export const ENTRY_LENGTH = 4096;
export const ENTRY_HEADER_LENGTH = 5;

export const REGION_LENGTH = 1024;

export interface Region<T extends EntryLike = EntryLike> extends ReadonlyArray<T> {
  [index: number]: T;
}

export interface JavaEntry extends EntryLike {
  compression: Compression;
}

export interface EntryLike {
  data: Uint8Array | null;
  index: number;
  timestamp: number;
  byteOffset?: number;
}

export function readRegion(region: Uint8Array): Region<JavaEntry> {
  const entries: Region<JavaEntry> = Object.seal(Array.from<JavaEntry>({ length: REGION_LENGTH }));
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    const index: number = i / LOCATION_LENGTH;
    const entryOffset: number = (view.getUint32(i) >> 8) * ENTRY_LENGTH;
    const entryLength: number = view.getUint8(i + 3) * ENTRY_LENGTH;
    const timestamp: number = view.getUint32(i + TIMESTAMPS_OFFSET);
    const entry: Uint8Array | null = entryLength !== 0 ? region.subarray(entryOffset,entryOffset + entryLength) : null;

    // entries[index] = { data, index, timestamp, byteOffset: entryOffset };

    // Java code specifically

    if (entry === null){
      entries[index] = { data: entry, index, timestamp, byteOffset: entryOffset, compression: null };
      continue;
    }

    // 0, relative to block
    const blockByteLength = view.getUint8(entryOffset) - 1;
    let compression: Compression;
    const scheme = view.getUint8(entryOffset + 4);

    switch (scheme){
      case 1: compression = "gzip"; break;
      case 2: compression = "deflate"; break;
      case 3: compression = null; break;
      default: throw new TypeError(`Encountered unsupported compression scheme '${scheme}', must be a valid compression type`);
    }

    const data = entry.subarray(ENTRY_HEADER_LENGTH,blockByteLength);

    entries[index] = { data, index, timestamp, byteOffset: entryOffset, compression };
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