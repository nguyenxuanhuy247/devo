import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { FormBaseComponent } from '../shared';
import {
  ControlContainer,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { SELECT_FORM_GROUP_KEY } from '../features/time-tracking/time-tracking.model';
import { IOption } from '../shared/interface/common.interface';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { IBugFormGroup } from '../features/time-tracking/bug/bug.model';
import { Directive, OnInit } from '@angular/core';

export function getValue<T>(obs: Observable<T>): T {
  let value: T;

  obs.subscribe((res) => {
    value = res;
  });

  return _.cloneDeep(value);
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function ExtendedFormBase<
  T extends Constructor<FormBaseComponent> = Constructor<FormBaseComponent>,
>(Base: T) {
  class ExtendedComponent extends Base {
    formGroupControl!: FormGroup;
    controlContainer = this.injector.get(ControlContainer);

    constructor(...args: any[]) {
      super(...args);
      this.formGroupControl = this.controlContainer.control as FormGroup;
    }

    protected getCommonValue() {
      const commonValue = _.cloneDeep(this.formGroupControl.value);
      delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
      delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
      delete commonValue[SELECT_FORM_GROUP_KEY.formArray];

      return commonValue;
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

    override mapRowDataToType<U>(rowData: U): U {
      return rowData as U;
    }

    isSelectAll: boolean = false;
    selectedNumber: number = 0;
    indexListBatch: number[] = [];

    getSelectedNumberAndIds(formArray: FormArray) {
      this.indexListBatch = [];
      this.selectedNumber = formArray.value.filter(
        (rowData: IBugFormGroup, index: number) => {
          if (rowData.selected) {
            this.indexListBatch.push(index);
          }
          return rowData.selected;
        },
      ).length;
      this.indexListBatch.sort((a, b) => b - a);
    }

    toggleSelectAll(event: CheckboxChangeEvent, formArray: FormArray) {
      this.isSelectAll = event.checked;
      formArray.controls.forEach((control) => {
        control.patchValue({
          selected: this.isSelectAll,
        });
      });

      this.getSelectedNumberAndIds(formArray);
    }

    onRowSelectionChange(
      event: CheckboxChangeEvent,
      formArray: FormArray,
      index: number,
    ) {
      formArray.at(index).patchValue({
        selected: event.checked,
      });
      this.isSelectAll = formArray.value.every(
        (row: IBugFormGroup) => row.selected,
      );

      this.getSelectedNumberAndIds(formArray);
    }
  }

  return ExtendedComponent;
}
