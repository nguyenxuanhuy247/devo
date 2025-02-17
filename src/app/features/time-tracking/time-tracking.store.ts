import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { IAllDropDownResponseDTO } from './time-tracking.model';

interface ITimeTrackingState {
  allDropdownData: IAllDropDownResponseDTO;
}

const initState: ITimeTrackingState = {
  allDropdownData: null,
};

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingStore extends ComponentStore<ITimeTrackingState> {
  constructor() {
    super(initState);
  }

  readonly allDropdownData$ = this.select((state) => state.allDropdownData);
  readonly setAllDropdownData = this.updater<{
    allDropdownData: IAllDropDownResponseDTO;
  }>((state, { allDropdownData }) => ({
    ...state,
    allDropdownData: allDropdownData,
  }));
}
