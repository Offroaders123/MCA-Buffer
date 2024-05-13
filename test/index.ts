import { readFile } from "node:fs/promises";
import { readChunks, readRegion } from "../src/index.js";

const REGION = new URL("./test-flat!/region/r.0.0.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);

const region = readRegion(data);
// console.log(
//   region
//     .slice(1000)
// );

const chunks = await readChunks(region);
console.log(
  // new Set(
  chunks
    // .slice(1000)
    .map(chunk => {
      if (chunk === null) return chunk;
      const { x, z } = chunk;
      const { xPos, zPos } = chunk.nbt.data;
      const xCoord = xPos.valueOf();
      const zCoord = zPos.valueOf();
      // return xCoord === x && zCoord === z;
      return [ xCoord, x, zCoord, z ];
    })
    // .filter(Boolean)
  // )
);