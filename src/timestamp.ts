import { LOCATIONS_LENGTH } from "./location.js";

export const TIMESTAMP_LENGTH = 4;
export const TIMESTAMPS_LENGTH = 4096;
export const TIMESTAMPS_OFFSET = LOCATIONS_LENGTH;

export type Timestamp = number;

export function readTimestamps(data: Uint8Array): Timestamp[] {
  const view = new DataView(data.buffer,data.byteOffset,data.byteLength);
  const timestamps: Timestamp[] = [];

  for (let i = TIMESTAMPS_OFFSET; i < TIMESTAMPS_OFFSET + TIMESTAMPS_LENGTH; i += TIMESTAMP_LENGTH){
    const timestamp = view.getUint32(i);
    timestamps.push(timestamp);
  }

  return timestamps;
}