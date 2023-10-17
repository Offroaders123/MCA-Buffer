import type { Compression } from "nbtify";

export interface Region extends ReadonlyArray<Entry | null> {
  [index: number]: Entry | null;
}

export function readRegion(region: Uint8Array): Region {
  return Object.seal([...readEntries(region)]);
}

export const LOCATION_LENGTH = 4;
export const LOCATIONS_LENGTH = 4096;
export const LOCATIONS_OFFSET = 0;

export const TIMESTAMP_LENGTH = 4;
export const TIMESTAMPS_LENGTH = 4096;
export const TIMESTAMPS_OFFSET = LOCATIONS_LENGTH;

export const HEADER_LENGTH = 5;
export const SCHEME_LENGTH = 1;

export interface Entry {
  data: Uint8Array;
  timestamp: number;
  compression: Compression;
}

export type CompressionScheme = 1 | 2 | 3;

export function* readEntries(region: Uint8Array): Generator<Entry | null,void,void> {
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    const byteOffset = (view.getUint32(i) >> 8) * LOCATIONS_LENGTH;
    const byteLength = view.getUint8(i + 3) * LOCATIONS_LENGTH;
    const timestamp = view.getUint32(i + TIMESTAMPS_OFFSET);
    // console.log(byteOffset,byteLength,timestamp);

    const data: Uint8Array | null = byteLength > HEADER_LENGTH ? region.subarray(byteOffset + HEADER_LENGTH,byteOffset + byteLength - HEADER_LENGTH) : null;
    const compression: Compression = data !== null ? readCompressionScheme(view.getUint8(byteOffset + 4) as CompressionScheme) : null;

    yield data !== null ? { data, timestamp, compression } : null;
  }
}

function readCompressionScheme(scheme: CompressionScheme): Compression {
  switch (scheme){
    case 1: return "gzip";
    case 2: return "deflate";
    case 3: return null;
    default: throw new TypeError(`Encountered unsupported compression scheme '${scheme}', must be a valid compression type`);
  }
}