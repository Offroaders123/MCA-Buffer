import { read as readNBT } from "nbtify";

import type { NBTData } from "nbtify";

export const HEADER_LENGTH = 5;

export type Compression = "gzip" | "deflate" | null;
export type CompressionScheme = 1 | 2 | 3;

export type Chunk = NBTData;

export interface Header {
  byteLength: number;
  compression: Compression;
}

export async function readChunk(chunk: Uint8Array): Promise<Chunk> {
  const { byteLength, compression } = readHeader(chunk);
  const data = chunk.subarray(HEADER_LENGTH,HEADER_LENGTH + byteLength);
  return readNBT(data,{ endian: "big", compression, name: true, bedrockLevel: false });
}

export function readHeader(chunk: Uint8Array): Header {
  const view = new DataView(chunk.buffer,chunk.byteOffset,chunk.byteLength);
  const byteLength = view.getUint32(0) - 1;
  const scheme = view.getUint8(4) as CompressionScheme;
  const compression = readCompression(scheme);
  return { byteLength, compression };
}

export function readCompression(scheme: CompressionScheme): Compression {
  switch (scheme){
    case 1: return "gzip";
    case 2: return "deflate";
    case 3: return null;
    default: throw new TypeError(`Encountered unsupported compression scheme '${scheme}', must be a valid compression type`);
  }
}