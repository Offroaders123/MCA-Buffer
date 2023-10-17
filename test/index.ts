import { readFile } from "node:fs/promises";
import { readRegion, readEntry } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);

const region = readRegion(data);
// console.log(region);
// console.log(region.length);

const chunk = await readEntry(region[140]!);
console.log(chunk);