import { readFile } from "node:fs/promises";
import { readChunks, readRegion, writeChunk } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);

const region = readRegion(data);
// console.log(
//   region
//     .slice(1000)
// );
console.log(region[64]!);

const chunks = await readChunks(region);
// console.log(
//   chunks
//     // .slice(1000)
// );

const chunk = chunks[64]!;
// console.log(chunk);

const sector = await writeChunk(chunk);
console.log(sector);

console.log(Buffer.compare(chunk.data, sector.sector));