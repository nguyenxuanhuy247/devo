import {
  Component,
  computed,
  Injector,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IImprovementRowData,
  IMPROVEMENT_COLUMN_FIELD,
  IMPROVEMENT_FORM_GROUP_KEYS,
  improvementHeaderColumnConfigs,
  improvementNullableObj,
} from './improvement.model';
import { EApiMethod, EMode } from 'src/app/contants/common.constant';
import {
  EGetApiMode,
  ESheetName,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../time-tracking.dto';
import { TableModule } from 'primeng/table';
import {
  IColumnHeaderConfigs,
  ID,
} from '../../../shared/interface/common.interface';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ConvertIdToNamePipe } from '../../../pipes';
import { TimeTrackingStore } from '../time-tracking.store';
import { TagModule } from 'primeng/tag';
import {
  ILogWorkRowData,
  logWorkNullableObj,
} from '../log-work/log-work.model';
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
  ISelectFormGroup,
  ITabComponent,
  SELECT_FORM_GROUP_KEY,
} from '../time-tracking.model';
import { IImprovementResponseDTO } from './improvement.dto.model';
import { Checkbox } from 'primeng/checkbox';
import { IIssuesRowData } from '../issues/issues.model';
import * as _ from 'lodash';
import { TabComponentBaseComponent } from '../../../shared/base/tab-component-base/tab-component-base.component';

