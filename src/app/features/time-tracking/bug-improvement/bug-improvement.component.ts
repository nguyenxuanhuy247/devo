import { Component, Injector, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BUG_IMPROVEMENT_FORM_GROUP_KEYS,
  BUG_IMPROVEMENT_LIST_COLUMN_FIELD,
  bugImprovementListHeaderColumns,
} from './bug-improvement.model';
import { EApiMethod, EMode } from 'src/app/contants/common.constant';
import {
  EGetApiMode,
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
import { ConvertIdToNamePipe, FormatDatePipe, RoundPipe } from '../../../pipes';
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
import { message } from '../../../contants/api.contant';
import {
  ISelectFormGroup,
  ITabComponent,
  SELECT_FORM_GROUP_KEY,
} from '../time-tracking.model';
import { IBugImprovementListResponseDTO } from './bug-improvement.dto.model';

@Component({
  selector: 'app-bug-improvement',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    ButtonModule,
    ConvertIdToNamePipe,
    FormatDatePipe,
    TagModule,
    RoundPipe,
    LibFormSelectComponent,
    DatePicker,
    InputText,
    Textarea,
    WorkDurationDirective,
  ],
  templateUrl: './bug-improvement.component.html',
  styleUrl: './bug-improvement.component.scss',
})
export class BugImprovementComponent
  extends FormBaseComponent
  implements OnInit, ITabComponent
{
  formGroupControl = input<FormGroup>();
  projectFormControl = input<LibFormSelectComponent>();

  protected readonly FORM_GROUP_KEYS = BUG_IMPROVEMENT_FORM_GROUP_KEYS;
  protected readonly ETabName = ETabName;
  protected readonly COLUMN_FIELD = BUG_IMPROVEMENT_LIST_COLUMN_FIELD;
  protected readonly EMode = EMode;
  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  timeTrackingService = this.injector.get(TimeTrackingApiService);

  allDropdownData$ = this.timeTrackingStore.allDropdownData$;
  moduleDependentOptions$ = this.timeTrackingStore.moduleDependentOptions$;
  menuDependentOptions$ = this.timeTrackingStore.menuDependentOptions$;
  screenDependentOptions$ = this.timeTrackingStore.screenDependentOptions$;
  featureDependentOptions$ = this.timeTrackingStore.featureDependentOptions$;
  tabOptions$ = this.timeTrackingStore.tabOptions$;
  categoryOptions$ = this.timeTrackingStore.categoryOptions$;

  tableData: any[];
  headerColumnConfigs: IColumnHeaderConfigs[] = bugImprovementListHeaderColumns;
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: ETabName.BUG,
    ids: null,
    data: null,
  });
  formArray: FormArray = new FormArray([]);
  subscription: Subscription = new Subscription();
  private getTableDataApiRequest$ = new Subject<void>(); // Subject để trigger API call
  doGetRequestDTO = signal<ITimeTrackingDoGetRequestDTO>({
    method: EApiMethod.GET,
    mode: EGetApiMode.TABLE_DATA,
    employeeLevelId: null,
    employeeId: null,
    projectId: null,
    issueId: null,
    sheetName: ETabName.BUG,
    startTime: null,
    endTime: null,
  });

  DBTableName = signal<ID>(null);

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.subscription.add(
      this.tabOptions$.subscribe((tabOptions: IOption[]) => {
        const sheetName = tabOptions?.find(
          (tab: IOption) => tab.label === ETabName.LOG_WORK,
        )?.label;

        console.log('aaaaaaaa ', sheetName);
        this.DBTableName.set(sheetName);
      }),
    );

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
                sheetName: ETabName.BUG,
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
        .subscribe((listData: IBugImprovementListResponseDTO[]) => {
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

  onChangeToUpdateMode(index: number) {
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

    this.timeTrackingService
      .deleteItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
      )
      .subscribe((_) => {
        // this.callAPIGetTableData();
      });
  }

  getFormGroup(index: number): FormGroup {
    return this.getFormGroupInFormArray(this.formArray, index);
  }

  onSetCurrentTimeForDatepicker(index: number, formControlName: string) {
    // let control: FormControl;
    // if (this.mode() === EMode.UPDATE) {
    //   control = this.getFormControl(index, formControlName);
    // } else {
    //   control = this.getControl(
    //     formControlName,
    //     this.createFormGroup,
    //   ) as FormControl;
    // }
    // control.setValue(new Date());
  }

  onCancelUpdateMode(index: number) {
    this.getFormGroupInFormArray(this.formArray, index).patchValue({
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
        finalize(() => {}),
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
}
