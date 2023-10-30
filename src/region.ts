import type { Compression } from "nbtify";

export interface Region extends ReadonlyArray<Entry | null> {
  [index: number]: Entry | null;
}

export function readRegion(region: Uint8Array): Region {
  return Object.seal([...readEntries(region)]);
}

export function writeRegion(region: Region) {
  const entries = region.map(entry => {
    if (entry === null) return null;

    const byteLength = Math.ceil((entry.data.byteLength + ENTRY_HEADER_LENGTH) / LOCATIONS_LENGTH) * LOCATIONS_LENGTH;
    const data = new Uint8Array(byteLength);
    data.set(entry.data,ENTRY_HEADER_LENGTH);

    return { ...entry, data };
  });

  const entryLengths: number[] = entries
    .map(entry => entry?.data.byteLength ?? 0);
  // console.log(entryLengths);

  const entryOffsets: number[] = entryLengths
    .map(byteLength => byteLength === 0 ? 0 : LOCATIONS_OFFSET + LOCATIONS_LENGTH + TIMESTAMPS_LENGTH + byteLength);
  for (const [i,byteOffset] of entryOffsets.entries()){
    if (byteOffset !== 0) entryOffsets[i] = (entryOffsets[i - 1] ?? 0) + byteOffset;
  }
  console.log(entryOffsets);

  const regionLength: number = entryLengths
    .reduce((entry,byteLength) => byteLength + entry,LOCATIONS_LENGTH + TIMESTAMPS_LENGTH);
  console.log(regionLength);

  const data = new Uint8Array(regionLength);
  const view = new DataView(data.buffer,data.byteOffset,data.byteLength);

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    const byteOffset: number = entryOffsets[i] ?? 0;
    const byteLength: number = entryLengths[i / LOCATION_LENGTH]!;
    if (i / LOCATION_LENGTH === 17) console.log(byteOffset,byteLength);
    // view.setUint32();
  }

  return entries;
}

export const LOCATIONS_OFFSET = 0;
export const LOCATIONS_LENGTH = 4096;
export const LOCATION_LENGTH = 4;

export const TIMESTAMPS_OFFSET = LOCATIONS_LENGTH;
export const TIMESTAMPS_LENGTH = 4096;
export const TIMESTAMP_LENGTH = 4;

export const ENTRY_HEADER_LENGTH = 5;

export interface Entry {
  data: Uint8Array;
  timestamp: number;
  compression: Compression;
}

export function* readEntries(region: Uint8Array): Generator<Entry | null,void,void> {
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    let byteOffset = (view.getUint32(i) >> 8) * LOCATIONS_LENGTH;
    let byteLength = view.getUint8(i + 3) * LOCATIONS_LENGTH;
    if (i / LOCATION_LENGTH === 17) console.log(byteOffset,byteLength);
    const timestamp = view.getUint32(i + TIMESTAMPS_OFFSET);

    if (byteLength === 0){
      yield null; continue;
    }

    byteLength = view.getUint32(byteOffset) - 1;
    const compression = readCompressionScheme(view.getUint8(byteOffset + 4) as CompressionScheme);
    byteOffset += ENTRY_HEADER_LENGTH;

    const data = region.subarray(byteOffset,byteOffset + byteLength);

    yield { data, timestamp, compression };
  }
}

type CompressionScheme = 1 | 2 | 3;

function readCompressionScheme(scheme: CompressionScheme): Compression {
  switch (scheme){
    case 1: return "gzip";
    case 2: return "deflate";
    case 3: return null;
    default: throw new TypeError(`Encountered unsupported compression scheme '${scheme}', must be a valid compression type`);
  }
}

function writeCompressionScheme(format: Compression): CompressionScheme {
  switch (format){
    case "gzip": return 1;
    case "deflate": return 2;
    case null: return 3;
    default: throw new TypeError(`Encountered unsupported compression format '${format}', must be a valid compression type`);
  }
}