@Component({
  selector: 'app-improvement',
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
  ],
  templateUrl: './improvement.component.html',
  styleUrl: './improvement.component.scss',
  host: {
    style: 'display: block; height: 100%;',
  },
})
export class ImprovementComponent
  extends TabComponentBaseComponent
  implements OnInit, ITabComponent
{
  // formGroupControl = input<FormGroup>();
  projectFormControl = input<LibFormSelectComponent>();
  issueRowData = input<IIssuesRowData>(null);

  issueId = computed<ID>(() => {
    return this.issueRowData()?.id;
  });
  issueCommonData = computed(() => {
    return {
      moduleId: this.issueRowData()?.moduleId,
      menuId: this.issueRowData()?.menuId,
      screenId: this.issueRowData()?.screenId,
      featureId: this.issueRowData()?.featureId,
      categoryId: this.issueRowData()?.categoryId,
    };
  });

  commonFormGroupValue = computed(() => {
    const commonValue = _.cloneDeep(this.formGroupControl.value);
    delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
    delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
    delete commonValue[SELECT_FORM_GROUP_KEY.formArray];

    return commonValue;
  });
  protected readonly FORM_GROUP_KEYS = IMPROVEMENT_FORM_GROUP_KEYS;
  protected readonly ETabName = ESheetName;
  protected readonly COLUMN_FIELD = IMPROVEMENT_COLUMN_FIELD;
  protected readonly EMode = EMode;
  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  timeTrackingService = this.injector.get(TimeTrackingApiService);

  allDropdownData$ = this.timeTrackingStore.allDropdownData$;
  moduleDependentOptions$ = this.timeTrackingStore.moduleDependentOptions$;
  menuDependentOptions$ = this.timeTrackingStore.menuDependentOptions$;
  screenDependentOptions$ = this.timeTrackingStore.screenDependentOptions$;
  featureDependentOptions$ = this.timeTrackingStore.featureDependentOptions$;
  categoryOptions$ = this.timeTrackingStore.categoryOptions$;
  issueDependentScreenOptions$ =
    this.timeTrackingStore.issueDependentScreenOptions$;

  tableData: any[];
  headerColumnConfigs: IColumnHeaderConfigs[] = improvementHeaderColumnConfigs;
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: ESheetName.IMPROVEMENT,
    ids: null,
    data: null,
  });
  createFormGroup!: FormGroup;
  fixedRowData: ILogWorkRowData[] = [];
  formArray: FormArray = new FormArray([]);
  subscription: Subscription = new Subscription();
  private getTableDataApiRequest$ = new Subject<void>(); // Subject để trigger API call
  doGetRequestDTO = signal<ITimeTrackingDoGetRequestDTO>({
    method: EApiMethod.GET,
    mode: EGetApiMode.TABLE_DATA,
    employeeLevelId: null,
    employeeId: null,
    projectId: null,
    issueId: this.issueId(),
    sheetName: ESheetName.IMPROVEMENT,
    startTime: null,
    endTime: null,
  });
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();
    const formValue = this.formGroupControl.value;
    this.addCreateRowForm();
    this.createFormGroup = this.formBuilder.group({
      ...improvementNullableObj,
      ...this.issueCommonData(),
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
            this.doGetRequestDTO.update((oldValue: any) => {
              const formGroupValue =
                this.formGroupControl.getRawValue() as ISelectFormGroup;

              return {
                ...oldValue,
                employeeLevelId: formGroupValue.employeeLevelId,
                employeeId: formGroupValue.employeeId,
                projectId: formGroupValue.projectId,
                sheetName: ESheetName.IMPROVEMENT,
                startTime: this.issueId()
                  ? null
                  : formGroupValue.dateRange[0].toISOString(),
                endTime: this.issueId()
                  ? null
                  : formGroupValue.dateRange[1].toISOString(),
                issueId: this.issueId(),
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
                    detail: `Thêm mới improvement thất bại, kiểm tra hàm onSaveUpdate`,
                  });
                  this.timeTrackingStore.setLoading(false);
                  return EMPTY;
                }),
                finalize(() => {
                  this.timeTrackingStore.setLoading(false);
                }),
              );
          }),
        )
        .subscribe((listData: IImprovementResponseDTO[]) => {
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
        this.formGroupControl,
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
        ...logWorkNullableObj,
        mode: EMode.CREATE,
        isLunchBreak: true,
        createdDate: new Date(),
      },
    ];
  }

  onChangeToUpdateMode(index: number) {
    this.mode.set(EMode.UPDATE);

    const formGroup = this.getFormGroup(index);
    formGroup.patchValue({ mode: EMode.UPDATE });
    this.tableData = this.formArray.value;
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
            detail: `Xóa improvement thất bại, kiểm tra hàm onDelete`,
          });
          this.timeTrackingStore.setLoading(false);
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.callAPIGetTableData();
      });
  }

  getFormGroup(index: number): FormGroup {
    return this.getSubFormGroupInFormArray(this.formArray, index);
  }

  // onSetCurrentTimeForDatepicker(formindex: number, formControlName: string) {
  //   let control: FormControl;
  //   if (this.mode() === EMode.UPDATE) {
  //     control = this.getFormControl(index, formControlName);
  //   } else {
  //     control = this.getControl(
  //       formControlName,
  //       this.createFormGroup,
  //     ) as FormControl;
  //   }
  //   control.setValue(new Date());
  // }

  getFormControl(index: number, formControlName: string): FormControl {
    return this.formArray?.at(index)?.get(formControlName) as FormControl;
  }

  onSaveCreate() {
    const outsideValue = this.issueId()
      ? {
          issueId: this.issueId(),
        }
      : {};
    const data: IImprovementRowData = {
      ...this.createFormGroup.value,
      ...this.commonFormGroupValue(),
      ...outsideValue,
      createdDate: new Date(),
      updatedDate: null,
    };

    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      sheetName: ESheetName.IMPROVEMENT,
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

  onCancelUpdateMode(index: number) {
    this.mode.set(EMode.VIEW);
    this.getSubFormGroupInFormArray(this.formArray, index).patchValue({
      mode: EMode.VIEW,
    });
    this.tableData = this.formArray.value;
  }

  /**
   * @usage Cập nhật bản ghi
   */
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

    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .updateItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Cập nhật improvement thất bại, kiểm tra hàm onSaveUpdate`,
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

  onResetCreateForm() {
    this.createFormGroup.reset();
  }

  callAPIGetTableData(): void {
    this.getTableDataApiRequest$.next();
  }
}
