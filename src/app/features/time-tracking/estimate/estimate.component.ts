import { Component, Injector, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ISelectFormGroup,
  ITabComponent,
  SELECT_FORM_GROUP_KEY,
} from '../time-tracking.model';
import {
  EGetApiMode,
  ESheetName,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../time-tracking.dto';
import {
  DATE_FORMAT,
  EApiMethod,
  EMode,
} from '../../../contants/common.constant';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  IColumnHeaderConfigs,
  ID,
} from 'src/app/shared/interface/common.interface';
import {
  ESTIMATE_COLUMN_FIELD,
  ESTIMATE_FORM_GROUP_KEY,
  estimateHeaderColumnConfigs,
  estimateNullableObj,
  IEstimateRowData,
} from './estimate.model';
import { TimeTrackingApiService } from '../time-tracking-api.service';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { message } from 'src/app/contants/api.contant';
import { LibFormSelectComponent } from 'src/app/components';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { ConvertIdToNamePipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { TimeTrackingStore } from '../time-tracking.store';
import { WorkDurationDirective } from '../../../directives';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TabComponentBaseComponent } from 'src/app/shared/tab-component-base/tab-component-base.component';
import { IEstimateResponseDTO } from './estimate.dto.model';
import { PopoverModule } from 'primeng/popover';
import { ISSUES_FORM_GROUP_KEYS } from '../issues/issues.model';
import { IBugRowData } from '../bug/bug.model';

