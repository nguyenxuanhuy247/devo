import { Component, computed, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { IIssuesRowData } from '../issues.model';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { WorkDurationDirective } from '../../../../directives';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import {
  ICommonRowData,
  ISelectFormGroup,
  SELECT_FORM_GROUP_KEY,
} from '../../time-tracking.model';
import {
  IImprovementRowData,
  improvementNullableObj,
} from '../../improvement/improvement.model';
import { EApiMethod, EMode } from '../../../../contants/common.constant';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  switchMap,
} from 'rxjs';
import {
  EGetApiMode,
  ESheetName,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../../time-tracking.dto';
import {
  IColumnHeaderConfigs,
  ID,
} from '../../../../shared/interface/common.interface';
import {
  LOG_IMPROVEMENT_COLUMN_FIELD,
  LOG_IMPROVEMENT_FORM_GROUP_KEY,
  logImprovementHeaderColumnConfigs,
} from './log-improvement.model';
import { endOfDay, startOfDay } from 'date-fns';
import { message } from '../../../../contants/api.contant';
import { ILogWorkResponseDTO } from '../../log-work/log-work.dto.model';
import { TabComponentBaseComponent } from '../../../../shared';
import {
  ILogWorkRowData,
  logWorkNullableObj,
} from '../../log-work/log-work.model';

@Component({
  selector: 'app-log-improvement',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    TagModule,
    WorkDurationDirective,
    InputTextModule,
    TextareaModule,
  ],
  standalone: true,
  templateUrl: 'log-improvement.component.html',
  styleUrl: 'log-improvement.component.scss',
  host: {
    style: 'display: block; min-height: 100%',
  },
})
export class LogImprovementComponent
  extends TabComponentBaseComponent
  implements OnInit
{
  issueRowData = input.required<IIssuesRowData>({});
  issueCommonData = computed<ICommonRowData>(() => {
    console.log('issueCommonData', this.issueRowData());
    return {
      employeeLevelId: this.issueRowData()?.employeeLevelId,
      employeeId: this.issueRowData()?.employeeId,
      projectId: this.issueRowData()?.projectId,
      moduleId: this.issueRowData()?.moduleId,
      menuId: this.issueRowData()?.menuId,
      screenId: this.issueRowData()?.screenId,
      featureId: this.issueRowData()?.featureId,
      categoryId: this.issueRowData()?.categoryId,
      issueId: this.issueRowData()?.id,
      deadlineId: this.issueRowData()?.deadlineId,
    };
  });
  issueId = computed<ID>(() => {
    return this.issueRowData()?.id;
  });
  logImprovementIssueDoGetRequestDTO = computed(() => {
    return this.issueId()
      ? {
          issueId: this.issueId(),
          startTime: startOfDay(new Date('1900-01-01')).toISOString(),
          endTime: endOfDay(new Date('9999-12-31')).toISOString(),
        }
      : {};
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
  sheetName = signal<ESheetName>(ESheetName.IMPROVEMENT);

  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: this.sheetName(),
    ids: null,
    data: null,
  });
  createFormGroup!: FormGroup;
  headerColumnConfigs: IColumnHeaderConfigs[] =
    logImprovementHeaderColumnConfigs;

  override ngOnInit() {
    super.ngOnInit();
    this.createFormGroup = this.formBuilder.group({
      startTime: null,
      endTime: null,
      duration: null,
      isLunchBreak: true,
    });
    this.addCreateRowForm();
    console.log('ngOnInit', this.createFormGroup.value);
    this.initSubscriptions();
    this.callAPIGetTableData();
  }

  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  formArray: FormArray = new FormArray([]);

  override initRowDataObj: any = improvementNullableObj;

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
                sheetName: this.sheetName(),
                issueId: this.issueId(),
                startTime: startOfDay(new Date('1900-01-01')).toISOString(),
                endTime: endOfDay(new Date('9999-12-31')).toISOString(),
              };
            });
            console.log('Gọi API');
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
        .subscribe((listData: ILogWorkResponseDTO[]) => {
          this.mode.set(EMode.VIEW);
          this.formArray.clear();

          listData.forEach((rowData) => {
            const formGroup = this.formBuilder.group({
              ...this.initRowDataObj,
              ...rowData,
              mode: EMode.VIEW,
              isLunchBreak: true,
              startTime: rowData.startTime ? new Date(rowData.startTime) : null,
              endTime: rowData.endTime ? new Date(rowData.endTime) : null,
            });
            this.formArray.push(formGroup);
          });
          console.log('this.formArray', this.formArray.value);
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

  onSaveCreate() {
    const data: IImprovementRowData = {
      ...this.getCommonValue(),
      ...this.issueCommonData(),
      ...this.createFormGroup.value,
      createdDate: new Date(),
      updatedDate: null,
    };

    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      sheetName: this.sheetName(),
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

  protected readonly FORM_GROUP_KEYS = LOG_IMPROVEMENT_FORM_GROUP_KEY;
  isLoading = signal(false);

  /**
   * @usage Cập nhật bản ghi
   */
  onSaveUpdate(index: number) {
    this.isLoading.set(true);
    const value = this.formArray?.at(index)?.value;
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.PUT,
      data: [
        {
          ...this.issueCommonData(),
          ...value,
          updatedDate: new Date(),
        },
      ],
    }));
    console.log('api ', this.doPostRequestDTO());
    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .updateItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Cập nhật Log improvement thất bại, kiểm tra hàm onSaveUpdate`,
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

  onCancelUpdateMode(index: number) {
    this.mode.set(EMode.VIEW);
    this.getSubFormGroupInFormArray(this.formArray, index).patchValue({
      mode: EMode.VIEW,
    });
  }

  getFormGroup(index: number): FormGroup {
    return this.getSubFormGroupInFormArray(this.formArray, index);
  }

  onDelete(rowData: ILogWorkRowData) {
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

    const formGroup = this.getFormGroup(index);
    formGroup.patchValue({ mode: EMode.UPDATE });
  }

  onDuplicateExistingItem(rowData: ILogWorkRowData) {
    this.createFormGroup.patchValue(rowData);
  }

  protected readonly COLUMN_FIELD = LOG_IMPROVEMENT_COLUMN_FIELD;
  protected readonly EMode = EMode;
  fixedRowData: ILogWorkRowData[] = [];

  addCreateRowForm() {
    this.fixedRowData = [
      {
        ...logWorkNullableObj,
        mode: EMode.CREATE,
        isLunchBreak: true,
        createdDate: new Date(),
      },
    ];
  }

  override onSetCurrentTimeForDatepicker(
    formArray: FormArray,
    index: number,
    formControlName: string,
  ) {
    let control: FormControl;
    if (this.mode() === EMode.UPDATE) {
      control = this.getFormControl(index, formControlName);
    } else {
      control = this.getControl(
        formControlName,
        this.createFormGroup,
      ) as FormControl;
    }
    control.setValue(new Date());
  }

  getFormControl(index: number, formControlName: string): FormControl {
    return this.formArray?.at(index)?.get(formControlName) as FormControl;
  }
}
