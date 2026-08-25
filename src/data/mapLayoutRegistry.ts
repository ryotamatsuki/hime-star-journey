import dogoD0 from "./map-layouts/dogo-D0.json";
import castleC0 from "./map-layouts/castle-C0.json";
import shimanamiA20 from "./map-layouts/shimanami-A2-0.json";
import shimanamiA21 from "./map-layouts/shimanami-A2-1.json";
import shimanamiA22 from "./map-layouts/shimanami-A2-2.json";
import shimanamiA23 from "./map-layouts/shimanami-A2-3.json";
import shimanamiA24 from "./map-layouts/shimanami-A2-4.json";
import shimanamiA25 from "./map-layouts/shimanami-A2-5.json";
import type { MapLayoutData, MapLayoutSummary, PositionedMapObject } from "../types/mapLayout";

const layouts = [
  dogoD0,
  castleC0,
  shimanamiA20,
  shimanamiA21,
  shimanamiA22,
  shimanamiA23,
  shimanamiA24,
  shimanamiA25
] as MapLayoutData[];

export const mapLayoutRegistry: Record<string, MapLayoutData> = Object.fromEntries(
  layouts.map((layout) => [getMapLayoutId(layout.locationId, layout.areaId), layout])
);

export function getMapLayoutId(locationId: string, areaId: string): string {
  return `${locationId}-${areaId}`;
}

export function getMapLayout(locationId: string, areaId: string): MapLayoutData | undefined {
  return mapLayoutRegistry[getMapLayoutId(normalizeLocationId(locationId), areaId)];
}

export function listMapLayouts(): MapLayoutSummary[] {
  return Object.entries(mapLayoutRegistry).map(([id, layout]) => ({
    id,
    label: `${layout.name} (${layout.locationId}/${layout.areaId})`,
    locationId: layout.locationId,
    areaId: layout.areaId
  }));
}

export function getPositionedObject(
  objects: PositionedMapObject[],
  id: string
): PositionedMapObject | undefined {
  return objects.find((object) => object.id === id);
}

export function normalizeLocationId(locationId: string): string {
  return locationId === "dogo_onsen" ? "dogo" : locationId;
}
