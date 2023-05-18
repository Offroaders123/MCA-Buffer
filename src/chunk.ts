import { inflate, gunzip } from "node:zlib";
import { promisify } from "node:util";
import { read, ReadOptions } from "nbtify";

import { readLocations } from "./location.js";

const inflateAsync = promisify(inflate);
const gunzipAsync = promisify(gunzip);

export interface Chunk {}

const NBT_FORMAT = {
  endian: "big",
  compression: null,
  isNamed: true,
  isBedrockLevel: false
} as const satisfies ReadOptions;

export async function* readChunks(data: Uint8Array): AsyncGenerator<Chunk,void,void> {
  for await (const chunk of getChunk(data)){
    if (chunk === null) continue;
    const { data: result } = await read(chunk,NBT_FORMAT);
    yield result as Chunk;
  }
}

async function* getChunk(data: Uint8Array): AsyncGenerator<Uint8Array | null,void,void> {
  for (const { byteOffset, byteLength } of readLocations(data)){
    if (byteLength === 0) yield null;
    yield decompressChunk(data.subarray(byteOffset,byteOffset + byteLength));
  }
}

const COMPRESSION_HEADER_LENGTH = 5;

/**
 * 1 - gzip,
 * 2 - zlib (DEFLATE),
 * 3 - Uncompressed
*/
type CompressionFormat = 1 | 2 | 3;

interface CompressionHeader {
  compressedLength: number;
  compression: CompressionFormat;
}

function readCompressionHeader(data: Uint8Array): CompressionHeader {
  const view = new DataView(data.buffer,data.byteOffset,data.byteLength);

  const compressedLength = view.getUint32(0);
  const compression = view.getUint8(4) as CompressionFormat;

  return { compressedLength, compression };
}

async function decompressChunk(data: Uint8Array): Promise<Uint8Array | null> {
  if (data.byteLength < COMPRESSION_HEADER_LENGTH) return null;

  const { compressedLength, compression } = readCompressionHeader(data);
  // console.log(compressedLength,compression);

  const compressedData = data.subarray(COMPRESSION_HEADER_LENGTH,COMPRESSION_HEADER_LENGTH + compressedLength - 1);

  switch (compression){
    case 1: return gunzipAsync(compressedData);
    case 2: return inflateAsync(compressedData);
    case 3: return compressedData;
  }
}