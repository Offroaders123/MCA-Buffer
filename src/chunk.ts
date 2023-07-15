import { read, NBTData, Compression } from "nbtify";
import { readLocations } from "./location.js";

const HEADER_LENGTH = 5;

export interface Chunk extends NBTData<{
  xPos: number;
  yPos: number;
  zPos: number;
}> {}

interface Header {
  byteLength: number;
  format: CompressionFormat;
}

type CompressionFormat = 1 | 2 | 3;

export async function* readChunks(data: Uint8Array): AsyncGenerator<Chunk | null,void,void> {
  for (const chunk of getChunk(data)){
    if (chunk === null){ yield chunk; continue; }

    const { byteLength, format } = readHeader(chunk);
    const compressedData = chunk.subarray(HEADER_LENGTH,HEADER_LENGTH + byteLength);
    const compression = getCompression(format);

    yield read(compressedData,{ endian: "big", compression, name: true, bedrockLevel: false });
  }
}

function* getChunk(data: Uint8Array): Generator<Uint8Array | null,void,void> {
  for (const { byteOffset, byteLength } of readLocations(data)){
    if (byteLength === 0){ yield null; continue; }
    yield data.subarray(byteOffset,byteOffset + byteLength);
  }
}

function readHeader(data: Uint8Array): Header {
  const view = new DataView(data.buffer,data.byteOffset,data.byteLength);

  const byteLength = view.getUint32(0) - 1;
  const format = view.getUint8(4) as CompressionFormat;

  return { byteLength, format };
}

function getCompression(format: CompressionFormat): Compression | null {
  switch (format){
    case 1: return "gzip";
    case 2: return "deflate";
    case 3: return null;
  }
}