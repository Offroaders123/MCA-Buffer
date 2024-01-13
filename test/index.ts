import { readFile } from "node:fs/promises";
import { ENTRY_HEADER_LENGTH, ENTRY_LENGTH, readRegion, writeRegion } from "../src/index.js";

import type { Region } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
// console.log(data);

// region data
const region = readRegion(data);

// nice for logging
const prettyRegion = region;
// console.log(prettyRegion);

for (const entry of prettyRegion){
  if (entry.data === null){
    console.log(null);
    continue;
  }

  const start = Buffer.from(entry.data.buffer,entry.data.byteOffset,entry.byteLength);
  const startLength = start.byteLength;

  const readLength = start.readUInt32BE(0) - 1;
  const readScheme = start.readUInt8(4);
  const read = entry.data.subarray(ENTRY_HEADER_LENGTH,ENTRY_HEADER_LENGTH + readLength);

  const writeLength = Math.ceil(readLength / ENTRY_LENGTH) * ENTRY_LENGTH;
  const write = Buffer.alloc(writeLength);
  write.writeUInt32BE(readLength + 1,0);
  write.writeUInt8(readScheme,4);
  write.set(read,ENTRY_HEADER_LENGTH);

  const compare = Buffer.compare(start,write);

  if (compare === 0) continue;
  console.log([
    { startLength },
    { readLength, readScheme },
    { writeLength },
    ["compare:",compare]
  ]);
  console.log(start,write);
}

// const redata = Buffer.from(writeRegion(region).buffer);
// // console.log(redata);

// console.log("\nequality comparison:",Buffer.compare(data,redata),"== 0");

// function prettyPrint(region: Region): Omit<Region[number], "data">[] {
//   return region.map(({ index, timestamp, byteOffset }) => ({ index, timestamp, byteOffset }));
// }