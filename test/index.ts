import { readFile } from "node:fs/promises";
import { readRegion } from "../src/index.js";

import type { Region } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);

const region = prettyPrint([...readRegion(data)].slice(15,20));
console.log(region);

region.sort((a,b) => a.byteOffset - b.byteOffset);
console.log(region);

region.sort((a,b) => a.index - b.index);
console.log(region);

function prettyPrint(region: Region): Omit<Region[number], "data">[] {
  return region.map(({ index, timestamp, byteOffset }) => ({ index, timestamp, byteOffset }));
}