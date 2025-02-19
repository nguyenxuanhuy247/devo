import { Component, Injector, input, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IIndependentDropDownSignal,
  ISelectFormGroup,
  SELECT_FORM_GROUP_KEY,
} from '../time-tracking.model';
import {
  EGetApiMode,
  ETabName,
  ILogWorkTableDataResponseDTO,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../time-tracking.dto';
import { EApiMethod, EMode } from '../../../contants/common.constant';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  IColumnHeaderConfigs,
  ID,
  IOption,
} from 'src/app/shared/interface/common.interface';
import {
  ILogWorkRowData,
  LOG_WORK_CHILD_FORM_GROUP_KEYS,
  LOG_WORK_COLUMN_FIELD,
  logWorkHeaderColumnConfigs,
  nullableLogWorkObj,
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
import { ConvertIdToNamePipe, FormatDatePipe, RoundPipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { TimeTrackingStore } from '../time-tracking.store';
import * as _ from 'lodash';
import { WorkDurationDirective } from '../../../directives';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { getValue } from 'src/app/utils/function';

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
    RoundPipe,
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
export class LogWorkComponent extends FormBaseComponent implements OnInit {
  formGroupControl = input<FormGroup>();
  projectFormControl = input<LibFormSelectComponent>();

  independentDropdowns = input<IIndependentDropDownSignal>();
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  headerColumnConfigs: IColumnHeaderConfigs[] = logWorkHeaderColumnConfigs;
  isLoading = signal(false);
  formArray: FormArray = new FormArray([]);
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    ids: null,
    data: null,
  });
  doGetRequestDTO = signal<ITimeTrackingDoGetRequestDTO>({
    method: EApiMethod.GET,
    mode: EGetApiMode.TABLE_DATA,
    employeeLevelId: null,
    employeeId: null,
    projectId: null,
    tabId: null,
    startTime: null,
    endTime: null,
  });
  timeTrackingService = this.injector.get(TimeTrackingApiService);
  subscription: Subscription = new Subscription();
  tableData: ILogWorkRowData[] = [];
  createFormGroup!: FormGroup;
  tabId = signal<ID>(null);
  fixedRowData: ILogWorkRowData[] = [];
  protected readonly FORM_GROUP_KEYS = LOG_WORK_CHILD_FORM_GROUP_KEYS;
  protected readonly ETabName = ETabName;
  protected readonly COLUMN_FIELD = LOG_WORK_COLUMN_FIELD;
  protected readonly EMode = EMode;
  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  allDropdownData$ = this.timeTrackingStore.allDropdownData$;
  moduleDependentOptions$ = this.timeTrackingStore.moduleDependentOptions$;
  menuDependentOptions$ = this.timeTrackingStore.menuDependentOptions$;
  screenDependentOptions$ = this.timeTrackingStore.screenDependentOptions$;
  featureDependentOptions$ = this.timeTrackingStore.featureDependentOptions$;
  tabOptions$ = this.timeTrackingStore.tabOptions$;
  categoryOptions$ = this.timeTrackingStore.categoryOptions$;
  private getTableDataApiRequest$ = new Subject<void>(); // Subject để trigger API call

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.createFormGroup = this.formBuilder.group({
      ...nullableLogWorkObj,
      mode: EMode.CREATE,
      createdDate: new Date(),
    });

    this.addCreateRowForm();

    this.initSubscriptions();
  }

  initSubscriptions() {
    // this.onDestroy$.subscribe(() => {});

    this.subscription.add(
      this.tabOptions$.subscribe((tabOptions: IOption[]) => {
        const tabId = tabOptions?.find(
          (tab: IOption) => tab.label === ETabName.LOG_WORK,
        )?.value;

        this.tabId.set(tabId);
      }),
    );

    this.subscription.add(
      this.getTableDataApiRequest$
        .pipe(
          debounceTime(300), // Giảm số lần gọi API nếu nhiều yêu cầu liên tiếp
          switchMap(() => {
            this.isLoading.set(true);

            this.doGetRequestDTO.update((oldValue: any) => {
              const formGroupValue =
                this.formGroupControl().getRawValue() as ISelectFormGroup;

              return {
                ...oldValue,
                employeeLevelId: formGroupValue.employeeLevelId,
                employeeId: formGroupValue.employeeId,
                projectId: formGroupValue.projectId,
                tabId: this.tabId(),
                startTime: formGroupValue.dateRange[0].toISOString(),
                endTime: formGroupValue.dateRange[1].toISOString(),
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
                finalize(() => this.isLoading.set(false)),
              );
          }),
        )
        .subscribe((listData: ILogWorkTableDataResponseDTO[]) => {
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
          this.createFormGroup.reset();
        }),
    );

    this.subscription.add(
      this.getControlValueChanges(
        SELECT_FORM_GROUP_KEY.dateRange,
        this.formGroupControl(),
      )
        .pipe(filter((dataRange) => !!dataRange))
        .subscribe((_) => {
          // Sau khi thiết lập các giá trị chung như Level, Nhân viên, dự án, thời gian mới gọi API lấy danh sách
          this.callAPIGetTableData();
        }),
    );
  }

  addCreateRowForm() {
    this.fixedRowData = [
      {
        ...nullableLogWorkObj,
        mode: EMode.CREATE,
        tabId: this.tabId(),
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

    this.timeTrackingService
      .updateItemAsync(this.doPostRequestDTO())
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
          this.isLoading.set(false);
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
    this.isLoading.set(true);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      ids: [rowData.id],
      method: EApiMethod.DELETE,
    }));

    this.timeTrackingService
      .deleteItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.isLoading.set(false);
          return EMPTY;
        }),
      )
      .subscribe((_) => {
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
    const tabId = getValue(this.tabOptions$)?.find(
      (tab: IOption) => tab.label === ETabName.LOG_WORK,
    )?.value;

    const data: ILogWorkRowData = {
      ...this.createFormGroup.value,
      ...this.getCommonValue(),
      tabId,
      createdDate: new Date(),
    };

    console.log('1111111111 ', data);
    this.isLoading.set(true);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      data: [data],
    }));

    console.log('222222222222 ', this.doPostRequestDTO());

    this.timeTrackingService
      .createItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: message.serverError,
          });
          this.isLoading.set(false);
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

  onResetCreateForm() {
    this.createFormGroup.reset();
  }
}
