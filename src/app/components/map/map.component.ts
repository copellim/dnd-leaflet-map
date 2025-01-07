import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import L from 'leaflet';
import { combineLatestWith, Observable, Subject, tap } from 'rxjs';
import { MapService } from '../../services/map.service';
import { MarkerService } from '../../services/marker.service';
import { MarkerData } from '../../types/marker-data';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit {
  private mapService = inject(MapService);
  private markerService = inject(MarkerService);
  private destroyRef = inject(DestroyRef);

  editModeEnabled = input(false);
  markerSelected = output<MarkerData>();

  private map?: L.Map;

  private markers$: Observable<MarkerData[]> = toObservable(
    this.markerService.holdings
  );
  private mapInitialized$ = new Subject<void>();

  ngAfterViewInit(): void {
    this.initMap();
    this.syncMarkersWithMap();
    this.mapInitialized$.next();
  }

  editModeEffect = effect(() => {
    if (this.editModeEnabled()) {
      this.enableDraggingForMarkers();
    } else {
      this.disableDraggingForMarkers();
    }
  });

  private initMap(): void {
    this.map = this.mapService.initMap('map');

    this.map.on('click', this.onMapClick.bind(this));
    this.setMapViewWithDelay();
  }

  private onMapClick(e: any): void {
    console.log('clicked', e.latlng);
    if (!this.editModeEnabled()) {
      return;
    }
    const marker: MarkerData = this.markerService.buildEmptyMarker(
      e.latlng.lat,
      e.latlng.lng
    );
    this.markerSelected.emit(marker);
  }

  private setMapViewWithDelay() {
    setTimeout(() => {
      this.map?.invalidateSize();
      this.map?.setView([500, 500], 0, { animate: false });
    }, 50);
  }

  private syncMarkersWithMap() {
    this.mapInitialized$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        combineLatestWith(this.markers$),
        tap(([, markers]) => {
          this.clearAllMarkers();
          markers.forEach(this.addMarker.bind(this));
        })
      )
      .subscribe(() => console.log('Markers updated'));
  }

  private clearAllMarkers() {
    this.map?.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    });
  }

  private addMarker(marker: MarkerData): void {
    if (!this.map) {
      return;
    }
    const leafletMarker = this.markerService.buildMarker(
      marker,
      this.editModeEnabled()
    );
    leafletMarker.on('click', (event) => {
      event.originalEvent.preventDefault();
      this.markerSelected.emit(marker);
    });
    leafletMarker.addTo(this.map);
  }

  private enableDraggingForMarkers() {
    this.map?.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.dragging?.enable();
      }
    });
  }

  private disableDraggingForMarkers() {
    this.map?.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.dragging?.disable();
      }
    });
  }
}
