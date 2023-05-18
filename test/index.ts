import { readFile } from "node:fs/promises";
import { readRegion } from "../src/index.js";

const REGION = new URL("./test-flat!/region/r.0.0.mca",import.meta.url);

const data = await readFile(REGION);
// console.log(data.subarray(0,800).join(" "));

const region = await readRegion(data);
// console.log(region);