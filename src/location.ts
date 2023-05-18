export const LOCATION_LENGTH = 4;
export const LOCATIONS_LENGTH = 4096;

export interface Location {
  byteOffset: number;
  byteLength: number;
}

export function* readLocations(data: Uint8Array): Generator<Location,void,void> {
  const view = new DataView(data.buffer,data.byteOffset,data.byteLength);

  for (let i = 0; i < LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    const byteOffset = (view.getUint32(i) >> 8) * LOCATIONS_LENGTH;
    const byteLength = view.getUint8(i + 3) * LOCATIONS_LENGTH;

    yield { byteOffset, byteLength };
  }
}