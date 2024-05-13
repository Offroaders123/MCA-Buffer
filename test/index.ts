import { readFile } from "node:fs/promises";
import { readChunks, readRegion } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);

const region = readRegion(data);
// console.log(
//   region
//     .slice(1000)
// );

const chunks = await readChunks(region);
console.log(
  chunks
    // .slice(1000)
);