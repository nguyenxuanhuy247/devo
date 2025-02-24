import {
  Component,
  Injector,
  input,
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
  nullableIssuesObj,
} from './issues.model';
import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {
  DATE_FORMAT,
  EApiMethod,
  EMode,
} from '../../../contants/common.constant';
import { FormBaseComponent } from '../../../shared';
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
  ETabName,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../time-tracking.dto';
import { TimeTrackingApiService } from '../time-tracking-api.service';
import { message } from 'src/app/contants/api.contant';
import { IIssueResponseDTO } from './issues.dto.model';
import * as _ from 'lodash';
import { Checkbox } from 'primeng/checkbox';
import { getValue } from '../../../utils/function';
import { ImprovementComponent } from '../improvement/improvement.component';

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
  extends FormBaseComponent
  implements OnInit, ITabComponent
{
  formGroupControl = input<FormGroup>();
  projectFormControl = input<LibFormSelectComponent>();

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
    sheetName: ETabName.LOG_WORK,
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
      mode: EMode.VIEW,
      id: null,
      moduleId: [null, Validators.required],
      menuId: null,
      screenId: null,
      featureId: null,
      categoryId: null,
      issueCode: `VOFFICE-${this.getRandom8DigitNumber()}`,
      issueName: null,
      issueContent: null,
      departmentMakeId: null,
      employeeMakeId: null,
      interruptionReasonId: null,
      deadlineId: null,
      isBlockProgress: false,
      statusId: null,
      startTime: null,
      endTime: null,
      duration: null,
      createdDate: new Date(),
      updatedDate: null,
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
                this.formGroupControl().getRawValue() as ISelectFormGroup;

              return {
                ...oldValue,
                employeeLevelId: formGroupValue.employeeLevelId,
                employeeId: formGroupValue.employeeId,
                projectId: formGroupValue.projectId,
                sheetName: ETabName.ISSUE,
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
            const formGroup = this.formBuilder.group({
              ...rowData,
              mode: EMode.VIEW,
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
        .subscribe((_) => {
          // Sau khi thiết lập các giá trị chung như Level, Nhân viên, dự án, thời gian mới gọi API lấy danh sách
          this.callAPIGetTableData();
        }),
    );
  }

  getRandom8DigitNumber() {
    const min = 10000000; // Số nhỏ nhất có 8 chữ số
    const max = 99999999; // Số lớn nhất có 8 chữ số
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  addCreateRowForm() {
    this.fixedRowData = [
      {
        ...nullableIssuesObj,
        mode: EMode.CREATE,
        createdDate: new Date(),
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
    return this.getFormGroupInFormArray(this.formArray, index);
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
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.PUT,
      data: [
        {
          ...value,
          statusId: completeStatusId,
          endTime: new Date(),
          updatedDate: new Date(),
        },
      ],
    }));
    this.callAPIUpdateIssue();
  }

  private getTableDataApiRequest$ = new Subject<void>(); // Subject để trigger API call
  callAPIGetTableData(): void {
    this.getTableDataApiRequest$.next();
  }

  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: ETabName.ISSUE,
    ids: null,
    data: null,
  });

  getCommonValue() {
    const commonValue = _.cloneDeep(this.formGroupControl().value);
    delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
    delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
    delete commonValue[SELECT_FORM_GROUP_KEY.formArray];

    return commonValue;
  }

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
    this.getFormGroupInFormArray(this.formArray, index).patchValue({
      mode: EMode.VIEW,
    });
    this.tableData = this.formArray.value;
  }

  onSaveUpdate(index: number) {
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

  protected readonly DATE_FORMAT = DATE_FORMAT;
}
