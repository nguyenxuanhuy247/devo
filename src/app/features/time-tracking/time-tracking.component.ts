import {
  Component,
  computed,
  effect,
  Injector,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { FormBaseComponent } from '../../shared';
import { TimeTrackingApiService } from './time-tracking-api.service';
import {
  EGetApiMode,
  ETabName,
  IEmployeeResponseDTO,
  ITabResponseDTO,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from './time-tracking.dto';
import { PaginatorModule } from 'primeng/paginator';
import {
  catchError,
  combineLatest,
  EMPTY,
  filter,
  finalize,
  Subscription,
} from 'rxjs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import {
  EStatsBy,
  IAllDropDownResponseDTO,
  IDefaultValueInLocalStorage,
  ITabComponent,
  LOCAL_STORAGE_KEY,
  nullableObj,
  SELECT_FORM_GROUP_KEY,
} from './time-tracking.model';
import { TabsModule } from 'primeng/tabs';
import { CreateFormComponent } from './create-form/create-form.component';
import { TooltipModule } from 'primeng/tooltip';
import { EApiMethod, EMode } from '../../contants/common.constant';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonService } from '../../services';
import { ID } from '../../shared/interface/common.interface';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { message } from '../../contants/api.contant';
import * as _ from 'lodash';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LibFormSelectComponent } from 'src/app/components';
import { TagModule } from 'primeng/tag';
import { FixBugDoImprovementComponent } from './fix-bug-do-improvement/fix-bug-do-improvement.component';
import {
  ILogWorkRowData,
  LOG_WORK_COLUMN_FIELD,
} from './log-work/log-work.model';
import { LogWorkComponent } from './log-work/log-work.component';
import { TimeTrackingStore } from './time-tracking.store';
import { getValue } from 'src/app/utils/function';
import { IssuesComponent } from './issues/issues.component';
import { BugImprovementComponent } from './bug-improvement/bug-improvement.component';

