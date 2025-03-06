import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBaseComponent } from '../base/form-base.component';
import {
  ControlContainer,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { IOption } from '../interface/common.interface';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { SELECT_FORM_GROUP_KEY } from 'src/app/features/time-tracking/time-tracking.model';
import * as _ from 'lodash';

@Component({
  selector: 'app-tab-component-base',
  imports: [CommonModule],
  templateUrl: './tab-component-base.component.html',
  styleUrl: './tab-component-base.component.css',
})
export class TabComponentBaseComponent extends FormBaseComponent {
  private blinkInterval: any;
  private originalTitle = 'devo';
  private warningTitle = '⚠️ Chưa điền thời gian bắt đầu';
  formGroupControl!: FormGroup;
  controlContainer = this.injector.get(ControlContainer);

  override ngOnInit() {
    super.ngOnInit();
    this.formGroupControl = this.controlContainer.control as FormGroup;

    // Cảnh báo khi người dùng chuyển Tab
    document.addEventListener(
      'visibilitychange',
      this.warningWhenChangeChromeTab,
    );
    this.warningWhenChangeChromeTab();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();

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
    this.clearBlinking();
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

  onSetCurrentTimeForDatepicker(
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

  isSelectAll: boolean = false;
  selectedNumber: number = 0;
  indexListBatch: number[] = [];
  [key: string]: any;

  getSelectedNumberAndIds(
    formArray: FormArray,
    listBatchName: string = 'indexListBatch',
  ) {
    this[listBatchName] = [];
    formArray.value.forEach((rowData: any, index: number) => {
      if (rowData.selected) {
        this[listBatchName].push(index);
      }
    });
    this[listBatchName].sort((a: number, b: number) => b - a);
  }

  toggleSelectAll(
    event: CheckboxChangeEvent,
    formArray: FormArray,
    listBatchName: string = 'indexListBatch',
    isSelectAllName: string = 'isSelectAll',
  ) {
    this[isSelectAllName] = event.checked;
    formArray.controls.forEach((control) => {
      control.patchValue({
        selected: this[isSelectAllName],
      });
    });

    this.getSelectedNumberAndIds(formArray, listBatchName);
  }

  onRowSelectionChange(
    event: CheckboxChangeEvent,
    formArray: FormArray,
    index: number,
    listBatchName: string = 'indexListBatch',
    isSelectAllName: string = 'isSelectAll',
  ) {
    formArray.at(index).patchValue({
      selected: event.checked,
    });
    this[isSelectAllName] = formArray.value.every((row: any) => row.selected);

    this.getSelectedNumberAndIds(formArray, listBatchName);
  }

  protected getCommonValue() {
    const commonValue = _.cloneDeep(this.formGroupControl.value);
    delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
    delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
    delete commonValue[SELECT_FORM_GROUP_KEY.formArray];

    return commonValue;
  }
}
