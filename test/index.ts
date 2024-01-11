import { readFile } from "node:fs/promises";
import { readRegion } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
console.log(data);

const region = await readRegion(data);
region.forEach(chunk => console.log(chunk));