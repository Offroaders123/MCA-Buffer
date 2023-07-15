import { readFile } from "node:fs/promises";
import { readRegion } from "../src/index.js";

const REGION = new URL("./test-flat!/region/r.0.0.mca",import.meta.url);

const data = await readFile(REGION);
const region = await readRegion(data);

for (const chunk of region){
  if (chunk === null) continue;
  const { xPos, yPos, zPos } = chunk.data;
  console.log({ xPos, yPos, zPos });
}

console.log(region.length);