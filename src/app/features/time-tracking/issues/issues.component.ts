import {
  Component,
  Injector,
  OnInit,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { LibFormSelectComponent } from 'src/app/components';
import {
  IIssueCreateFormGroup,
  IIssuesRowData,
  ISSUES_COLUMN_FIELD,
  ISSUES_FORM_GROUP_KEYS,
  issuesHeaderColumnConfigs,
  issuesNullableObj,
} from './issues.model';
import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {
  DATE_FORMAT,
  EApiMethod,
  EMode,
} from '../../../contants/common.constant';
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
import { TimeTrackingStore } from '../time-tracking.store';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import {
  DevTemplateDirective,
  WorkDurationDirective,
} from '../../../directives';
import { ConvertIdToNamePipe, FormatDatePipe, RoundPipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { LogWorkComponent } from '../log-work/log-work.component';
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
import { TimeTrackingApiService } from '../time-tracking-api.service';
import { message } from 'src/app/contants/api.contant';
import { IIssueResponseDTO } from './issues.dto.model';
import { Checkbox } from 'primeng/checkbox';
import { getValue } from '../../../utils/function';
import { ImprovementComponent } from '../improvement/improvement.component';
import { ILogWorkRowData } from '../log-work/log-work.model';
import { TabComponentBaseComponent } from 'src/app/shared/tab-component-base/tab-component-base.component';
import { BUG_FORM_GROUP_KEY } from '../bug/bug.model';
import { LogImprovementComponent } from './log-improvement/log-improvement.component';

@Component({
  selector: 'app-issues',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    LibFormSelectComponent,
    ButtonModule,
    TooltipModule,
    TextareaModule,
    DatePickerModule,
    InputTextModule,
    WorkDurationDirective,
    ConvertIdToNamePipe,
    FormatDatePipe,
    RoundPipe,
    TagModule,
    RippleModule,
    DevTemplateDirective,
    Checkbox,
    ImprovementComponent,
  ],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.scss',
})
export class IssuesComponent
  extends TabComponentBaseComponent
  implements OnInit, ITabComponent
{
  headerColumnConfigs: IColumnHeaderConfigs[] = issuesHeaderColumnConfigs;
  tableData: any[] = [];
  COLUMN_FIELD = ISSUES_COLUMN_FIELD;
  FORM_GROUP_KEYS = ISSUES_FORM_GROUP_KEYS;
  protected readonly EMode = EMode;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  fixedRowData: IIssuesRowData[] = [];

  createFormGroup!: FormGroup;
  subscription: Subscription = new Subscription();
  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  allDropdownData$ = this.timeTrackingStore.allDropdownData$;
  moduleDependentOptions$ = this.timeTrackingStore.moduleDependentOptions$;
  deadlineDependentModuleOptions$ =
    this.timeTrackingStore.deadlineDependentModuleOptions$;
  menuDependentOptions$ = this.timeTrackingStore.menuDependentOptions$;
  screenDependentOptions$ = this.timeTrackingStore.screenDependentOptions$;
  featureDependentOptions$ = this.timeTrackingStore.featureDependentOptions$;
  categoryOptions$ = this.timeTrackingStore.categoryOptions$;
  departmentOptions$ = this.timeTrackingStore.departmentOptions$;
  employeeInDepartmentOptions$ =
    this.timeTrackingStore.employeeInDepartmentOptions$;
  interruptionReasonDependentOptions$ =
    this.timeTrackingStore.interruptionReasonDependentOptions;
  statusOptions$ = this.timeTrackingStore.statusOptions;

  formArray: FormArray = new FormArray([]);

  doGetRequestDTO = signal<ITimeTrackingDoGetRequestDTO>({
    method: EApiMethod.GET,
    mode: EGetApiMode.TABLE_DATA,
    employeeLevelId: null,
    employeeId: null,
    projectId: null,
    issueId: null,
    sheetName: ESheetName.LOG_WORK,
    startTime: null,
    endTime: null,
  });
  timeTrackingService = this.injector.get(TimeTrackingApiService);
  expandedRows = {};

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.createFormGroup = this.formBuilder.group({
      ...issuesNullableObj,
      mode: EMode.VIEW,
      moduleId: [null, Validators.required],
      issueCode: `VOFFICE-${this.getRandom8DigitNumber()}`,
      createdDate: new Date(),
    });

    this.addCreateRowForm();
    this.initSubscriptions();
  }

  initSubscriptions() {
    // this.onDestroy$.subscribe(() => {});

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
                sheetName: ESheetName.ISSUE,
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
        .subscribe((listData: IIssueResponseDTO[]) => {
          this.mode.set(EMode.VIEW);
          this.formArray.clear();

          listData.forEach((rowData) => {
            const startTime = rowData.startTime
              ? new Date(rowData.startTime)
              : null;
            const duration =
              this.timeTrackingCalculateService.calculateBusinessHours(
                startTime,
              );
            const formGroup = this.formBuilder.group({
              ...issuesNullableObj,
              ...rowData,
              mode: EMode.VIEW,
              selected: false,
              startTime,
              duration,
              endTime: rowData.endTime ? new Date(rowData.endTime) : null,
            });
            this.formArray.push(formGroup);
          });

          console.log('FORM_GROUP_KEYS ', this.FORM_GROUP_KEYS);
          this.tableData = this.formArray.value;
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
      this.getControlValueChanges(
        this.FORM_GROUP_KEYS.isBlockProgress,
        this.createFormGroup,
      ).subscribe((isbool: boolean) => {
        if (isbool) {
          this.onSetCurrentTimeForDatepicker(
            this.formArray,
            -1,
            this.FORM_GROUP_KEYS.startTime,
          );
        } else {
          const control = this.getControl(
            this.FORM_GROUP_KEYS.startTime,
            this.createFormGroup,
          ) as FormControl;

          control.setValue(null);
        }
      }),
    );
  }

  getRandom8DigitNumber() {
    const min = 10000000; // Số nhỏ nhất có 8 chữ số
    const max = 99999999; // Số lớn nhất có 8 chữ số
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  addCreateRowForm() {
    this.fixedRowData = [
      {
        ...issuesNullableObj,
        mode: EMode.CREATE,
      },
    ];
  }

  onResetCreateForm() {
    this.createFormGroup.reset();
  }

  onChangeToUpdateMode(index: number) {
    this.mode.set(EMode.UPDATE);

    const formGroup = this.getFormGroup(index);
    formGroup.patchValue({ mode: EMode.UPDATE });
    this.tableData = this.formArray.value;
  }

  getFormGroup(index: number): FormGroup {
    return this.getSubFormGroupInFormArray(this.formArray, index);
  }

  onDelete(rowData: IIssuesRowData) {
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
          this.timeTrackingStore.setLoading(false);
          return EMPTY;
        }),
      )
      .subscribe((_) => {
        this.callAPIGetTableData();
      });
  }

  onMarkFinish(index: number) {
    const value = this.formArray?.at(index)?.value;
    const completeStatusId = getValue(this.statusOptions$)?.find(
      (status) => status.label === 'Đã giải quyết',
    )?.value;
    this.doPostRequestDTO.update((oldValue) => {
      const startTime = value.startTime ? new Date(value.startTime) : null;
      const endTime = new Date(value.endTime);
      const duration = this.timeTrackingCalculateService.calculateWorkHours(
        startTime,
        endTime,
        true,
      );

      return {
        ...oldValue,
        method: EApiMethod.PUT,
        data: [
          {
            ...value,
            statusId: completeStatusId,
            duration,
            endTime: new Date(),
            updatedDate: new Date(),
          },
        ],
      };
    });
    this.callAPIUpdateIssue();
  }

  private getTableDataApiRequest$ = new Subject<void>(); // Subject để trigger API call
  callAPIGetTableData(): void {
    this.getTableDataApiRequest$.next();
  }

  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: ESheetName.ISSUE,
    ids: null,
    data: null,
  });

  onSaveCreate() {
    const isValid = this.createFormGroup.valid;
    if (!isValid) {
      this.createFormGroup.markAsTouched();
      this.createFormGroup.updateValueAndValidity();
      return;
    }

    const formCreateValue =
      this.createFormGroup.getRawValue() as IIssueCreateFormGroup;
    const isBlockProgress = formCreateValue.isBlockProgress;
    const data: IIssuesRowData = {
      ...this.createFormGroup.value,
      ...this.getCommonValue(),
      startTime: isBlockProgress ? new Date() : null,
      createdDate: new Date(),
    };

    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
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
            detail: message.serverError,
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
        this.createFormGroup.reset();
      });
  }

  onCancelUpdateMode(index: number) {
    this.mode.set(EMode.VIEW);
    this.getSubFormGroupInFormArray(this.formArray, index).patchValue({
      mode: EMode.VIEW,
    });
    this.tableData = this.formArray.value;
  }

  onSaveUpdate(index: number) {
    const value = this.formArray?.at(index)?.value as IIssueCreateFormGroup;
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.PUT,
      data: [
        {
          ...value,
          startTime: value.isBlockProgress ? value.startTime : null,
          endTime: value.isBlockProgress ? value.endTime : null,
          duration: value.isBlockProgress ? value.duration : null,
          updatedDate: new Date(),
        },
      ],
    }));

    this.callAPIUpdateIssue();
  }

  callAPIUpdateIssue() {
    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .updateItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: message.serverError,
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

  @ViewChildren('logWorkComponent')
  logWorkComponents: QueryList<LogWorkComponent>;

  toggleExpandRow(rowData: IIssuesRowData, index: number) {
    setTimeout(() => {
      this.changeDetectorRef.detectChanges();
      this.logWorkComponents.forEach((component, componentIndex) => {
        if (componentIndex === index) {
          component.callAPIGetTableData();
        }
      });
    });
  }

  onDuplicateExistingItem(rowData: ILogWorkRowData) {
    this.createFormGroup.patchValue(rowData);
  }

  protected readonly DATE_FORMAT = DATE_FORMAT;
  protected readonly FORM_GROUP_KEY = BUG_FORM_GROUP_KEY;

  onOpenLogImprovementDrawer(rowData: IIssuesRowData) {
    this.drawerService.create({
      component: LogImprovementComponent,
      data: {
        rowData: rowData,
        projectFormControl: this.projectFormControl(),
        selectFormGroup: this.formGroupControl,
      },
      configs: {
        width: '100%',
      },
    });
  }
}
