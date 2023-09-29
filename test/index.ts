// @ts-nocheck

import { readFile } from "node:fs/promises";
import { readRegion, readLocations, readChunkLocation, writeChunk } from "../src/index.js";

const REGION = new URL("./r.2.1.mca",import.meta.url);

const data = await readFile(REGION);
const region = await readRegion(data);
// console.log(region);

// const regionData = readLocations(data)
//   .map(location => readChunkLocation(data,location))
//   .filter((chunkData): chunkData is Uint8Array => chunkData !== null);

// for (const chunkData of regionData) console.log(chunkData);

// console.log(new Set(regionData.map(chunkData => chunkData.byteLength)));

// for (const chunk of region){
//   if (chunk === null) continue;
//   const { xPos, yPos, zPos } = chunk.data;
//   console.log({ xPos, yPos, zPos });
// }

// console.log(region.length);