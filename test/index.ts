import { readFile } from "node:fs/promises";
import { readRegion } from "../src/index.js";

import type { Chunk } from "../src/index.js";

const AXES: [number,number][] = [
  [-1,-1],
  [-1,-2],
  [-1,0],
  [0,-1],
  [0,-2],
  [0,0]
];

const REGIONS = AXES.map(([x,y]) => new URL(`./test-flat!/region/r.${x}.${y}.mca`,import.meta.url));

const datas = await Promise.all(REGIONS.map(axis => readFile(axis)));
// console.log(data.subarray(0,800).join(" "));
for (const data of datas) console.log(data);

const regions = await Promise.all(datas.map(data => readRegion(data)));
console.log(regions);