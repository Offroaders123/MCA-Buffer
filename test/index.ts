import { readFile } from "node:fs/promises";
import { readRegion } from "../src/index.js";

import type { Chunk } from "../src/index.js";

const AXES: [number,number][] = [
  [-1,-1],
  [-1,-2],
  [-1,0],
  [0,-1],
  [0,-2],
  [0,0]
];

const REGIONS = AXES.map(([x,y]) => new URL(`./test-flat!/region/r.${x}.${y}.mca`,import.meta.url));

const datas = await Promise.all(REGIONS.map(axis => readFile(axis)));
// console.log(data.subarray(0,800).join(" "));

for (const data of datas){
  const region = await fromAsync(readRegion(data));
  console.log(region.length);
  const chunk = findChunk(region);
  if (chunk === null) continue;
  console.log(chunk);
}

// for (const chunk of region){
//   // console.log(chunk);
// }

function findChunk(region: (Chunk | null)[]): Chunk | null {
  for (const chunk of region){
    if (chunk === null) return chunk;
    const { xPos, yPos, zPos } = chunk.data;
    console.log(xPos,yPos,zPos);
  }
}

async function fromAsync<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];

  for await (const entry of generator){
    results.push(entry);
  }

  return results;
}