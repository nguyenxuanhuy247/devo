import { Component, computed, Injector, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BUG_COLUMN_FIELD,
  BUG_FORM_GROUP_KEY,
  bugHeaderColumnConfigs,
  IBugFormGroup,
  IBugRowData,
} from './bug.model';
import {
  DATE_FORMAT,
  EApiMethod,
  EMode,
} from 'src/app/contants/common.constant';
import {
  EGetApiMode,
  ESheetName,
  ETabName,
  ITimeTrackingDoGetRequestDTO,
} from '../time-tracking.dto';
import { TableModule } from 'primeng/table';
import {
  IColumnHeaderConfigs,
  ID,
  IOption,
} from '../../../shared/interface/common.interface';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ConvertIdToNamePipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { ILogWorkRowData } from '../log-work/log-work.model';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  switchMap,
} from 'rxjs';
import { LibFormSelectComponent } from '../../../components';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import {
  DevTemplateDirective,
  WorkDurationDirective,
} from '../../../directives';
import {
  ISelectFormGroup,
  ITabComponent,
  SELECT_FORM_GROUP_KEY,
} from '../time-tracking.model';
import { IBugResponseDTO } from './bug.dto.model';
import { Checkbox } from 'primeng/checkbox';
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { Popover, PopoverModule } from 'primeng/popover';
import { ELogStorageKey } from 'src/app/services';
import { endOfDay, startOfDay } from 'date-fns';
import { SelectModule } from 'primeng/select';
import { ISSUES_FORM_GROUP_KEYS } from '../issues/issues.model';
import { TwoSeparateTableBaseComponent } from '../../../shared/tab-component-base/two-separate-table-base/two-separate-table-base.component';

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
    SelectModule,
    DevTemplateDirective,
  ],
  templateUrl: './bug.component.html',
  styleUrl: './bug.component.scss',
  host: {
    style: 'display: block; height: 100%;',
  },
})
export class BugComponent
  extends TwoSeparateTableBaseComponent
  implements OnInit, ITabComponent
{
  protected readonly FORM_GROUP_KEY = BUG_FORM_GROUP_KEY;
  protected readonly ESheetName = ESheetName;
  override sheetName = signal<ESheetName>(ESheetName.BUG);
  protected readonly COLUMN_FIELD = BUG_COLUMN_FIELD;
  protected readonly EMode = EMode;
  // timeTrackingService = this.injector.get(TimeTrackingApiService);

  headerColumnConfigs: IColumnHeaderConfigs[] = bugHeaderColumnConfigs;
  // doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
  //   method: EApiMethod.POST,
  //   sheetName: this.sheetName(),
  //   ids: null,
  //   data: null,
  // });
  logWorkIssueDoPostRequestDTO = computed(() => ({}));

  doGetRequestDTO = signal<ITimeTrackingDoGetRequestDTO>({
    method: EApiMethod.GET,
    mode: EGetApiMode.TABLE_DATA,
    employeeLevelId: null,
    employeeId: null,
    projectId: null,
    issueId: null,
    sheetName: this.sheetName(),
    startTime: null,
    endTime: null,
  });

  logWorkIssueDoGetRequestDTO = computed(() => ({}));

  totalDuration: number = 0;
  totalBug: number = 0;

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.onDestroy$.subscribe(() => {
      this.subscription.unsubscribe();
      this.localStorageService.removeItem(ELogStorageKey.CURRENT_BUG);
    });

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
                sheetName: this.sheetName(),
                startTime: startOfDay(
                  formGroupValue.dateRange[0],
                ).toISOString(),
                endTime: endOfDay(formGroupValue.dateRange[1]).toISOString(),
                ...this.logWorkIssueDoGetRequestDTO(),
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
              ...this.initRowDataObj,
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

          console.log('listData', listData);
          console.log('this.totalDuration', this.totalDuration);
          this.warningWhenChangeChromeTab();
        }),
    );

    this.subscription.add(
      this.getControlValueChanges(
        SELECT_FORM_GROUP_KEY.dateRange,
        this.formGroupControl,
      )
        .pipe(filter((range) => range.every((date: Date) => !!date)))
        .subscribe((value) => {
          console.log('tùy chỉnh ', value);
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
        }),
    );
  }

  statusOption = signal<IOption[]>(null);

  /*
   * @usage Xóa
   */
  onDelete(rowData: ILogWorkRowData) {
    this.timeTrackingStore.setLoading(true);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      sheetName: this.sheetName(),
      ids: [rowData.id],
      method: EApiMethod.DELETE,
    }));

    this.callAPIDeleteRows();
  }

  //
  // callAPIDeleteRows() {
  //   this.timeTrackingStore.setLoading(true);
  //   this.timeTrackingService
  //     .deleteItemAsync(this.doPostRequestDTO())
  //     .pipe(
  //       catchError(() => {
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Thất bại',
  //           detail: `Xóa bug thất bại, kiểm tra hàm onDelete`,
  //         });
  //
  //         this.timeTrackingStore.setLoading(false);
  //         return EMPTY;
  //       }),
  //     )
  //     .subscribe((res) => {
  //       this.messageService.add({
  //         severity: 'success',
  //         summary: 'Thành công',
  //         detail: res?.message,
  //       });
  //
  //       this.viewUpdateIdListBatch = [];
  //       this.isViewUpdateSelectAll = false;
  //       this.callAPIGetTableData();
  //     });
  // }

  onCancelUpdateMode(index: number) {
    this.getSubFormGroupInFormArray(this.viewUpdateFormArray, index).patchValue(
      {
        mode: EMode.VIEW,
      },
    );
    // this.viewUpdateTableData = this.viewUpdateFormArray.value;
  }

  /**
   * @usage Thêm mới
   */
  onSaveCreate(index: number) {
    const formValue = this.createFormArray?.at(index)?.value;
    const cloneFormValue = _.cloneDeep(formValue) as IBugFormGroup;
    delete cloneFormValue.mode;
    delete cloneFormValue.name;

    console.log('Thêm mới 1111', this.sheetName(), this.doPostRequestDTO());
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      sheetName: this.sheetName(),
      method: EApiMethod.POST,
      data: [
        {
          ...cloneFormValue,
          ...this.getCommonValue(),
          createdDate: new Date(),
        },
      ],
    }));
    console.log('Thêm mới 2222', this.sheetName(), this.doPostRequestDTO());
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
              ...this.initRowDataObj,
              status: EStatusNameId['CHUA_FIX'],
              mode: EMode.CREATE,
            },
          ]);
        }
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
      sheetName: this.sheetName(),
      method: EApiMethod.PUT,
      data: [
        {
          ...value,
          updatedDate: new Date(),
        },
      ],
    }));

    this.callAPIUpdateRowData();
  }

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

  csvData: any[] = [];
  mapColumnCsvData: any[] = [];
  csvHeaderOptions: IOption[] = [];
  codeHeaderInCSVFile: string = 'Issue key';
  nameHeaderInCSVFile: string = 'Summary';
  browserEvent: any;

  /*
   * @usage Import CSV
   */
  onFileChange(event: any, popupOver: Popover) {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;
    file.value = '';

    const reader = new FileReader();
    this.timeTrackingStore.setLoading(true);
    reader.onload = () => {
      const csv = reader.result as string;
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (result) => {
          // Lấy danh sách header từ file CSV
          this.csvHeaderOptions =
            result.meta.fields?.map(
              (item: string) =>
                ({
                  label: item,
                  value: item,
                } as IOption),
            ) || [];

          console.log('this.csvHeader ', this.csvHeaderOptions);
          this.csvData = result.data;
          this.timeTrackingStore.setLoading(false);
          input.value = '';

          popupOver.toggle(this.browserEvent);
        },
      });
    };

    reader.readAsText(file);
  }

  mapColumnAfterImportCSV() {
    this.timeTrackingStore.setLoading(true);
    const columnMapping: { [key: string]: string } = {
      [this.codeHeaderInCSVFile]: 'code',
      [this.nameHeaderInCSVFile]: 'name',
    };

    this.mapColumnCsvData = this.csvData.map((row: any) => {
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

    const EStatusNameId = this.convertOptionToEnum(this.statusOption());
    this.mapColumnCsvData.forEach((rowData: any, index: number) => {
      const formGroup = this.formBuilder.group({
        ...this.initRowDataObj,
        mode: this.EMode.UPDATE,
        isLunchBreak: true,
        status: EStatusNameId['CHUA_FIX'],
        ...rowData,
      });
      this.createFormArray.push(formGroup);

      formGroup.valueChanges.subscribe(() => {
        this.saveCurrentLogToMemory(index);
        this.warningWhenChangeChromeTab();
      });
    });
    this.timeTrackingStore.setLoading(false);
  }

  override checkIsTimeTracking() {
    return this.createFormArray.value.some(
      (rowData: IBugRowData) => rowData.startTime && !rowData.endTime,
    );
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
      sheetName: this.sheetName(),
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
        this.createIndexListBatch = [];
        this.onAddNewCreateRow();
        this.callAPIGetTableData();
      });
  }

  onSelectStatus(optionId: ID, index: number) {
    const EStatusNameId = this.convertOptionToEnum(this.statusOption());
    if (optionId === EStatusNameId['DANG_FIX']) {
      this.onSetCurrentTimeForDatepicker(
        this.createFormArray,
        index,
        this.FORM_GROUP_KEY.startTime,
      );
    } else if (optionId === EStatusNameId['DA_FIX']) {
      this.getFormGroup(index, this.createFormArray).patchValue({
        mode: EMode.VIEW,
      });
      this.getFormControlInSubFormGroup(
        this.createFormArray,
        index,
        this.FORM_GROUP_KEY.endTime,
      ).setValue(new Date());
      this.onSaveCreate(index);
    } else {
      this.getFormControlInSubFormGroup(
        this.createFormArray,
        index,
        this.FORM_GROUP_KEY.startTime,
      ).setValue(null);
    }
    console.log('Cảnh báo cho thay đổi status');
    this.warningWhenChangeChromeTab();
    this.saveCurrentLogToMemory(index);
  }

  private saveCurrentLogToMemory(index: number) {
    const value = this.createFormArray.at(index).value;
    this.localStorageService.setItem(ELogStorageKey.CURRENT_BUG, value);
  }

  onRemoveCreateRow(index: number) {
    this.createFormArray.removeAt(index);
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

  onContinueFixThisBug(index: number) {
    const EStatusNameId = this.convertOptionToEnum(this.statusOption());
    const formGroup = this.viewUpdateFormArray.at(index);
    formGroup.patchValue({
      status: EStatusNameId['DANG_FIX'],
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

  override onSetCurrentTimeForDatepicker(
    formArray: FormArray,
    index: number,
    formControlName: string,
  ) {
    super.onSetCurrentTimeForDatepicker(formArray, index, formControlName);
    this.warningWhenChangeChromeTab();
  }

  onReloadTableData() {
    this.callAPIGetTableData();
  }

  protected readonly FORM_GROUP_KEYS = ISSUES_FORM_GROUP_KEYS;
  protected readonly DATE_FORMAT = DATE_FORMAT;

  override createNewFormGroup() {
    const EStatusNameId = this.convertOptionToEnum(this.statusOption());
    return this.formBuilder.group({
      ...this.initRowDataObj,
      status: EStatusNameId['CHUA_FIX'],
      mode: EMode.CREATE,
    }) as any;
  }
}
