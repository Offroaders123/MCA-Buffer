export const LOCATION_LENGTH = 4;
export const LOCATIONS_LENGTH = 4096;
export const LOCATIONS_OFFSET = 0;

export interface Location {
  byteOffset: number;
  byteLength: number;
}

export function readLocations(region: Uint8Array): Location[] {
  const view = new DataView(region.buffer,region.byteOffset,region.byteLength);
  const locations: Location[] = [];

  for (let i = LOCATIONS_OFFSET; i < LOCATIONS_OFFSET + LOCATIONS_LENGTH; i += LOCATION_LENGTH){
    const byteOffset = (view.getUint32(i) >> 8) * LOCATIONS_LENGTH;
    const byteLength = view.getUint8(i + 3) * LOCATIONS_LENGTH;
    locations.push({ byteOffset, byteLength });
  }

  return locations;
}