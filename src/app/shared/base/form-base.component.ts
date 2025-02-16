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
import { ConfirmationService, MessageService } from 'primeng/api';
import { DrawerService, LocalStorageService } from '../../services';
import { DomSanitizer } from '@angular/platform-browser';

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
  messageService = this.injector.get(MessageService);
  sanitizer = this.injector.get(DomSanitizer);
  confirmationService = this.injector.get(ConfirmationService);
  localStorageService = this.injector.get(LocalStorageService);

  onDestroy$: Subject<any> = new Subject<any>();

  constructor(protected injector: Injector) {}

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
}
