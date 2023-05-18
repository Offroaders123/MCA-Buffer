import { readChunks } from "./chunk.js";

export async function readRegion(data: Uint8Array){
  for await (const chunk of readChunks(data)){
    console.log(chunk);
  }
}