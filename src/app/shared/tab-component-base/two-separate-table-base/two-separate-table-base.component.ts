import { booleanAttribute, Component, input, signal } from '@angular/core';
import { TabComponentBaseComponent } from '../tab-component-base.component';
import { ID } from '../../interface/common.interface';
import { FormArray, FormGroup } from '@angular/forms';
import { ELogStorageKey } from '../../../services';
import { IBugRowData } from '../../../features/time-tracking/bug/bug.model';
import { EApiMethod, EMode } from '../../../contants/common.constant';
import {
  ESheetName,
  ITimeTrackingDoPostRequestDTO,
} from '../../../features/time-tracking/time-tracking.dto';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-two-separate-table-base',
  imports: [],
  template: '',
})
export class TwoSeparateTableBaseComponent extends TabComponentBaseComponent {
  hasBatchCreate = input(true, { transform: booleanAttribute });

  createFormArray: FormArray = new FormArray([]);
  viewUpdateFormArray: FormArray = new FormArray([]);
  batchUpdateFormGroup: FormGroup;
  batchUpdateViewUpdateFormGroup: FormGroup;

  createIndexListBatch: number[] = [];
  isCreateSelectAll: boolean = false;
  viewUpdateIdListBatch: ID[] = [];
  isViewUpdateSelectAll: boolean = false;

  sheetName = signal<ESheetName>(ESheetName.LOG_WORK);

  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: this.sheetName(),
    ids: null,
    data: null,
  });

  override ngOnInit() {
    super.ngOnInit();

    this.batchUpdateFormGroup = this.formBuilder.group({
      moduleId: null,
      menuId: null,
      screenId: null,
      featureId: null,
      categoryId: null,
    });

    this.batchUpdateViewUpdateFormGroup = this.formBuilder.group({
      moduleId: null,
      menuId: null,
      screenId: null,
      featureId: null,
      categoryId: null,
      statusId: null,
    });
  }

  onAddNewCreateRow() {
    const formGroup = this.createNewFormGroup();

    this.createFormArray.push(formGroup);
  }

  createNewFormGroup() {
    return this.formBuilder.group({
      ...this.initRowDataObj,
      mode: EMode.CREATE,
    });
  }

  onBatchDeleteCreateRow() {
    this.createIndexListBatch.forEach((index: number) => {
      this.createFormArray.removeAt(index);
    });
    if (this.isCreateSelectAll) {
      this.onAddNewCreateRow();
    }
    this.isCreateSelectAll = false;
    this.createIndexListBatch = [];
  }

  onBatchUpdateCreateRow() {
    const batchUpdateFormValue = this.batchUpdateFormGroup.value;
    this.createFormArray.controls.forEach((control, index: number) => {
      if (this.createIndexListBatch.includes(index)) {
        control.patchValue({
          ...batchUpdateFormValue,
        });
      }
    });
    this.batchUpdateFormGroup.reset();
  }

  onRecoverCurrentLog() {
    const value = this.localStorageService.getItem(
      ELogStorageKey.CURRENT_BUG,
    ) as IBugRowData;
    if (value) {
      const formGroup = this.formBuilder.group({
        ...value,
        startTime: value.startTime ? new Date(value.startTime) : null,
        endTime: value.endTime ? new Date(value.endTime) : null,
      });
      if (this.createFormArray.controls.length > 1) {
        this.createFormArray.insert(0, formGroup);
      } else {
        this.createFormArray.patchValue([formGroup.value]);
      }
    }
    this.warningWhenChangeChromeTab();
  }

  /*
   * @usage Xóa nhiều
   */
  onBatchDeleteViewRow() {
    this.timeTrackingStore.setLoading(true);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      sheetName: this.sheetName(),
      ids: [...this.viewUpdateIdListBatch],
      method: EApiMethod.DELETE,
    }));

    this.callAPIDeleteRows();
  }

  callAPIDeleteRows() {
    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .deleteItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Xóa bug thất bại, kiểm tra hàm onDelete`,
          });

          this.timeTrackingStore.setLoading(false);
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: res?.message,
        });

        this.viewUpdateIdListBatch = [];
        this.isViewUpdateSelectAll = false;
        this.callAPIGetTableData();
      });
  }

  onChangeToUpdateMode(index: number) {
    const formGroup = this.getFormGroup(index, this.viewUpdateFormArray);
    formGroup.patchValue({ mode: EMode.UPDATE });
  }

  getFormGroup(index: number, formArray: FormArray): FormGroup {
    return this.getSubFormGroupInFormArray(formArray, index);
  }
}
