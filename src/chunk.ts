import { inflate } from "node:zlib";
import { promisify } from "node:util";
import { read } from "nbtify";

export type CompressionFormat = 1 | 2 | 3;

export interface CompressionHeader {
  length: number;
  compression: CompressionFormat;
}

export class Chunk {
  static async read(data: Uint8Array) {
    data = await this.decompress(data);

    const { data: result } = await read(data,{ endian: "big", compression: null, isNamed: true, isBedrockLevel: false });

    return result;
  }

  static readCompressionHeader(data: Uint8Array) {
    const view = new DataView(data.buffer,data.byteOffset,data.byteLength);

    const length = view.getUint32(0);
    const compression = view.getUint8(4);

    return { length, compression } as CompressionHeader;
  }

  static async decompress(data: Uint8Array) {
    const { length, compression } = this.readCompressionHeader(data);
    // console.log(length,compression);

    data = data.subarray(5,5 + length - 1);
    data = new Uint8Array(await promisify(inflate)(data));

    return data;
  }
}