import { Injectable } from '@angular/core';
import L from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private imageBounds: L.LatLngBoundsExpression = [
    [0, 0],
    [1000, 1000],
  ];
  private mapUrl = 'assets/map-image.jpg';

  initMap(mapName: string): L.Map {
    const map = L.map(mapName, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 1,
    });

    L.imageOverlay(this.mapUrl, this.imageBounds).addTo(map);

    return map;
  }
}
