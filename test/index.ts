import { readFile } from "node:fs/promises";
import { readRegion, writeRegion, readChunks, writeChunks } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);

const region = readRegion(data);
// console.log(region.slice(17,19));
console.log(region.length);

const chunks = await readChunks(region);
console.log(chunks.slice(17,19));
console.log(chunks.length);

const recompile = await writeChunks(chunks);
// console.log(recompile.slice(17,19));
console.log(recompile.length);

const rebundle = writeRegion(recompile);
console.log(rebundle);