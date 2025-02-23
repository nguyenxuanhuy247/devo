import { Component, Injector, input, OnInit, signal } from '@angular/core';
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
  ETabName,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../time-tracking.dto';
import { EApiMethod, EMode } from '../../../contants/common.constant';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';
import {
  ILogWorkRowData,
  LOG_WORK_CHILD_FORM_GROUP_KEYS,
  LOG_WORK_COLUMN_FIELD,
  logWorkHeaderColumnConfigs,
  logWorkNullableObj,
} from './log-work.model';
import { FormBaseComponent } from 'src/app/shared';
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
import { ConvertIdToNamePipe, FormatDatePipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { TimeTrackingStore } from '../time-tracking.store';
import * as _ from 'lodash';
import { WorkDurationDirective } from '../../../directives';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ILogWorkResponseDTO } from './log-work.dto.model';

@Component({
  selector: 'app-log-work',
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
    FormatDatePipe,
    ConvertIdToNamePipe,
    WorkDurationDirective,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: './log-work.component.html',
  styleUrl: './log-work.component.scss',
})
export class LogWorkComponent
  extends FormBaseComponent
  implements OnInit, ITabComponent
{
  formGroupControl = input.required<FormGroup>();
  projectFormControl = input.required<LibFormSelectComponent>();
  /*
   * @usage Có 2 trường hợp : Log work độc lập và Log work của vấn đề
   */
  // issueRowData = input<IIssuesRowData>(null);
  // issueId = computed<ID>(() => {
  //   return this.issueRowData()?.id;
  // });
  // issueCommonData = computed(() => {
  //   return {
  //     moduleId: this.issueRowData()?.moduleId,
  //     menuId: this.issueRowData()?.menuId,
  //     screenId: this.issueRowData()?.screenId,
  //     featureId: this.issueRowData()?.featureId,
  //     categoryId: this.issueRowData()?.categoryId,
  //   };
  // });

  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  headerColumnConfigs: IColumnHeaderConfigs[] = logWorkHeaderColumnConfigs;
  isLoading = signal(false);
  formArray: FormArray = new FormArray([]);
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: ETabName.LOG_WORK,
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
  tableData: ILogWorkRowData[] = [];
  createFormGroup!: FormGroup;
  fixedRowData: ILogWorkRowData[] = [];
  protected readonly FORM_GROUP_KEYS = LOG_WORK_CHILD_FORM_GROUP_KEYS;
  protected readonly COLUMN_FIELD = LOG_WORK_COLUMN_FIELD;
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

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();

    const formValue = this.formGroupControl().value;
    this.addCreateRowForm();
    this.createFormGroup = this.formBuilder.group({
      ...logWorkNullableObj,
      // ...this.issueCommonData(),
      ...formValue,
      isLunchBreak: true,
      mode: EMode.CREATE,
      createdDate: new Date(),
    });

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
                this.formGroupControl().getRawValue() as ISelectFormGroup;

              return {
                ...oldValue,
                employeeLevelId: formGroupValue.employeeLevelId,
                employeeId: formGroupValue.employeeId,
                projectId: formGroupValue.projectId,
                // startTime: this.issueId()
                //   ? null
                //   : formGroupValue.dateRange[0].toISOString(),
                // endTime: this.issueId()
                //   ? null
                //   : formGroupValue.dateRange[1].toISOString(),
                // issueId: this.issueId(),
                startTime: formGroupValue.dateRange[0].toISOString(),
                endTime: formGroupValue.dateRange[1].toISOString(),
                sheetName: ETabName.LOG_WORK,
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
        .subscribe((listData: ILogWorkResponseDTO[]) => {
          this.mode.set(EMode.VIEW);
          this.formArray.clear();

          listData.forEach((rowData) => {
            const formGroup = this.formBuilder.group({
              ...rowData,
              mode: EMode.VIEW,
              isLunchBreak: true,
              startTime: rowData.startTime ? new Date(rowData.startTime) : null,
              endTime: rowData.endTime ? new Date(rowData.endTime) : null,
            });
            this.formArray.push(formGroup);
          });

          this.tableData = this.formArray.value;
        }),
    );

    this.subscription.add(
      this.getControlValueChanges(
        SELECT_FORM_GROUP_KEY.dateRange,
        this.formGroupControl(),
      )
        .pipe(filter((dataRange) => !!dataRange))
        .subscribe(() => {
          // Sau khi thiết lập các giá trị chung như Level, Nhân viên, dự án, thời gian mới gọi API lấy danh sách
          this.callAPIGetTableData();
        }),
    );
  }

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

  onCancelUpdateMode(index: number) {
    this.mode.set(EMode.VIEW);
    this.getFormGroupInFormArray(this.formArray, index).patchValue({
      mode: EMode.VIEW,
    });
    this.tableData = this.formArray.value;
  }

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

  getFormGroup(index: number): FormGroup {
    return this.getFormGroupInFormArray(this.formArray, index);
  }

  onSetCurrentTimeForDatepicker(index: number, formControlName: string) {
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
    this.tableData = this.formArray.value;
  }

  getCommonValue() {
    const commonValue = _.cloneDeep(this.formGroupControl().value);
    delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
    delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
    delete commonValue[SELECT_FORM_GROUP_KEY.formArray];

    return commonValue;
  }

  onSaveCreate() {
    // const outsideValue = this.issueId()
    //   ? {
    //       issueId: this.issueId(),
    //     }
    //   : {};
    const data: ILogWorkRowData = {
      ...this.createFormGroup.value,
      ...this.getCommonValue(),
      // ...outsideValue,
      // issueId: this.issueId(),
      createdDate: new Date(),
      updatedDate: null,
    };

    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      sheetName: ETabName.LOG_WORK,
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

  onDuplicateExistingItem(rowData: ILogWorkRowData) {
    this.createFormGroup.patchValue(rowData);
  }
}
