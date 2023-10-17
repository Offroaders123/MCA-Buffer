import { readFile } from "node:fs/promises";
import { readRegion, readChunks } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);

const region = readRegion(data);
console.log(region.slice(17,19));
console.log(region.length);

const chunks = await readChunks(region);
console.log(chunks.slice(17,19));
console.log(chunks.length);