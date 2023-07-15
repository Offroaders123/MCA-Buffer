import { read as readNBT } from "nbtify";

import type { NBTData } from "nbtify";

export const HEADER_LENGTH = 5;

export type Compression = "deflate" | "gzip" | null;
export type CompressionScheme = 1 | 2 | 3;

export interface Header {
  byteLength: number;
  compression: Compression;
}

export async function read(chunk: Uint8Array): Promise<NBTData> {
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
    case 1: return "deflate";
    case 2: return "gzip";
    case 3: return null;
    default: throw new TypeError(`Encountered unsupported compression scheme '${scheme}', must be a valid compression type`);
  }
}