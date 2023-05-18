import { LOCATIONS_LENGTH } from "./location.js";

export const TIMESTAMP_LENGTH = 4;
export const TIMESTAMPS_LENGTH = 4096;

export function* readTimestamps(data: Uint8Array): Generator<number,void,void> {
  const view = new DataView(data.buffer,data.byteOffset,data.byteLength);

  for (let i = LOCATIONS_LENGTH; i < LOCATIONS_LENGTH + TIMESTAMPS_LENGTH; i += TIMESTAMP_LENGTH){
    yield view.getUint32(i);
  }
}