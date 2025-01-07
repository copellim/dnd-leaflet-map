import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MarkerService } from '../../services/marker.service';
import { MarkerData } from '../../types/marker-data';

@Component({
  selector: 'app-marker-details',
  imports: [
    CommonModule,
    MatBottomSheetModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './marker-details.component.html',
  styleUrl: './marker-details.component.scss',
})
export class MarkerDetailsComponent implements AfterViewInit {
  @ViewChild('name') name?: ElementRef;

  private _bottomSheetRef =
    inject<MatBottomSheetRef<MarkerDetailsComponent>>(MatBottomSheetRef);
  private formBuilder = inject(FormBuilder);
  private markerService = inject(MarkerService);
  data: MarkerData = inject(MAT_BOTTOM_SHEET_DATA);
  holders = computed(() =>
    this.markerService.holders().map((holder) => holder.name)
  );

  markerForm: FormGroup;

  isReadonly = this.data.id !== undefined;

  constructor() {
    this.markerForm = this.formBuilder.group({
      id: [{ hidden: true }],
      name: [],
      population: [],
      chief: [],
      extendedInfo: [],
      latitude: [{ hidden: true }],
      longitude: [{ hidden: true }],
      inn1: [],
      inn2: [],
      inn3: [],
      holder: [],
      markerColor: [],
    });

    if (this.data) {
      console.log(this.data);
      this.markerForm.patchValue(this.data);
      this.markerForm.get('holder')?.setValue(this.data.holder);
    }
  }
  ngAfterViewInit(): void {
    this.setReadonlyState(this.data.id !== undefined);
  }

  setReadonlyState(isReadonly: boolean) {
    this.isReadonly = isReadonly;
    if (isReadonly) {
      this.markerForm.disable();
    } else {
      this.markerForm.enable();
      this.name?.nativeElement.focus();
    }
  }

  save() {
    if (this.isNameFieldEmpty()) {
      this.markerForm.get('name')?.setErrors({ required: true });
      return;
    }
    if (this.data.id === undefined) {
      this.markerService.createMarker(this.markerForm.value);
    } else {
      this.markerService.updateMarker(this.markerForm.value);
    }
    this.close();
  }

  deleteMarker() {
    this.markerService.deleteMarker(this.data);
    this.close();
  }

  close() {
    this._bottomSheetRef.dismiss();
  }

  private isNameFieldEmpty() {
    return (
      this.markerForm.get('name')?.value === '' ||
      this.markerForm.get('name')?.value === null
    );
  }
}
