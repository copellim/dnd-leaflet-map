import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Database, onValue, ref, remove, set } from '@angular/fire/database';
import L from 'leaflet';
import { HolderData } from '../types/holder';
import { MarkerData } from '../types/marker-data';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  private db: Database = inject(Database);
  private holdersRef = ref(this.db, 'holders');
  private holdingsRef = ref(this.db, 'holdings');

  private readonly defaultMarkerColor = '#776D5A';

  holdings: WritableSignal<MarkerData[]> = signal([]);
  holders: WritableSignal<HolderData[]> = signal([]);

  constructor() {
    this.subscribeToHolders();
    this.subscribeToHoldings();
  }

  buildMarker(marker: MarkerData, isEditMode: boolean): L.Marker {
    const markerHtmlStyles = `
      background-color: ${marker.markerColor};
      width: 2rem;
      height: 2rem;
      display: block;
      left: -1rem;
      top: -1rem;
      position: relative;
      border-radius: 3rem 3rem 0;
      transform: rotate(45deg);
      border: 1px solid #FFFFFF`;

    const icon = L.divIcon({
      className: 'my-custom-pin',
      iconAnchor: [0, 24],
      popupAnchor: [0, -36],
      html: `<span style="${markerHtmlStyles}" />`,
    });

    const builtMarker = L.marker([marker.latitude, marker.longitude], {
      title: marker.id,
      draggable: isEditMode,
      autoPan: true,
      icon: icon,
    });
    builtMarker.on('dragend', this.dragEndCallback.bind(this));
    return builtMarker;
  }

  createMarker(marker: MarkerData): void {
    const id = this.createUuid();
    const newMarker = this.configureMarkerProperties(marker);
    set(ref(this.db, 'holdings/' + id), newMarker);
  }

  updateMarker(marker: MarkerData): void {
    const id = marker.id;
    const newMarker = this.configureMarkerProperties(marker);
    set(ref(this.db, 'holdings/' + id), newMarker);
  }

  deleteMarker(marker: MarkerData): void {
    remove(ref(this.db, 'holdings/' + marker.id));
  }

  buildEmptyMarker(latitude: number, longitude: number): MarkerData {
    return {
      latitude: latitude,
      longitude: longitude,
    };
  }

  private subscribeToHolders() {
    onValue(this.holdersRef, (snapshot) => {
      const holders = snapshot.val();
      if (!holders) {
        console.log('No holders colors found');
        return;
      }
      const holderData: HolderData[] = Object.keys(holders).map((key) => ({
        name: holders[key].holderName,
        color: holders[key].holderColor,
      }));
      this.holders.set(holderData);
    });
  }

  private subscribeToHoldings() {
    onValue(this.holdingsRef, (snapshot) => {
      const holdings = snapshot.val();
      if (!holdings) {
        console.log('No holdings found');
        return;
      }
      const markers: MarkerData[] = Object.keys(holdings).map((key) => ({
        id: key,
        ...holdings[key],
        markerColor: this.holders().find((h) => h.name === holdings[key].holder)
          ?.color,
      }));
      this.holdings.set(markers);
    });
  }

  private createUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private dragEndCallback(event: L.DragEndEvent) {
    const mapMarker = event.target as L.Marker;
    const marker = this.holdings().find(
      (m) => m.id === mapMarker.options.title
    );
    if (!marker) {
      return;
    }
    const updatedMarker: MarkerData = {
      ...marker,
      latitude: mapMarker.getLatLng().lat,
      longitude: mapMarker.getLatLng().lng,
    };
    this.updateMarker(updatedMarker);
  }

  private configureMarkerProperties(marker: MarkerData) {
    const newMarker = this.removeMarkerId(marker);
    newMarker.markerColor = this.getMarkerColor(newMarker.holder);
    return newMarker;
  }

  private removeMarkerId(marker: MarkerData): MarkerData {
    const { id, ...strippedMarker } = marker;
    return strippedMarker;
  }

  private getMarkerColor(holder: string | undefined): string {
    if (!holder) {
      return this.defaultMarkerColor;
    }
    return (
      this.holders().find((h) => h.name === holder)?.color ||
      this.defaultMarkerColor
    );
  }
}
