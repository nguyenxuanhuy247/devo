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
import { IOption } from '../interface/common.interface';

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

  private blinkInterval: any;
  private originalTitle = 'devo';
  private warningTitle = '⚠️ Chưa điền thời gian bắt đầu';

  constructor(protected injector: Injector) {}

  ngOnInit() {
    // Cảnh báo khi người dùng chuyển Tab
    document.addEventListener(
      'visibilitychange',
      this.warningWhenChangeChromeTab,
    );
    this.warningWhenChangeChromeTab();
  }

  ngOnDestroy() {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
    document.removeEventListener(
      'visibilitychange',
      this.warningWhenChangeChromeTab,
    );
    clearInterval(this.blinkInterval);
  }

  /*
   * @usage Hiển thị cảnh báo trên thanh tiêu đề trình duyệt
   */
  warningWhenChangeChromeTab = () => {
    const isStartTimeTracking = this.checkIsTimeTracking();
    console.log('cảnh báo ', isStartTimeTracking);
    if (!isStartTimeTracking) {
      this.startBlinking();
    } else {
      this.clearBlinking();
    }
  };

  protected checkIsTimeTracking(): boolean {
    return false;
  }

  /**
   * @usage Hiển thị nhấp nháy cảnh báo trên Tiêu đề tab trình duyệt
   */
  startBlinking() {
    this.blinkInterval = setInterval(() => {
      document.title =
        document.title === this.originalTitle
          ? this.warningTitle
          : this.originalTitle;
    }, 400);
  }

  clearBlinking() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      document.title = this.originalTitle;
    }
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

  protected onSetCurrentTimeForDatepicker(
    formArray: FormArray,
    index: number,
    formControlName: string,
  ) {
    const control = this.getFormControlInSubFormGroup(
      formArray,
      index,
      formControlName,
    ) as FormControl;
    control.setValue(new Date());
  }

  convertOptionToEnum(data: IOption[]) {
    return Object.freeze(
      data.reduce((acc, { label, value }) => {
        const key = label
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
          .replace(/Đ/g, 'D') // Chuyển "Đ" thành "D"
          .replace(/đ/g, 'd') // Chuyển "đ" thành "d"
          .replace(/\s+/g, '_') // Thay khoảng trắng bằng `_`
          .toUpperCase(); // Chuyển thành chữ in hoa

        acc[key as keyof typeof acc] = value; // Ép kiểu để TypeScript hiểu
        return acc;
      }, {} as Record<string, string>), // Định nghĩa rõ kiểu cho object
    ) as { readonly [K in string]: string };
  }

  mapRowDataToType<U>(rowData: U): U {
    return rowData as U;
  }
}
