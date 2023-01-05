// @ts-check

import * as fs from "node:fs/promises";
import { Region } from "../dist/index.js";

const data = await fs.readFile(new URL("./test-flat!/region/r.0.0.mca",import.meta.url));
// console.log(data.subarray(0,800).join(" "));

const region = await Region.read(data);
// console.log(region);

for (const chunk of region){
  console.log(chunk);
}