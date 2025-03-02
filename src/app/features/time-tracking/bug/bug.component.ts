import { Component, Injector, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BUG_FORM_GROUP_KEY,
  bugHeaderColumnConfigs,
  bugNullableObj,
  IBugFormGroup,
  IBugRowData,
} from './bug.model';
import { EApiMethod, EMode } from 'src/app/contants/common.constant';
import {
  EGetApiMode,
  ESheetName,
  ETabName,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../time-tracking.dto';
import { TableModule } from 'primeng/table';
import {
  IColumnHeaderConfigs,
  ID,
  IOption,
} from '../../../shared/interface/common.interface';
import {
  FormArray,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ConvertIdToNamePipe } from '../../../pipes';
import { FormBaseComponent } from '../../../shared';
import { TimeTrackingStore } from '../time-tracking.store';
import { TagModule } from 'primeng/tag';
import { ILogWorkRowData } from '../log-work/log-work.model';
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
import { TimeTrackingApiService } from '../time-tracking-api.service';
import { LibFormSelectComponent } from '../../../components';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { WorkDurationDirective } from '../../../directives';
import {
  COMMON_COLUMN_FIELD,
  ISelectFormGroup,
  ITabComponent,
  SELECT_FORM_GROUP_KEY,
} from '../time-tracking.model';
import { IBugResponseDTO } from './bug.dto.model';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { ExtendedFormBase } from '../../../utils/function';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-bug',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    ButtonModule,
    ConvertIdToNamePipe,
    TagModule,
    LibFormSelectComponent,
    DatePicker,
    InputText,
    Textarea,
    WorkDurationDirective,
    Checkbox,
    PopoverModule,
  ],
  templateUrl: './bug.component.html',
  styleUrl: './bug.component.scss',
  host: {
    style: 'display: block; height: 100%;',
  },
})
export class BugComponent
  extends ExtendedFormBase<IBugRowData>(FormBaseComponent)
  implements OnInit, ITabComponent
{
  projectFormControl = input<LibFormSelectComponent>();

  protected readonly FORM_GROUP_KEYS = BUG_FORM_GROUP_KEY;
  protected readonly ETabName = ESheetName;
  // protected readonly COLUMN_FIELD = BUG_COLUMN_FIELD;
  protected readonly COLUMN_FIELD = COMMON_COLUMN_FIELD;
  protected readonly EMode = EMode;
  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  timeTrackingService = this.injector.get(TimeTrackingApiService);

  allDropdownData$ = this.timeTrackingStore.allDropdownData$;
  moduleDependentOptions$ = this.timeTrackingStore.moduleDependentOptions$;
  menuDependentOptions$ = this.timeTrackingStore.menuDependentOptions$;
  screenDependentOptions$ = this.timeTrackingStore.screenDependentOptions$;
  featureDependentOptions$ = this.timeTrackingStore.featureDependentOptions$;
  categoryOptions$ = this.timeTrackingStore.categoryOptions$;
  statusDependentTabOptions$ =
    this.timeTrackingStore.statusDependentTabOptions$;

  // createTableData: IBugRowData[] = [];
  viewUpdateTableData: IBugRowData[];

  headerColumnConfigs: IColumnHeaderConfigs[] = bugHeaderColumnConfigs;
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: ESheetName.BUG,
    ids: null,
    data: null,
  });
  createFormArray: FormArray = new FormArray([]);
  viewUpdateFormArray: FormArray = new FormArray([]);

  subscription: Subscription = new Subscription();
  private getTableDataApiRequest$ = new Subject<void>(); // Subject để trigger API call
  doGetRequestDTO = signal<ITimeTrackingDoGetRequestDTO>({
    method: EApiMethod.GET,
    mode: EGetApiMode.TABLE_DATA,
    employeeLevelId: null,
    employeeId: null,
    projectId: null,
    issueId: null,
    sheetName: ESheetName.BUG,
    startTime: null,
    endTime: null,
  });
  batchUpdateFormGroup: FormGroup;

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.initSubscriptions();

    this.batchUpdateFormGroup = this.formBuilder.group({
      moduleId: null,
      menuId: null,
      screenId: null,
      featureId: null,
      categoryId: null,
    });
  }

  initSubscriptions() {
    this.subscription.add(
      this.getTableDataApiRequest$
        .pipe(
          debounceTime(300), // Giảm số lần gọi API nếu nhiều yêu cầu liên tiếp
          switchMap(() => {
            this.doGetRequestDTO.update((oldValue: any) => {
              const formGroupValue =
                this.formGroupControl.getRawValue() as ISelectFormGroup;

              return {
                ...oldValue,
                employeeLevelId: formGroupValue.employeeLevelId,
                employeeId: formGroupValue.employeeId,
                projectId: formGroupValue.projectId,
                sheetName: ESheetName.BUG,
                startTime: formGroupValue.dateRange[0].toISOString(),
                endTime: formGroupValue.dateRange[1].toISOString(),
              };
            });

            this.timeTrackingStore.setLoading(true);
            return this.timeTrackingService
              .getListAsync(this.doGetRequestDTO())
              .pipe(
                catchError(() => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Thất bại',
                    detail: `Tải danh sách bug thất bại, kiểm tra hàm getTableDataApiRequest$`,
                  });
                  return EMPTY;
                }),
                finalize(() => {
                  this.timeTrackingStore.setLoading(false);
                }),
              );
          }),
        )
        .subscribe((listData: IBugResponseDTO[]) => {
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

          this.viewUpdateTableData = this.viewUpdateFormArray.value;
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

    this.subscription.add(
      this.statusDependentTabOptions$
        .pipe(filter((statusOption) => !!statusOption))
        .subscribe((status) => {
          const bugTabName = ETabName.BUG;
          const statusOption = status[bugTabName];
          this.statusOption.set(statusOption);

          this.onAddNewCreateRow();
          console.log(' this.statusOption', this.statusOption());
        }),
    );
  }

  statusOption = signal<IOption[]>(null);

  onChangeToUpdateMode(index: number) {
    const formGroup = this.getFormGroup(index, this.viewUpdateFormArray);
    formGroup.patchValue({ mode: EMode.UPDATE });
    this.viewUpdateTableData = this.viewUpdateFormArray.value;
  }

  /*
   * @usage Xóa
   */
  onDelete(rowData: ILogWorkRowData) {
    this.timeTrackingStore.setLoading(true);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      ids: [rowData.id],
      method: EApiMethod.DELETE,
    }));

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
      .subscribe(() => {
        this.callAPIGetTableData();
      });
  }

  getFormGroup(index: number, formArray: FormArray): FormGroup {
    return this.getSubFormGroupInFormArray(formArray, index);
  }

  onCancelUpdateMode(index: number) {
    this.getSubFormGroupInFormArray(this.viewUpdateFormArray, index).patchValue(
      {
        mode: EMode.VIEW,
      },
    );
    this.viewUpdateTableData = this.viewUpdateFormArray.value;
  }

  /**
   * @usage Thêm mới
   */
  onSaveCreate(index: number) {
    const formValue = this.createFormArray?.at(index)?.value;
    const cloneFormValue = _.cloneDeep(formValue) as IBugFormGroup;
    delete cloneFormValue.mode;
    delete cloneFormValue.name;

    console.log('onSaveCreate 111111', this.doPostRequestDTO());
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      data: [
        {
          ...cloneFormValue,
          ...this.getCommonValue(),
          createdDate: new Date(),
        },
      ],
    }));

    console.log('onSaveCreate 22222', this.doPostRequestDTO());
    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .createItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Thêm mới bug thất bại, kiểm tra hàm onSaveCreate`,
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

        if (this.createFormArray.controls.length > 1) {
          this.createFormArray.removeAt(index);
        } else {
          const EStatusNameId = this.convertOptionToEnum(this.statusOption());
          this.createFormArray.setValue([
            {
              ...bugNullableObj,
              status: EStatusNameId['CHUA_FIX'],
              mode: EMode.CREATE,
            },
          ]);
        }
        // this.createTableData = this.createFormArray.value;
        this.callAPIGetTableData();
      });
  }

  /**
   * @usage Cập nhật bản ghi
   */
  onSaveUpdate(index: number) {
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
            detail: `Cập nhật bug thất bại, kiểm tra hàm onSaveUpdate`,
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

        this.callAPIGetTableData();
      });
  }

  callAPIGetTableData(): void {
    this.getTableDataApiRequest$.next();
  }

  csvData: any[] = [];

  /*
   * @usage Import CSV
   */
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    this.timeTrackingStore.setLoading(true);
    reader.onload = () => {
      const csv = reader.result as string;
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const columnMapping: { [key: string]: string } = {
            Summary: 'name',
            'Issue key': 'code',
            'Issue Type': 'tabName',
          };

          this.csvData = result.data.map((row: any) => {
            const newRow: any = {};
            Object.keys(columnMapping).forEach((oldKey) => {
              if (Object.prototype.hasOwnProperty.call(row, oldKey)) {
                const newKey = columnMapping[oldKey];
                newRow[newKey] = row[oldKey];
              }
            });
            return newRow;
          });

          const createTableData = this.createFormArray.value;
          const isInputDataMode = createTableData.some(
            (rowData: IBugRowData) => !!rowData.startTime,
          );
          if (!isInputDataMode) {
            this.createFormArray.clear();
          }

          this.csvData.forEach((rowData: any) => {
            const formGroup = this.formBuilder.group({
              ...bugNullableObj,
              mode: this.EMode.UPDATE,
              isLunchBreak: true,
              startTime: rowData.startTime ? new Date(rowData.startTime) : null,
              endTime: rowData.endTime ? new Date(rowData.endTime) : null,
              ...rowData,
            });
            this.createFormArray.push(formGroup);
          });

          this.timeTrackingStore.setLoading(false);
        },
      });
    };

    reader.readAsText(file);
  }

  onBulkCreate() {
    const createTableData = this.createFormArray.value;
    const listData = createTableData.map((rowData: IBugFormGroup) => {
      return {
        ...rowData,
        ...this.getCommonValue(),
        createdDate: new Date(),
      };
    });
    this.timeTrackingStore.setLoading(true);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      data: listData,
    }));

    this.timeTrackingService
      .createItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Thêm mới hàng loạt bug thất bại, kiểm tra hàm onBulkCreate`,
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

        this.createFormArray.clear();
        this.onAddNewCreateRow();
        this.callAPIGetTableData();
      });
  }

  onSelectStatus(optionId: ID, index: number) {
    const EStatusNameId = this.convertOptionToEnum(this.statusOption());
    console.log('onSelectStatus ', EStatusNameId);
    if (optionId === EStatusNameId['DANG_FIX']) {
      this.onSetCurrentTimeForDatepicker(
        this.createFormArray,
        index,
        this.FORM_GROUP_KEYS.startTime,
      );
    } else if (optionId === EStatusNameId['DA_FIX']) {
      this.getFormGroup(index, this.createFormArray).patchValue({
        mode: EMode.VIEW,
      });
      this.getFormControlInSubFormGroup(
        this.createFormArray,
        index,
        this.FORM_GROUP_KEYS.endTime,
      ).setValue(new Date());
      this.onSaveCreate(index);
    } else {
      this.getFormControlInSubFormGroup(
        this.createFormArray,
        index,
        this.FORM_GROUP_KEYS.startTime,
      ).setValue(null);
    }
  }

  onAddNewCreateRow() {
    const EStatusNameId = this.convertOptionToEnum(this.statusOption());
    const formGroup = this.formBuilder.group({
      ...bugNullableObj,
      status: EStatusNameId['CHUA_FIX'],
      mode: EMode.CREATE,
    });
    this.createFormArray.push(formGroup);
    // this.createTableData = this.createFormArray.value;
  }

  onRemoveCreateRow(index: number) {
    this.createFormArray.removeAt(index);
    // this.createTableData = this.createFormArray.value;
  }

  onClearRowData(index: number) {
    this.getSubFormGroupInFormArray(this.createFormArray, index).reset({
      isLunchBreak: true,
      mode: EMode.CREATE,
    });
  }

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

  onRemoveAllCreateRow() {
    this.createFormArray.clear();
    this.onAddNewCreateRow();
  }

  onBatchRemoveCreateRow() {
    this.indexListBatch.forEach((index: number) => {
      console.log('111111111 ' + index, this.createFormArray);
      this.createFormArray.removeAt(index);
      console.log('this.Xóa nhiều control ' + index, this.createFormArray);
    });
  }

  onBatchUpdateCreateRow() {
    const batchUpdateFormValue = this.batchUpdateFormGroup.value;
    this.createFormArray.controls.forEach((control, index: number) => {
      if (this.indexListBatch.includes(index)) {
        control.patchValue({
          ...batchUpdateFormValue,
        });
      }
    });
    this.batchUpdateFormGroup.reset();
  }

  isSelectAll: boolean = false;
  selectedNumber: number = 0;
  indexListBatch: number[] = [];

  getSelectedNumberAndIds() {
    this.indexListBatch = [];
    this.selectedNumber = this.createFormArray.value.filter(
      (rowData: IBugFormGroup, index: number) => {
        if (rowData.selected) {
          this.indexListBatch.push(index);
        }
        return rowData.selected;
      },
    ).length;
    this.indexListBatch.sort((a, b) => b - a);
  }

  toggleSelectAll(event: CheckboxChangeEvent) {
    this.isSelectAll = event.checked;
    this.createFormArray.controls.forEach((control) => {
      control.patchValue({
        selected: this.isSelectAll,
      });
    });

    this.getSelectedNumberAndIds();
  }

  onRowSelectionChange(event: CheckboxChangeEvent, index: number) {
    this.createFormArray.at(index).patchValue({
      selected: event.checked,
    });
    this.isSelectAll = this.createFormArray.value.every(
      (row: IBugFormGroup) => row.selected,
    );

    this.getSelectedNumberAndIds();
  }
}