@Component({
  selector: 'app-estimate',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    LibFormSelectComponent,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    TagModule,
    ConvertIdToNamePipe,
    WorkDurationDirective,
    InputTextModule,
    TextareaModule,
    PopoverModule,
  ],
  templateUrl: './estimate.component.html',
  styleUrl: './estimate.component.scss',
})
export class EstimateComponent
  extends TabComponentBaseComponent
  implements OnInit, ITabComponent
{
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  headerColumnConfigs: IColumnHeaderConfigs[] = estimateHeaderColumnConfigs;
  isLoading = signal(false);
  createFormArray: FormArray = new FormArray([]);
  viewUpdateFormArray: FormArray = new FormArray([]);
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: ESheetName.ESTIMATE,
    ids: null,
    data: null,
  });
  doGetRequestDTO = signal<ITimeTrackingDoGetRequestDTO>({
    method: EApiMethod.GET,
    mode: EGetApiMode.TABLE_DATA,
    employeeLevelId: null,
    employeeId: null,
    projectId: null,
    issueId: null,
    sheetName: null,
    startTime: null,
    endTime: null,
  });
  timeTrackingService = this.injector.get(TimeTrackingApiService);
  subscription: Subscription = new Subscription();
  tableData: IEstimateRowData[] = [];
  createFormGroup!: FormGroup;
  fixedRowData: IEstimateRowData[] = [];
  protected readonly FORM_GROUP_KEY = ESTIMATE_FORM_GROUP_KEY;
  protected readonly COLUMN_FIELD = ESTIMATE_COLUMN_FIELD;
  protected readonly EMode = EMode;
  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  allDropdownData$ = this.timeTrackingStore.allDropdownData$;
  moduleDependentOptions$ = this.timeTrackingStore.moduleDependentOptions$;
  menuDependentOptions$ = this.timeTrackingStore.menuDependentOptions$;
  screenDependentOptions$ = this.timeTrackingStore.screenDependentOptions$;
  featureDependentOptions$ = this.timeTrackingStore.featureDependentOptions$;
  categoryOptions$ = this.timeTrackingStore.categoryOptions$;
  issueDependentScreenOptions$ =
    this.timeTrackingStore.issueDependentScreenOptions$;

  private getTableDataApiRequest$ = new Subject<void>(); // Subject để trigger API call
  batchUpdateFormGroup: FormGroup;

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.batchUpdateFormGroup = this.formBuilder.group({
      moduleId: null,
      menuId: null,
      screenId: null,
      featureId: null,
      categoryId: null,
    });

    this.onAddNewCreateRow();

    this.initSubscriptions();
  }

  initSubscriptions() {
    this.subscription.add(
      this.getTableDataApiRequest$
        .pipe(
          debounceTime(300), // Giảm số lần gọi API nếu nhiều yêu cầu liên tiếp
          switchMap(() => {
            this.timeTrackingStore.setLoading(true);
            this.doGetRequestDTO.update((oldValue: any) => {
              const formGroupValue =
                this.formGroupControl.getRawValue() as ISelectFormGroup;

              return {
                ...oldValue,
                employeeLevelId: formGroupValue.employeeLevelId,
                employeeId: formGroupValue.employeeId,
                projectId: formGroupValue.projectId,
                startTime: formGroupValue.dateRange[0].toISOString(),
                endTime: formGroupValue.dateRange[1].toISOString(),
                sheetName: ESheetName.ESTIMATE,
              };
            });

            return this.timeTrackingService
              .getListAsync(this.doGetRequestDTO())
              .pipe(
                catchError(() => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Thất bại',
                    detail: message.serverError,
                  });
                  return EMPTY;
                }),
                finalize(() => {
                  this.timeTrackingStore.setLoading(false);
                }),
              );
          }),
        )
        .subscribe((listData: IEstimateResponseDTO[]) => {
          this.mode.set(EMode.VIEW);
          this.viewUpdateFormArray.clear();

          listData.forEach((rowData) => {
            const formGroup = this.formBuilder.group({
              ...rowData,
              mode: EMode.VIEW,
              isLunchBreak: true,
              startTime: rowData.startTime ? new Date(rowData.startTime) : null,
              endTime: rowData.endTime ? new Date(rowData.endTime) : null,
            });
            this.viewUpdateFormArray.push(formGroup);
          });

          this.totalDuration = listData.reduce(
            (acc, rowData) => acc + (rowData.duration ? rowData.duration : 0),
            0,
          );

          this.warningWhenChangeChromeTab();
        }),
    );

    this.subscription.add(
      this.getControlValueChanges(
        SELECT_FORM_GROUP_KEY.dateRange,
        this.formGroupControl,
      )
        .pipe(filter((dataRange) => !!dataRange))
        .subscribe(() => {
          // Sau khi thiết lập các giá trị chung như Level, Nhân viên, dự án, thời gian mới gọi API lấy danh sách
          this.callAPIGetTableData();
        }),
    );
  }

  onCancelUpdateMode(index: number) {
    this.mode.set(EMode.VIEW);
    this.getSubFormGroupInFormArray(this.viewUpdateFormArray, index).patchValue(
      {
        mode: EMode.VIEW,
      },
    );
  }

  /**
   * @usage Cập nhật bản ghi
   */
  onSaveUpdate(index: number) {
    this.isLoading.set(true);
    const value = this.viewUpdateFormArray?.at(index)?.value;
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.PUT,
      data: [
        {
          ...value,
          updatedDate: new Date(),
        },
      ],
    }));

    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .updateItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Cập nhật Log work thất bại, kiểm tra hàm onSaveUpdate`,
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
        this.mode.set(EMode.VIEW);
        this.callAPIGetTableData();
      });
  }

  callAPIGetTableData(): void {
    this.getTableDataApiRequest$.next();
  }

  getFormGroup(index: number, formArray: FormArray): FormGroup {
    return this.getSubFormGroupInFormArray(formArray, index);
  }

  getFormControl(index: number, formControlName: string): FormControl {
    return this.createFormArray?.at(index)?.get(formControlName) as FormControl;
  }

  onDelete(rowData: IEstimateRowData) {
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      ids: [rowData.id],
      method: EApiMethod.DELETE,
    }));

    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .deleteItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Xóa Log work thất bại, kiểm tra hàm onDelete`,
          });
          this.timeTrackingStore.setLoading(false);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.callAPIGetTableData();
      });
  }

  onChangeToUpdateMode(index: number) {
    this.mode.set(EMode.UPDATE);

    const formGroup = this.getFormGroup(index, this.viewUpdateFormArray);
    formGroup.patchValue({ mode: EMode.UPDATE });
  }

  onSaveCreate(index: number) {
    const data: IEstimateRowData = {
      ...this.createFormGroup.value,
      ...this.getCommonValue(),
      createdDate: new Date(),
      updatedDate: null,
    };

    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      sheetName: ESheetName.ESTIMATE,
      data: [data],
    }));

    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .createItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Thêm mới Log work thất bại, kiểm tra hàm onSaveCreate`,
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

        this.onResetCreateForm();
        this.callAPIGetTableData();
      });
  }

  onResetCreateForm() {
    this.createFormGroup.reset();
  }

  onDuplicateExistingItem(rowData: IEstimateRowData) {
    this.createFormGroup.patchValue(rowData);
  }

  onBatchRemoveCreateRow() {
    this.createIndexListBatch.forEach((index: number) => {
      this.createFormArray.removeAt(index);
    });
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

  onRecoverCurrentLog() {}

  onAddNewCreateRow() {
    const formGroup = this.formBuilder.group({
      ...estimateNullableObj,
      ...this.getCommonValue(),
      mode: EMode.CREATE,
    });

    this.createFormArray.push(formGroup);
  }

  onRemoveAllCreateRow() {}

  onBulkCreate() {}

  protected readonly DATE_FORMAT = DATE_FORMAT;
  protected readonly FORM_GROUP_KEYS = ISSUES_FORM_GROUP_KEYS;

  onCopyUpperRow(index: number) {
    const upperRowValue = this.getSubFormGroupInFormArray(
      this.createFormArray,
      index - 1,
    ).value;
    this.getSubFormGroupInFormArray(this.createFormArray, index).setValue(
      upperRowValue,
    );
  }

  onCopyLowerRow(index: number) {
    const lowerRowValue = this.getSubFormGroupInFormArray(
      this.createFormArray,
      index + 1,
    ).value;
    this.getSubFormGroupInFormArray(this.createFormArray, index).setValue(
      lowerRowValue,
    );
  }

  onAddNewCreateRowHasSameContent(index: number) {
    const lowerRowValue = this.getSubFormGroupInFormArray(
      this.createFormArray,
      index,
    ).value;
    const formGroup = this.formBuilder.group({
      ...estimateNullableObj,
      ...this.getCommonValue(),
      ...lowerRowValue,
      mode: EMode.CREATE,
    });

    this.createFormArray.push(formGroup);
  }

  onClearRowData(index: number) {
    this.getSubFormGroupInFormArray(this.createFormArray, index).reset({
      isLunchBreak: true,
      mode: EMode.CREATE,
    });
  }

  onRemoveCreateRow(index: number) {
    this.createFormArray.removeAt(index);
  }

  createIndexListBatch: number[] = [];
  isCreateSelectAll: boolean = false;
  viewUpdateIdListBatch: ID[] = [];
  isViewUpdateSelectAll: boolean = false;

  sheetName = signal<ESheetName>(ESheetName.ESTIMATE);

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

  batchUpdateViewUpdateFormGroup: FormGroup;

  onBatchUpdateViewRow() {
    const value = this.batchUpdateViewUpdateFormGroup.getRawValue();
    console.log('value ', value);
    const viewUpdateTableData = this.viewUpdateFormArray.value;
    const updateData = viewUpdateTableData
      .filter((rowData: IBugRowData) => {
        return this.viewUpdateIdListBatch.includes(rowData.id);
      })
      ?.map((rowData: IBugRowData) => {
        return this.commonService.mergeObjects(rowData, {
          ...value,
          updatedDate: new Date(),
        });
      });
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      sheetName: this.sheetName(),
      method: EApiMethod.PUT,
      data: [...updateData],
    }));
    console.log('this.doPostRequestDTO() ', this.doPostRequestDTO());
    this.callAPIUpdateRowData();
  }

  callAPIUpdateRowData() {
    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .updateItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Cập nhật bug thất bại, kiểm tra hàm callAPIUpdateRowData`,
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
        this.batchUpdateViewUpdateFormGroup.reset();
        this.callAPIGetTableData();
      });
  }

  onContinueFixThisBug(index: number) {
    const formGroup = this.viewUpdateFormArray.at(index);
    formGroup.patchValue({
      startTime: new Date(),
      endTime: null,
      duration: null,
    });

    if (this.createFormArray.controls.length > 1) {
      this.createFormArray.insert(0, formGroup);
    } else {
      this.createFormArray.patchValue([formGroup.value]);
    }
  }

  totalDuration: number = 0;

  onReloadTableData() {
    this.callAPIGetTableData();
  }

  getEndTime(index: number) {
    const formGroup = this.getSubFormGroupInFormArray(
      this.createFormArray,
      index,
    ) as FormGroup;
    const startTime = formGroup.get(this.FORM_GROUP_KEY.startTime).value;
    const duration = formGroup.get(this.FORM_GROUP_KEY.duration).value;

    return this.timeTrackingCalculateService.calculateEndTime(
      startTime,
      duration,
    );
  }
}
