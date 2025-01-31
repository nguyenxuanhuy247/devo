import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { DrawerService } from '../../services/drawer.service';

@Component({
  template: ``,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export abstract class FormBaseComponent implements OnDestroy {
  formGroup: FormGroup = new FormGroup({});

  renderer = this.injector.get(Renderer2);
  formBuilder = this.injector.get(FormBuilder);
  changeDetectorRef = this.injector.get(ChangeDetectorRef);
  drawerService = this.injector.get(DrawerService);
  onDestroy$: Subject<any> = new Subject<any>();

  constructor(protected injector: Injector) {}

  ngOnDestroy() {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  getControl(controlName: string, customFormGroup?: FormGroup) {
    const formGroup = customFormGroup ?? this.formGroup;
    return formGroup.get(controlName);
  }

  getControlValue(controlName: string, customFormGroup?: FormGroup) {
    const value = this.getControl(controlName, customFormGroup).value;
    return ![null, undefined, NaN].includes(value) ? value : null;
  }

  getControlValueChanges(
    controlName: string,
    customFormGroup?: FormGroup,
  ): Observable<any> {
    return this.getControl(controlName, customFormGroup).valueChanges;
  }
}
