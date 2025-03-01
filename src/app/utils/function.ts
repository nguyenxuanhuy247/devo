import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { FormBaseComponent } from '../shared';
import { Component, inject } from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { SELECT_FORM_GROUP_KEY } from '../features/time-tracking/time-tracking.model';
import { IOption } from '../shared/interface/common.interface';

export function getValue<T>(obs: Observable<T>): T {
  let value: T;

  obs.subscribe((res) => {
    value = res;
  });

  return _.cloneDeep(value);
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function ExtendedFormBase<
  U,
  T extends Constructor<FormBaseComponent> = Constructor<FormBaseComponent>,
>(Base: T) {
  @Component({
    selector: 'app-form',
    template: ``,
  })
  class ExtendedComponent extends Base {
    formGroupControl = inject(ControlContainer).control as FormGroup;

    protected getCommonValue() {
      const commonValue = _.cloneDeep(this.formGroupControl.value);
      delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
      delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
      delete commonValue[SELECT_FORM_GROUP_KEY.formArray];

      return commonValue;
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

  return ExtendedComponent;
}
