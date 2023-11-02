import type { Compression } from "nbtify";

export interface Region extends ReadonlyArray<Entry | null> {
  [index: number]: Entry | null;
}

export function readRegion(region: Uint8Array): Region {
  const entries = [...readEntries(region)];
  // entries.sort((a,b) => (a?.byteOffset ?? 0) - (b?.byteOffset ?? 0));

  const editIndicies = [...entries]
    .sort((previous,next) => (previous?.data.byteOffset ?? 0) - (next?.data.byteOffset ?? 0));

  for (const [i,entry] of editIndicies.entries()){
    if (entry === null) continue;
    entry.index = i;
  }

  return Object.seal(entries);
}

export function writeRegion(region: Region): Uint8Array {
  const regionLength: number = region
    .map(entry => Math.ceil((entry?.data.byteLength ?? 0) / ENTRY_LENGTH) * ENTRY_LENGTH)
    .reduce((previous,current) => previous + current,LOCATIONS_OFFSET + LOCATIONS_LENGTH + TIMESTAMPS_LENGTH);

  const data = new Uint8Array(regionLength);
  const view = new DataView(data.buffer);

  let writePointer = LOCATIONS_OFFSET + LOCATIONS_LENGTH + TIMESTAMPS_LENGTH;

  for (const [i,entry] of region.entries()){
    // console.log(i,entry?.index);
    const byteLength: number = Math.ceil((entry?.data.byteLength ?? 0) / ENTRY_LENGTH);
    const byteOffset: number = writePointer;
    view.setUint32(i * LOCATION_LENGTH,byteOffset);
    view.setUint8(i * LOCATION_LENGTH + 3,byteLength);

    if (i === 17) console.log(byteOffset,byteLength * ENTRY_LENGTH);

    writePointer += byteLength;
  }

  return data;
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
  data: Uint8Array;
  timestamp: number;
  compression: Compression;
  index?: number;
}

export function* readEntries(region: Uint8Array): Generator<Entry | null, void, void> {
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    let byteOffset = (view.getUint32(i) >> 8) * ENTRY_LENGTH;
    let byteLength = view.getUint8(i + 3) * ENTRY_LENGTH;
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