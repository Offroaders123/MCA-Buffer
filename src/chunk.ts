import { read as readNBT, write as writeNBT, NBTData } from "nbtify";

import type { IntTag, CompoundTag, FormatOptions } from "nbtify";

export const HEADER_LENGTH = 5;
export const SCHEME_LENGTH = 1;

export type Compression = "gzip" | "deflate" | null;
export type CompressionScheme = 1 | 2 | 3;

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

export interface Pos { x: number; y: number; z: number; }

export class Chunk extends NBTData<ChunkData> implements Format {
  override readonly name = "";
  override readonly endian = "big";
  override readonly compression: Compression = "deflate";
  override readonly bedrockLevel = null;

  constructor(data: NBTData<ChunkData,Format>) {
    super(data);
  }

  pos(): Pos {
    const { xPos, yPos, zPos } = this.data;
    const x = xPos.valueOf();
    const y = yPos.valueOf();
    const z = zPos.valueOf();
    return { x, y, z };
  }
}

export interface Header {
  byteLength: number;
  compression: Compression;
}

export async function readChunk(chunk: Uint8Array): Promise<Chunk> {
  const { byteLength, compression } = readHeader(chunk);
  const data = chunk.subarray(HEADER_LENGTH,HEADER_LENGTH + byteLength);
  return new Chunk(await readNBT(data,{ endian: "big", compression, name: true, bedrockLevel: false }));
}

export function readHeader(chunk: Uint8Array): Header {
  const view = new DataView(chunk.buffer,chunk.byteOffset,chunk.byteLength);
  const byteLength = view.getUint32(0) - SCHEME_LENGTH;
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

export async function writeChunk(chunk: Chunk): Promise<Uint8Array> {
  let data = await writeNBT(chunk);
  const { byteLength } = data;
  const { compression } = chunk;
  data = writeHeader(data,{ byteLength, compression });
  return data;
}

export function writeHeader(chunk: Uint8Array, { byteLength, compression }: Header): Uint8Array {
  const view = new DataView(chunk.buffer,chunk.byteOffset,chunk.byteLength);
  const scheme = writeCompression(compression);
  const data = new Uint8Array(HEADER_LENGTH + byteLength);
  view.setUint32(0,byteLength + SCHEME_LENGTH);
  view.setUint8(4,scheme);
  data.set(chunk,HEADER_LENGTH);
  return data;
}

export function writeCompression(compression: Compression): CompressionScheme {
  switch (compression){
    case "gzip": return 1;
    case "deflate": return 2;
    case null: return 3;
    default: throw new TypeError(`Encountered unsupported compression type '${compression}', must be a valid compression scheme`);
  }
}