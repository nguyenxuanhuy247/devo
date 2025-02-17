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
  ILogWorkTableDataResponseDTO,
  ITabResponseDTO,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from './time-tracking.dto';
import { PaginatorModule } from 'primeng/paginator';
import {
  catchError,
  combineLatest,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import {
  bugImprovementListHeaderColumns,
  CHILD_FORM_GROUP_KEYS,
  estimateHeaderColumns,
  FAKE_REPORT_DATA,
  IAllDropDownResponseDTO,
  IDefaultValueInLocalStorage,
  IDependentDropDown,
  IIndependentDropDownSignal,
  issuesHeaderColumns,
  LOCAL_STORAGE_KEY,
  nullableObj,
  SELECT_FORM_GROUP_KEY,
} from './time-tracking.model';
import { TabsModule } from 'primeng/tabs';
import { CreateFormComponent } from './create-form/create-form.component';
import { ConvertIdToNamePipe, FormatDatePipe, RoundPipe } from '../../pipes';
import { TooltipModule } from 'primeng/tooltip';
import { EApiMethod, EMode } from '../../contants/common.constant';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonService } from '../../services';
import {
  IColumnHeaderConfigs,
  ID,
  IOption,
} from '../../shared/interface/common.interface';
import { WorkDurationDirective } from '../../directives';
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
  logWorkHeaderColumnConfigs,
} from './log-work/log-work.model';
import { LogWorkComponent } from './log-work/log-work.component';
import { TimeTrackingStore } from './time-tracking.store';

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
    FormatDatePipe,
    TooltipModule,
    SplitButtonModule,
    ProgressSpinnerModule,
    BlockUIModule,
    TextareaModule,
    DatePickerModule,
    CheckboxModule,
    ButtonModule,
    WorkDurationDirective,
    InputTextModule,
    RadioButtonModule,
    RoundPipe,
    ConfirmDialogModule,
    LibFormSelectComponent,
    TagModule,
    FixBugDoImprovementComponent,
    ConvertIdToNamePipe,
    LogWorkComponent,
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
})
export class TimeTrackingComponent extends FormBaseComponent implements OnInit {
  activeTab = signal<ETabName>(ETabName.LOG_WORK);
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
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<any>>({
    method: EApiMethod.POST,
    ids: null,
    data: null,
  });

  tabId = computed<ID>(() => {
    const tabName = this.activeTab();
    const foundTab = this.allDropdownData().tabs.find(
      (item: ITabResponseDTO) => item.tabName === tabName,
    );
    console.log('tabName', tabName, foundTab);
    return foundTab?.id;
  });

  timeTrackingService = this.injector.get(TimeTrackingApiService);
  commonService = this.injector.get(CommonService);

  subscription: Subscription = new Subscription();

  SELECT_FORM_GROUP_KEY = SELECT_FORM_GROUP_KEY;
  ETabName = ETabName;
  headerColumns = computed<IColumnHeaderConfigs[]>(() => {
    switch (this.activeTab()) {
      case ETabName.ESTIMATE:
        return estimateHeaderColumns;
      case ETabName.LOG_WORK:
        return logWorkHeaderColumnConfigs;
      case ETabName.ISSUE:
        return issuesHeaderColumns;
      default:
        return bugImprovementListHeaderColumns;
    }
  });

  COLUMN_FIELD = LOG_WORK_COLUMN_FIELD;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  EMode = EMode;

  isLoading = signal(false);
  tableData: ILogWorkRowData[] = [];

  formArray!: FormArray;

  FORM_GROUP_KEYS = CHILD_FORM_GROUP_KEYS;

  fixedRowData: ILogWorkRowData[] = [];

