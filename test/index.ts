import { readFile } from "node:fs/promises";
import { readRegion, writeRegion, readChunks, writeChunks } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);
console.log(data.byteLength);

const region = readRegion(data);
console.log(region.at(17));
// console.log(region.length);

const chunks = await readChunks(region);
// console.log(chunks.slice(17,19));
// console.log(chunks.length);

const recompile = (await writeChunks(chunks))
  .map(entry => entry === null ? entry : { ...entry, data: Buffer.from(entry.data) });
console.log(recompile.at(17));
// console.log(recompile.length);

const rebundle = writeRegion(recompile)
  .map(entry => entry === null ? entry : { ...entry, data: Buffer.from(entry.data) });
console.log(rebundle.at(17));