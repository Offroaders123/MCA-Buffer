import { readFile } from "node:fs/promises";
import { readRegion } from "../src/index.js";

const REGION = new URL("./test-flat!/region/r.0.0.mca",import.meta.url);

const data = await readFile(REGION);
// console.log(data.subarray(0,800).join(" "));

const region = await fromAsync(readRegion(data));

for (const chunk of region){
  console.log(chunk);
}

async function fromAsync<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];

  for await (const entry of generator){
    results.push(entry);
  }

  return results;
}