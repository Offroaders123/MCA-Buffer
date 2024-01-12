import { readFile } from "node:fs/promises";
import { readRegion, writeRegion } from "../src/index.js";

import type { Region } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);

// region data
const region = readRegion(data);

// nice for logging
const prettyRegion = region.slice(15,20);
console.log(prettyRegion);

const redata = Buffer.from(writeRegion(region).buffer);
console.log(redata);

console.log("\nequality comparison:",Buffer.compare(data,redata),"== 0");

function prettyPrint(region: Region): Omit<Region[number], "data">[] {
  return region.map(({ index, timestamp, byteOffset }) => ({ index, timestamp, byteOffset }));
}