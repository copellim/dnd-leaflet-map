import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MarkerData } from '../../types/marker-data';
import { MapComponent } from '../map/map.component';
import { MarkerDetailsComponent } from '../marker-details/marker-details.component';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MapComponent,
    MatButtonModule,
    MatIconModule,
    MatBottomSheetModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private _bottomSheet = inject(MatBottomSheet);
  editModeEnabled = signal(false);

  enableEditMode() {
    this.editModeEnabled.set(true);
  }

  disableEditMode() {
    this.editModeEnabled.set(false);
  }

  onMarkerSelected(markerData: MarkerData) {
    if (markerData.id !== undefined) {
      this.editModeEnabled.set(false);
    }
    this._bottomSheet.open(MarkerDetailsComponent, {
      data: markerData,
    });
  }
}
