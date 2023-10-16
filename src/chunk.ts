import { read } from "nbtify";

import type { IntTag, CompoundTag, NBTData, FormatOptions } from "nbtify";
import type { Region, Entry } from "./region.js";

export const HEADER_LENGTH = 5;
export const SCHEME_LENGTH = 1;

export type Compression = "gzip" | "deflate" | null;
export type CompressionScheme = 1 | 2 | 3;

/* These types should eventually be derived from Region-Types. */

export interface ChunkData extends CompoundTag {
  xPos: IntTag;
  yPos: IntTag;
  zPos: IntTag;
}

export interface Format extends FormatOptions {
  name: "";
  endian: "big";
  compression: Compression;
  bedrockLevel: null;
}

export type Chunk = NBTData<ChunkData,Format>;

export interface Header {
  byteLength: number;
  compression: Compression;
}

export async function readChunks(region: Region): Promise<(Chunk | null)[]> {
  return Promise.all(region.map(readEntry));
}

export async function readEntry(entry: Entry): Promise<(Chunk | null)> {
  if (entry === null || entry.byteLength < HEADER_LENGTH) return null;

  const view = new DataView(entry.buffer,entry.byteOffset,HEADER_LENGTH);
  const byteLength = view.getUint32(0) - SCHEME_LENGTH;
  const scheme = view.getUint8(4) as CompressionScheme;
  const compression = readCompression(scheme);

  const data = entry.subarray(HEADER_LENGTH,HEADER_LENGTH + byteLength);
  return read(data,{ endian: "big", compression, name: true, bedrockLevel: false });
}

export function readCompression(scheme: CompressionScheme): Compression {
  switch (scheme){
    case 1: return "gzip";
    case 2: return "deflate";
    case 3: return null;
    default: throw new TypeError(`Encountered unsupported compression scheme '${scheme}', must be a valid compression type`);
  }
}