import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  CommonService,
  DrawerService,
  LocalStorageService,
} from '../../services';
import { DomSanitizer } from '@angular/platform-browser';
import { TimeTrackingCalculateService } from '../../features/time-tracking/time-tracking-calculate.service';

@Component({
  template: ``,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class FormBaseComponent implements OnInit, OnDestroy {
  formGroup: FormGroup = new FormGroup({});

  renderer = this.injector.get(Renderer2);
  formBuilder = this.injector.get(FormBuilder);
  changeDetectorRef = this.injector.get(ChangeDetectorRef);
  drawerService = this.injector.get(DrawerService);
  messageService = this.injector.get(MessageService);
  sanitizer = this.injector.get(DomSanitizer);
  confirmationService = this.injector.get(ConfirmationService);
  localStorageService = this.injector.get(LocalStorageService);
  commonService = this.injector.get(CommonService);
  timeTrackingCalculateService = this.injector.get(
    TimeTrackingCalculateService,
  );

  onDestroy$: Subject<any> = new Subject<any>();

  constructor(protected injector: Injector) {}

  ngOnInit() {
    console.log('FormBaseComponent - ngOnInit');
  }

  ngOnDestroy() {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  getControlValue(controlName: string, customFormGroup?: FormGroup) {
    const value = this.getControl(controlName, customFormGroup)?.value;
    return ![null, undefined, NaN].includes(value) ? value : null;
  }

  getControl(controlName: string, customFormGroup?: FormGroup) {
    const formGroup = customFormGroup ?? this.formGroup;
    return formGroup.get(controlName);
  }

  getControlValueChanges(
    controlName: string,
    customFormGroup?: FormGroup,
  ): Observable<any> {
    const control = this.getControl(controlName, customFormGroup);
    return control ? control.valueChanges : new Observable(); // Tránh lỗi nếu control không tồn tại
  }

  getSubFormGroupInFormArray(formArray: FormArray, index: number): FormGroup {
    return formArray?.at(index) as FormGroup;
  }

  getFormControlInSubFormGroup(
    formArray: FormArray,
    index: number,
    formControlName: string,
  ): FormControl {
    return this.getSubFormGroupInFormArray(formArray, index)?.get(
      formControlName,
    ) as FormControl;
  }

  mapRowDataToType<U>(rowData: U): U {
    return rowData as U;
  }

  convertISOString(value: string): Date {
    return new Date(value);
  }
}
