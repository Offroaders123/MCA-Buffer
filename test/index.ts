import { readFile } from "node:fs/promises";
import { chunkCoordinateFromIndex, indexFromChunkCoordinate, readRegion } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);

const region = readRegion(data);
console.log(
  // new Set(
  region
    .slice(1000)
    // .map(chunk => {
    //   const { index } = chunk;
    //   const coords = chunkCoordinateFromIndex(index);
    //   const diffIndex = indexFromChunkCoordinate(coords);
    //   // return index === diffIndex;
    //   return [index, coords, diffIndex];
    // })
  // )
);