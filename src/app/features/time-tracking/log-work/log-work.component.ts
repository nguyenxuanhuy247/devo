import { Component, Injector, input, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  FORM_GROUP_KEYS,
  IAllDependentDropDown,
  IIndependentDropDownSignal,
  nullableObj,
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
import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';
import {
  ILogWorkRowData,
  LOG_WORK_COLUMN_FIELD,
  logWorkHeaderColumnConfigs,
} from './log-work.model';
import { FormBaseComponent } from 'src/app/shared';
import { TimeTrackingApiService } from '../time-tracking-api.service';
import {
  catchError,
  debounceTime,
  EMPTY,
  finalize,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { message } from 'src/app/contants/api.contant';
import { filter } from 'lodash';
import { LibFormSelectComponent } from 'src/app/components';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';

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
  ],
  templateUrl: './log-work.component.html',
  styleUrl: './log-work.component.scss',
})
export class LogWorkComponent extends FormBaseComponent implements OnInit {
  independentDropdowns = input<IIndependentDropDownSignal>();
  protected readonly FORM_GROUP_KEYS = FORM_GROUP_KEYS;
  protected readonly ETabName = ETabName;
  protected readonly COLUMN_FIELD = LOG_WORK_COLUMN_FIELD;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  protected readonly EMode = EMode;
  headerColumnConfigs: IColumnHeaderConfigs[] = logWorkHeaderColumnConfigs;

  isLoading = signal(false);

  formArray!: FormArray;
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

  constructor(override injector: Injector) {
    super(injector);

    this.createFormGroup = this.formBuilder.group({
      ...nullableObj,
      mode: EMode.CREATE,
      // tab: this.activeTab(),
      employee: null,
      employeeLevel: null,
      isLunchBreak: true,
      createdDate: new Date(),
    });
  }

  ngOnInit() {
    this.formArray = this.formGroup.get('formArray') as FormArray;

    this.initSubscriptions();
  }

  initSubscriptions() {
    this.onDestroy$.subscribe(() => {});

    this.subscription.add(
      this.getTableDataApiRequest$
        .pipe(
          debounceTime(300), // Giảm số lần gọi API nếu nhiều yêu cầu liên tiếp
          switchMap(() => {
            this.isLoading.set(true);

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
              startTime: rowData.startTime ? new Date(rowData.startTime) : null,
              endTime: rowData.endTime ? new Date(rowData.endTime) : null,
            });
            this.formArray.push(formGroup);
          });

          this.tableData = this.formArray.value;
          this.createFormGroup.reset();

          this.addCreateRowForm();
        }),
    );
  }

  fixedRowData: ILogWorkRowData[] = [];
  addCreateRowForm() {
    this.fixedRowData = [
      {
        ...nullableObj,
        mode: EMode.CREATE,
        // tab: this.activeTab(),
        employee: this.getControlValue(this.FORM_GROUP_KEYS.employeeId),
        employeeLevel: this.getControlValue(
          this.FORM_GROUP_KEYS.employeeLevelId,
        ),
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

  private getTableDataApiRequest$ = new Subject<void>(); // Subject để trigger API call
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

  /**
   * @usage Lấy danh sách Dropdown phụ thuộc trong Form thêm mới
   */
  getDependentDropDown(
    index: number,
    rowData: ILogWorkRowData,
    dependentFormControlName: string,
  ): any {
    const mode = rowData.mode;
    let value;
    if (mode === EMode.CREATE) {
      value = this.getControlValue(
        dependentFormControlName,
        this.createFormGroup,
      );
    } else {
      value = this.getFormControl(index, dependentFormControlName)?.value;
    }

    let dropDownOptions: IAllDependentDropDown;
    switch (dependentFormControlName) {
      case FORM_GROUP_KEYS.moduleId: {
        dropDownOptions = this.moduleMenuDropdown();
        break;
      }
      case FORM_GROUP_KEYS.menuId: {
        dropDownOptions = this.menuScreenDropdown();
        break;
      }
      case FORM_GROUP_KEYS.menuId: {
        dropDownOptions = this.departmentInterruptionReasonDropdown();
        break;
      }
      default: {
        dropDownOptions = this.screenFeatureDropdown();
        break;
      }
    }

    return dropDownOptions?.[value] || [];
  }
}
