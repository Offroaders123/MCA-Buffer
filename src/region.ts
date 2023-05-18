import { readChunks, Chunk } from "./chunk.js";

export async function* readRegion(data: Uint8Array): AsyncGenerator<Chunk | null,void,void> {
  for await (const chunk of readChunks(data)){
    yield chunk;
  }
}