  createFormGroup!: FormGroup;
  intervalId: any;
  FAKE_REPORT_DATA = FAKE_REPORT_DATA;
  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  employeeLevelOptions$ = this.timeTrackingStore.employeeLevelOptions$;
  employeeDependentOptions$ = this.timeTrackingStore.employeeDependentOptions$;
  projectDependentOptions$ = this.timeTrackingStore.projectDependentOptions$;

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

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      [SELECT_FORM_GROUP_KEY.employeeLevelId]: null,
      [SELECT_FORM_GROUP_KEY.employeeId]: null,
      [SELECT_FORM_GROUP_KEY.projectId]: null,
      [SELECT_FORM_GROUP_KEY.dateRange]: null,
      [SELECT_FORM_GROUP_KEY.quickDate]: 'TODAY',
      [SELECT_FORM_GROUP_KEY.formArray]: this.formBuilder.array([]),
    });

    this.formArray = this.formGroup.get('formArray') as FormArray;

    this.getControl(SELECT_FORM_GROUP_KEY.dateRange).disable();

    // Phải gọi trước khi khởi tạo giá trị cho dateRange
    this.initSubscriptions();

    this.timeTrackingStore.getAllDropdownData();
    // this.callAPIGetDependentDropdown();

    document.addEventListener(
      'visibilitychange',
      this.warningWhenChangeChromeTab,
    );
    this.warningWhenChangeChromeTab();
  }

  private originalTitle = document.title;
  private warningTitle = '⚠️ Chưa điền thời gian bắt đầu';
  private blinkInterval: any;
  formIncomplete = true; // Giả sử form chưa hoàn thành

  /*
   * @usage Hiển thị cảnh báo trên thanh tiêu đề trình duyệt
   */
  warningWhenChangeChromeTab = () => {
    const createFormValue = this.createFormGroup.value;
    const isStartTimeTracking =
      this.tableData?.some((item) => item.startTime && !item.endTime) ||
      (createFormValue.startTime && !createFormValue.endTime);

    if (!isStartTimeTracking) {
      this.startBlinking();
    } else {
      this.clearBlinking();
    }
  };

  /**
   * @usage Hiển thị nhấp nháy cảnh báo trên Tiêu đề tab trình duyệt
   */
  startBlinking() {
    this.clearBlinking();
    this.blinkInterval = setInterval(() => {
      document.title =
        document.title === this.originalTitle
          ? this.warningTitle
          : this.originalTitle;
    }, 500);
  }

  clearBlinking() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      document.title = this.originalTitle;
    }
  }

  fetchDataFromBugImprovementList() {
    this.checkForFixBugAndImprovementUpdates();
    this.intervalId = setInterval(
      () => this.checkForFixBugAndImprovementUpdates(),
      36000,
    );
  }

  currentEmployee = signal<IEmployeeResponseDTO>(null);

  initSubscriptions() {
    this.onDestroy$.subscribe(() => {
      this.subscription.unsubscribe();
      document.removeEventListener(
        'visibilitychange',
        this.warningWhenChangeChromeTab,
      );
      clearInterval(this.blinkInterval);
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

        this.callAPIGetTableData();
      }),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.employeeId).subscribe(
        (employeeId: ID) => {
          const employee = this.allDropdownData()?.employees.find(
            (employee) => employee.id === employeeId,
          );
          this.currentEmployee.set({
            ...employee,
            employeeLevelId: this.getControlValue(
              this.SELECT_FORM_GROUP_KEY.employeeLevelId,
            ),
          });
        },
      ),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.projectId).subscribe(
        (_: string) => {
          this.getControl(CHILD_FORM_GROUP_KEYS.dateRange).setValue([
            startOfDay(new Date()),
            endOfDay(new Date()),
          ]);

          const defaultValue = {
            employeeLevelId: this.getControlValue(
              CHILD_FORM_GROUP_KEYS.employeeLevelId,
            ),
            employeeId: this.getControlValue(CHILD_FORM_GROUP_KEYS.employeeId),
            projectId: this.getControlValue(CHILD_FORM_GROUP_KEYS.projectId),
          };

          this.localStorageService.setItem(LOCAL_STORAGE_KEY, defaultValue);
        },
      ),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.quickDate).subscribe(
        (dateString: string) => {
          this.getControl(CHILD_FORM_GROUP_KEYS.dateRange).disable({
            emitEvent: false,
          });

          switch (dateString) {
            case 'TODAY':
              this.getControl(CHILD_FORM_GROUP_KEYS.dateRange).setValue([
                startOfDay(new Date()),
                endOfDay(new Date()),
              ]);
              break;
            case 'WEEK':
              this.getControl(CHILD_FORM_GROUP_KEYS.dateRange).setValue([
                startOfWeek(new Date(), { weekStartsOn: 1 }),
                endOfWeek(new Date(), { weekStartsOn: 1 }),
              ]);
              break;
            case 'MONTH':
              this.getControl(CHILD_FORM_GROUP_KEYS.dateRange).setValue([
                startOfMonth(new Date()),
                endOfMonth(new Date()),
              ]);
              break;
            default:
              this.getControl(CHILD_FORM_GROUP_KEYS.dateRange).enable({
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
      this.getTableDataApiRequest$
        .pipe(
          debounceTime(300), // Giảm số lần gọi API nếu nhiều yêu cầu liên tiếp
          filter(() => this.activeTab() !== ETabName.FIX_BUG_DO_IMPROVEMENT),
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

          if (
            this.activeTab() === ETabName.ESTIMATE ||
            this.activeTab() === ETabName.LOG_WORK ||
            this.activeTab() === ETabName.ISSUE
          ) {
            this.addCreateRowForm();
          }
        }),
    );
  }

  employeeLevelOptions = signal<IOption[]>([]);
  dependentDropDown = signal<IDependentDropDown>({});

  // employeeOptions = signal<IOption[]>([]);
  projectModuleDropdown = signal<IDependentDropDown>(null);
  moduleMenuDropdown = signal<IDependentDropDown>(null);
  menuScreenDropdown = signal<IDependentDropDown>(null);
  screenFeatureDropdown = signal<IDependentDropDown>(null);
  departmentInterruptionReasonDropdown = signal<IDependentDropDown>(null);

  independentDropdowns = signal<IIndependentDropDownSignal>({
    tabs: null,
    dayoffs: null,
    categories: null,
    departments: null,
  });
  employeeList = signal<IEmployeeResponseDTO[]>([]);

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
  });

  callAPIGetDependentDropdown() {
    this.isLoading.set(true);
    this.timeTrackingService
      .getDropdownListAsync({
        mode: EGetApiMode.DROPDOWN,
      })
      .subscribe((result) => {
        // Bộ phận làm việc Options
        const departments = result.departments;
        if (departments && departments.length > 0) {
          const departmentOptions: IOption[] = departments.map(
            (department) => ({
              label: department.departmentName,
              value: department.id,
            }),
          );

          const departmentInterruptionReasonDropdown =
            this.commonService.convertToDependentDropdown(
              departments,
              'departmentName',
              'interruptionReasons',
              'interruptionReasonName',
            );
          this.departmentInterruptionReasonDropdown.set(
            departmentInterruptionReasonDropdown,
          );
        }

        this.isLoading.set(false);
        this.setDefaultValue();

        if (this.activeTab() === ETabName.FIX_BUG_DO_IMPROVEMENT) {
          this.fetchDataFromBugImprovementList();
          return;
        } else if (
          this.activeTab() === ETabName.BUG ||
          this.activeTab() === ETabName.IMPROVEMENT
        ) {
          return;
        }
      });
  }

  setDefaultValue() {
    const defaultValue: IDefaultValueInLocalStorage =
      this.localStorageService.getItem(LOCAL_STORAGE_KEY);
    if (defaultValue) {
      this.formGroup.patchValue(defaultValue);
      console.log('setting default value', defaultValue, this.formGroup.value);
    }
  }

  getCommonDependentDropDown(formControlName: string) {
    const key = this.getControlValue(formControlName);
    return this.dependentDropDown()?.[formControlName]?.[key];
  }

  getDependentModuleDropDown(
    formControlName: string,
    formGroup?: FormGroup,
  ): any {
    const value = this.getControlValue(formControlName);
    return this.projectModuleDropdown()?.[value] || [];
  }

  trackBy(col: IColumnHeaderConfigs) {
    return Math.random() + col.field;
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

    let dropDownOptions: IDependentDropDown;
    switch (dependentFormControlName) {
      case CHILD_FORM_GROUP_KEYS.moduleId: {
        dropDownOptions = this.moduleMenuDropdown();
        break;
      }
      case CHILD_FORM_GROUP_KEYS.menuId: {
        dropDownOptions = this.menuScreenDropdown();
        break;
      }
      // case FORM_GROUP_KEYS.menuId: {
      //   dropDownOptions = this.departmentInterruptionReasonDropdown();
      //   break;
      // }
      default: {
        dropDownOptions = this.screenFeatureDropdown();
        break;
      }
    }

    return dropDownOptions?.[value] || [];
  }

  private getTableDataApiRequest$ = new Subject<void>(); // Subject để trigger API call
  callAPIGetTableData(): void {
    this.getTableDataApiRequest$.next();
  }

  addCreateRowForm() {
    this.fixedRowData = [
      {
        ...nullableObj,
        mode: EMode.CREATE,
        tab: this.activeTab(),
        employee: this.getControlValue(this.FORM_GROUP_KEYS.employeeId),
        employeeLevel: this.getControlValue(
          this.FORM_GROUP_KEYS.employeeLevelId,
        ),
        isLunchBreak: true,
        createdDate: new Date(),
      },
    ];
  }

  onChangeTab(tabName: unknown) {
    this.activeTab.set(tabName as ETabName);
    console.log('onChangeTab ', this.activeTab());
    this.tableData = [];

    switch (tabName) {
      case ETabName.ESTIMATE:
        this.addCreateRowForm();
        clearInterval(this.intervalId);
        break;
      case ETabName.LOG_WORK:
        this.addCreateRowForm();

        this.doGetRequestDTO.update((oldValue) => ({
          ...oldValue,
          tabId: this.tabId(),
        }));
        this.callAPIGetTableData();
        clearInterval(this.intervalId);
        break;
      case ETabName.ISSUE:
        this.addCreateRowForm();
        this.doGetRequestDTO.update((oldValue) => ({
          ...oldValue,
          tabId: this.tabId(),
        }));
        this.callAPIGetTableData();
        clearInterval(this.intervalId);
        break;
      case ETabName.BUG:
      case ETabName.IMPROVEMENT:
        this.fixedRowData = [];
        this.doGetRequestDTO.update((oldValue) => ({
          ...oldValue,
          tabId: this.tabId(),
        }));
        console.log('update tabId ', this.tabId());
        this.callAPIGetTableData();
        clearInterval(this.intervalId);
        break;
      case ETabName.FIX_BUG_DO_IMPROVEMENT:
        this.fixBugDoImprovementComponent.checkForFixBugAndImprovementUpdates();
        break;
    }
  }

  @ViewChild(FixBugDoImprovementComponent, { static: true })
  fixBugDoImprovementComponent: FixBugDoImprovementComponent;

  onViewDetail(event: Event) {
    event.stopPropagation();

    const drawerRef = this.drawerService.create({
      component: CreateFormComponent,
      data: {},
      configs: {
        width: '51.5rem',
      },
    });

    drawerRef.onClose.subscribe((res: any) => {
      console.log('aaaaaaaaaaa ', res);
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
        this.callAPIGetTableData();
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
        this.callAPIGetTableData();
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
        this.callAPIGetTableData();
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

  onReload() {
    this.callAPIGetTableData();
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
    if (this.activeTab() === ETabName.FIX_BUG_DO_IMPROVEMENT) {
      console.log('this.fixList', this.allDropdownData());
    }

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

        this.callAPIGetTableData();
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

            this.callAPIGetTableData();
          });
      },
    });
  }

  handleActionAfterBugImprovementListUpdated(isStartTimeTracking: boolean) {
    if (!isStartTimeTracking) {
      this.startBlinking();
    } else {
      this.clearBlinking();
    }
  }
}
