import { Chunk } from "./chunk.js";

export interface Location {
  offset: number;
  length: number;
}

export class Region extends Array<Chunk | null> {
  static async read(data: Uint8Array) {
    const locations = this.readLocations(data);
    const chunks = await Promise.all(locations.map(location => this.readChunk(data,location)));
    return new Region(...chunks);
  }

  static readLocations(data: Uint8Array) {
    data = data.subarray(0,4096);

    const view = new DataView(data.buffer,data.byteOffset,data.byteLength);
    const locations: Location[] = [];

    for (let i = 0; i < data.byteLength; i += 4){
      const offset = (view.getUint32(i) >> 8) * 4096;
      const length = view.getUint8(i + 3) * 4096;
      locations.push({ offset, length });
      break; // For testing
    }

    return locations;
  }

  static async readChunk(data: Uint8Array, { offset, length }: Location) {
    if (offset === 0 && length === 0) return null;

    const chunk = data.subarray(offset,offset + length);
    return Chunk.read(chunk);
  }
}