@Component({
  selector: 'app-time-tracking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    InputNumberModule,
    TableModule,
    PaginatorModule,
    SelectModule,
    DatePickerModule,
    TabsModule,
    TooltipModule,
    SplitButtonModule,
    ProgressSpinnerModule,
    BlockUIModule,
    TextareaModule,
    DatePickerModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    RadioButtonModule,
    ConfirmDialogModule,
    LibFormSelectComponent,
    TagModule,
    FixBugDoImprovementComponent,
    LogWorkComponent,
    IssuesComponent,
    BugImprovementComponent,
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
})
export class TimeTrackingComponent extends FormBaseComponent implements OnInit {
  activeTab = signal<ETabName>(ETabName.ISSUE);
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
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    sheetName: null,
    ids: null,
    data: null,
  });
  timeTrackingService = this.injector.get(TimeTrackingApiService);
  commonService = this.injector.get(CommonService);
  subscription: Subscription = new Subscription();
  SELECT_FORM_GROUP_KEY = SELECT_FORM_GROUP_KEY;
  ETabName = ETabName;
  COLUMN_FIELD = LOG_WORK_COLUMN_FIELD;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  EMode = EMode;
  isLoading = signal(false);
  tableData: ILogWorkRowData[] = [];
  formArray!: FormArray;
  fixedRowData: ILogWorkRowData[] = [];
  createFormGroup!: FormGroup;

  currentEmployee = signal<IEmployeeResponseDTO>(null);
  allDropdownData = signal<IAllDropDownResponseDTO>({
    tabs: [],
    categories: [],
    dayOffs: [],
    departments: [],
    employeeLevels: [],
    employees: [],
    projects: [],
    modules: [],
    menus: [],
    screens: [],
    features: [],
    stages: [],
    statuses: [],
  });
  tabId = computed<ID>(() => {
    const tabName = this.activeTab();
    const foundTab = this.allDropdownData().tabs.find(
      (item: ITabResponseDTO) => item.tabName === tabName,
    );
    return foundTab?.id;
  });
  @ViewChild(FixBugDoImprovementComponent, { static: true })
  fixBugDoImprovementComponent: FixBugDoImprovementComponent;

  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  employeeLevelOptions$ = this.timeTrackingStore.employeeLevelOptions$;
  employeeDependentOptions$ = this.timeTrackingStore.employeeDependentOptions$;
  projectDependentOptions$ = this.timeTrackingStore.projectDependentOptions$;
  allDropdownData$ = this.timeTrackingStore.allDropdownData$;

  constructor(override injector: Injector) {
    super(injector);

    this.createFormGroup = this.formBuilder.group({
      ...nullableObj,
      mode: EMode.CREATE,
      tab: this.activeTab(),
      employee: null,
      employeeLevel: null,
      isLunchBreak: true,
      createdDate: new Date(),
    });

    effect(() => {
      if (
        this.activeTab() === ETabName.BUG ||
        this.activeTab() === ETabName.IMPROVEMENT ||
        this.activeTab() === ETabName.FIX_BUG_DO_IMPROVEMENT
      ) {
        this.fixedRowData = [];
      } else {
        this.addCreateRowForm();
      }
    });
  }

  override ngOnInit() {
    super.ngOnInit();

    this.formGroup = this.formBuilder.group({
      [SELECT_FORM_GROUP_KEY.employeeLevelId]: null,
      [SELECT_FORM_GROUP_KEY.employeeId]: null,
      [SELECT_FORM_GROUP_KEY.projectId]: null,
      [SELECT_FORM_GROUP_KEY.dateRange]: null,
      [SELECT_FORM_GROUP_KEY.quickDate]: null,
      [SELECT_FORM_GROUP_KEY.formArray]: this.formBuilder.array([]),
    });

    this.formArray = this.formGroup.get('formArray') as FormArray;

    this.getControl(SELECT_FORM_GROUP_KEY.dateRange).disable();

    // Phải gọi trước khi khởi tạo giá trị cho dateRange
    this.initSubscriptions();

    // Thiết lập giá trị ban đầu cho "Thống kê bởi"
    if (this.activeTab() === ETabName.ISSUE) {
      this.getControl(SELECT_FORM_GROUP_KEY.quickDate).setValue(EStatsBy.ALL);
    } else {
      this.getControl(SELECT_FORM_GROUP_KEY.quickDate).setValue(EStatsBy.TODAY);
    }

    this.timeTrackingStore.getAllDropdownData();

    document.addEventListener(
      'visibilitychange',
      this.warningWhenChangeChromeTab,
    );
    this.warningWhenChangeChromeTab();
  }

  initSubscriptions() {
    this.onDestroy$.subscribe(() => {
      this.subscription.unsubscribe();
    });

    this.subscription.add(
      combineLatest(
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.employeeLevelId),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.employeeId),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.projectId),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.dateRange).pipe(
          filter((range) => range.every((date: Date) => !!date)),
        ),
      ).subscribe(([employeeLevelId, employeeId, projectId, dateRange]) => {
        this.doGetRequestDTO.update((oldValue) => ({
          ...oldValue,
          employeeLevelId: employeeLevelId,
          employeeId: employeeId,
          projectId: projectId,
          tabId: this.tabId(),
          startTime: dateRange[0].toISOString(),
          endTime: dateRange[1].toISOString(),
        }));
      }),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.projectId).subscribe(
        (_: string) => {
          // Thiết lập giờ cho ô Tùy chỉnh sau khi chọn dự án
          this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
            startOfDay(new Date()),
            endOfDay(new Date()),
          ]);

          // Lưu những thông tin chung vào store và local storage
          const employeeId = this.getControlValue(
            SELECT_FORM_GROUP_KEY.employeeId,
          );
          const selectedEmployee = getValue(
            this.allDropdownData$,
          )?.employees.find((employee) => employee.id === employeeId);

          const commonValue = {
            employeeLevelId: this.getControlValue(
              SELECT_FORM_GROUP_KEY.employeeLevelId,
            ),
            employeeId: this.getControlValue(SELECT_FORM_GROUP_KEY.employeeId),
            employee: selectedEmployee,
            projectId: this.getControlValue(SELECT_FORM_GROUP_KEY.projectId),
          };

          this.timeTrackingStore.setSharedData(commonValue);
        },
      ),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.quickDate).subscribe(
        (dateString: string) => {
          console.log('quickDate ', dateString);
          this.getControl(SELECT_FORM_GROUP_KEY.dateRange).disable({
            emitEvent: false,
          });

          switch (dateString) {
            case EStatsBy.ALL:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
                new Date('1900-01-01'), // Ngày nhỏ nhất hợp lý
                new Date('9999-12-31'), // Ngày lớn nhất hợp lý
              ]);

              console.log(
                'vaaa ',
                this.getControl(SELECT_FORM_GROUP_KEY.dateRange),
              );
              break;
            case EStatsBy.TODAY:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
                startOfDay(new Date()),
                endOfDay(new Date()),
              ]);
              break;
            case EStatsBy.WEEK:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
                startOfWeek(new Date(), { weekStartsOn: 1 }),
                endOfWeek(new Date(), { weekStartsOn: 1 }),
              ]);
              break;
            case EStatsBy.MONTH:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
                startOfMonth(new Date()),
                endOfMonth(new Date()),
              ]);
              break;
            default:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).enable({
                emitEvent: false,
              });
          }
        },
      ),
    );

    this.subscription.add(
      this.createFormGroup.valueChanges.subscribe((value: any) => {
        if (
          this.activeTab() === ETabName.LOG_WORK ||
          this.activeTab() === ETabName.ISSUE
        ) {
          const isStartTimeTracking = value.startTime && !value.endTime;

          if (!isStartTimeTracking) {
            this.startBlinking();
          } else {
            this.clearBlinking();
          }
        }
      }),
    );

    this.subscription.add(
      this.projectDependentOptions$.subscribe((_) => {
        this.setDefaultValue();
      }),
    );
  }

  /**
   * Thiết lập giá trị mặc định từ Local Storage để user không cần nhập thông tin chung
   */
  setDefaultValue() {
    const defaultValue: IDefaultValueInLocalStorage =
      this.localStorageService.getItem(LOCAL_STORAGE_KEY);
    if (defaultValue) {
      this.formGroup.patchValue(defaultValue);
    }
  }

  onChangeTab(event: ID) {
    this.activeTab.set(event as ETabName);
  }

  addCreateRowForm() {
    this.fixedRowData = [
      {
        ...nullableObj,
        mode: EMode.CREATE,
        tab: this.activeTab(),
        isLunchBreak: true,
        createdDate: new Date(),
      },
    ];
  }

  onViewDetail(event: Event) {
    event.stopPropagation();

    const drawerRef = this.drawerService.create({
      component: CreateFormComponent,
      data: {},
      configs: {
        width: '51.5rem',
      },
    });
  }

  getFormControl(index: number, formControlName: string): FormControl {
    return this.formArray?.at(index)?.get(formControlName) as FormControl;
  }

  getFormGroup(index: number): FormGroup {
    return this.formArray?.at(index) as FormGroup;
  }

  onCancelUpdateMode(index: number) {
    this.mode.set(EMode.VIEW);
    this.getFormGroup(index).patchValue({ mode: EMode.VIEW });
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
        // this.callAPIGetTableData();
      });
  }

  onMarkFinish() {
    this.createFormGroup.reset();
  }

  onResetCreateForm() {
    this.createFormGroup.reset();
  }

  getCommonValue() {
    const commonValue = _.cloneDeep(this.formGroup.value);
    delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
    delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
    delete commonValue[SELECT_FORM_GROUP_KEY.formArray];

    return commonValue;
  }

  onSaveCreate() {
    const data: ILogWorkRowData = {
      ...this.createFormGroup.value,
      ...this.getCommonValue(),
      createdDate: new Date(),
      tab: this.activeTab(),
    };

    this.isLoading.set(true);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      data: [data],
    }));

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
        // this.callAPIGetTableData();
      });
  }

  onChangeToUpdateMode(index: number) {
    this.mode.set(EMode.UPDATE);

    const formGroup = this.getFormGroup(index);
    formGroup.patchValue({ mode: EMode.UPDATE });
    this.tableData = this.formArray.value;
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
        // this.callAPIGetTableData();
      });
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

  @ViewChild('tab') tabComponent!: ITabComponent;

  onReload() {
    console.log('aaaaaaaaa ', this.tabComponent);
    this.tabComponent.callAPIGetTableData();
  }

  checkForFixBugAndImprovementUpdates() {
    if (!this.currentEmployee()?.bugImprovementApi) return;
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.timeTrackingService
      .getBugImprovementContinuousUpdate(
        this.currentEmployee().bugImprovementApi,
        {},
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe((list) => {
        this.tableData = list?.map((rowData) => {
          return {
            ...nullableObj,
            ...rowData,
            startTime: rowData.startTime ? new Date(rowData.startTime) : null,
            endTime: rowData.endTime ? new Date(rowData.endTime) : null,
            createdDate: rowData.createdDate
              ? new Date(rowData.createdDate)
              : null,
          };
        });
        this.fixedRowData = [];

        this.warningWhenChangeChromeTab();
        this.isLoading.set(false);
      });
  }

  openGoogleSheets() {
    window.open(this.currentEmployee().bugImprovementSpreadsheet, '_blank'); // Mở trong tab mới
  }

  onBulkCreate() {
    let listData: any;

    this.isLoading.set(true);
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

        if (this.activeTab() === ETabName.FIX_BUG_DO_IMPROVEMENT) {
          this.isLoading.set(false);
          this.onDeleteLogTimeFixBugSheets();
        }

        // this.callAPIGetTableData();
      });
  }

  // Xóa thời gian bắt đầu và kết thúc ở Trang tính fix bug
  onDeleteLogTimeFixBugSheets() {
    this.timeTrackingService
      .deleteLogTimeInFixBugSheetAsync()
      .subscribe((res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: res?.message,
        });
      });
  }

  onBulkDelete() {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: 'Bạn có chắc chắn muốn xóa hết dữ liệu?',
      message: 'Dữ liệu sẽ không thể khôi phục lại',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Hủy',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Xóa',
        severity: 'danger',
      },
      accept: () => {
        const listIds = this.tableData.map(
          (rowData: ILogWorkRowData) => rowData.id,
        );

        this.isLoading.set(true);
        this.doPostRequestDTO.update((oldValue) => ({
          ...oldValue,
          method: EApiMethod.DELETE,
          ids: listIds,
          data: null,
        }));

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

            if (this.activeTab() === ETabName.FIX_BUG_DO_IMPROVEMENT) {
              this.isLoading.set(false);
            }

            // this.callAPIGetTableData();
          });
      },
    });
  }
}
