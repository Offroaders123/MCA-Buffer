import { readFile } from "node:fs/promises";
import { readEntries, readRegion, writeRegion } from "../src/index.js";

import type { Region } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);

// region data
const region = readRegion(data);

// nice for logging
const prettyRegion = prettyPrint([...region].slice(15,20));
console.log(prettyRegion);

const entries = readEntries(region);
console.log(entries.slice(15,20));

// const redata = Buffer.from(writeRegion(region).buffer);
// console.log(redata);

// console.log("\nequality comparison:",Buffer.compare(data,redata),"== 0");

function prettyPrint(region: Region): Omit<Region[number], "data">[] {
  return region.map(({ index, timestamp, byteOffset, byteLength }) => ({ index, timestamp, byteOffset, byteLength }));
}