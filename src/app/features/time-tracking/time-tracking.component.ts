import {
  Component,
  computed,
  effect,
  Injector,
  OnInit,
  signal,
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
  ICategoriesInIndependentDropdownResponseDTO,
  IDayoffsInIndependentDropdownResponseDTO,
  IDepartmentsInIndependentDropdownResponseDTO,
  IEmployeeResponseDTO,
  IIndependentDropdownResponseDTO,
  ILogWorkTableDataResponseDTO,
  ITabsInIndependentDropdownResponseDTO,
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
  bugImprovementFixHeaderColumns,
  bugImprovementStatsHeaderColumns,
  COLUMN_FIELD,
  estimateHeaderColumns,
  FAKE_REPORT_DATA,
  FORM_GROUP_KEYS,
  IDependentDropDown,
  IIndependentDropDownSignal,
  issuesHeaderColumns,
  ITimeTrackingRowData,
  logWorkHeaderColumns,
  nullableObj,
  SELECT_FORM_GROUP_KEY,
} from './time-tracking.model';
import { TabsModule } from 'primeng/tabs';
import { CreateFormComponent } from './create-form/create-form.component';
import { FormatDatePipe, RoundPipe } from '../../pipes';
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
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
})
export class TimeTrackingComponent extends FormBaseComponent implements OnInit {
  activeTab = signal<ETabName>(ETabName.FIX_BUG_DO_IMPROVEMENT);
  doGetRequestDTO = signal<ITimeTrackingDoGetRequestDTO>({
    method: EApiMethod.GET,
    mode: EGetApiMode.TABLE_DATA,
    employee: null,
    project: null,
    tab: this.activeTab(),
    startTime: null,
    endTime: null,
  });
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO>({
    method: EApiMethod.POST,
    isBulk: false,
    ids: null,
    data: null,
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
        return logWorkHeaderColumns;
      case ETabName.ISSUE:
        return issuesHeaderColumns;
      case ETabName.BUG:
      case ETabName.IMPROVEMENT:
        return bugImprovementStatsHeaderColumns;
      default:
        return bugImprovementFixHeaderColumns;
    }
  });

  COLUMN_FIELD = COLUMN_FIELD;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  EMode = EMode;

  isLoading = signal(false);
  tableData: ITimeTrackingRowData[] = [];

  formArray!: FormArray;

  FORM_GROUP_KEYS = FORM_GROUP_KEYS;

  fixedRowData: ITimeTrackingRowData[] = [];

  createFormGroup!: FormGroup;
  intervalId: any;
  FAKE_REPORT_DATA = FAKE_REPORT_DATA;

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
      [SELECT_FORM_GROUP_KEY.employee]: null,
      [SELECT_FORM_GROUP_KEY.employeeLevel]: null,
      [SELECT_FORM_GROUP_KEY.project]: null,
      [SELECT_FORM_GROUP_KEY.dateRange]: null,
      [SELECT_FORM_GROUP_KEY.quickDate]: 'TODAY',
      [SELECT_FORM_GROUP_KEY.formArray]: this.formBuilder.array([]),
    });

    this.formArray = this.formGroup.get('formArray') as FormArray;

    this.getControl(SELECT_FORM_GROUP_KEY.dateRange).disable();

    // Phải gọi trước khi khởi tạo giá trị cho dateRange
    this.initSubscriptions();

    this.callAPIGetDependentDropdown();

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
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.employee),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.project),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.dateRange).pipe(
          filter((range) => range.every((date: Date) => !!date)),
        ),
      ).subscribe(([employee, project, dateRange]) => {
        this.doGetRequestDTO.update((oldValue) => ({
          ...oldValue,
          employee: employee,
          project: project,
          startTime: dateRange[0].toISOString(),
          endTime: dateRange[1].toISOString(),
        }));

        this.callAPIGetTableData();
      }),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.employee).subscribe(
        (employeeName: string) => {
          const employee = this.employeeList()?.find(
            (employee) => employee.username === employeeName,
          );
          this.currentEmployee.set(employee);

          const employeeLevel = employee.levelName;
          this.getControl(SELECT_FORM_GROUP_KEY.employeeLevel).setValue(
            employeeLevel,
          );
        },
      ),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.project).subscribe(
        (_: string) => {
          this.getControl(FORM_GROUP_KEYS.dateRange).setValue([
            startOfDay(new Date()),
            endOfDay(new Date()),
          ]);
        },
      ),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.quickDate).subscribe(
        (dateString: string) => {
          this.getControl(FORM_GROUP_KEYS.dateRange).disable({
            emitEvent: false,
          });

          switch (dateString) {
            case 'TODAY':
              this.getControl(FORM_GROUP_KEYS.dateRange).setValue([
                startOfDay(new Date()),
                endOfDay(new Date()),
              ]);
              break;
            case 'WEEK':
              this.getControl(FORM_GROUP_KEYS.dateRange).setValue([
                startOfWeek(new Date(), { weekStartsOn: 1 }),
                endOfWeek(new Date(), { weekStartsOn: 1 }),
              ]);
              break;
            case 'MONTH':
              this.getControl(FORM_GROUP_KEYS.dateRange).setValue([
                startOfMonth(new Date()),
                endOfMonth(new Date()),
              ]);
              break;
            default:
              this.getControl(FORM_GROUP_KEYS.dateRange).enable({
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

  employeeOptions = signal<IOption[]>([]);
  employeeProjectDropDown = signal<IDependentDropDown>({});
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
  allDropdownData = signal({
    employees: null,
    projects: null,
    modules: null,
    menus: null,
    screens: null,
    features: null,
  });

  callAPIGetDependentDropdown() {
    this.isLoading.set(true);
    this.timeTrackingService
      .getDropdownListAsync({
        mode: EGetApiMode.DROPDOWN,
      })
      .subscribe((result) => {
        this.allDropdownData.update((oldValue) => ({ ...oldValue, ...result }));
        console.log('allDropdownData', this.allDropdownData());
        // Nhân viên
        const employees = result.employees;
        if (employees && employees.length > 0) {
          this.employeeList.set(result.employees);
          const options = this.employeeList()?.map((item: any) => ({
            label: item['username'],
            value: item['username'],
          }));
          this.employeeOptions.set(options);
          const userProjectDropdown =
            this.commonService.convertToDependentDropdown(
              this.employeeList(),
              'username',
              'projects',
              'projectName',
            );
          this.employeeProjectDropDown.set(userProjectDropdown);
          this.getControl(SELECT_FORM_GROUP_KEY.employee).setValue(
            this.employeeOptions()[0].value,
          );
        }

        //  Dự án
        const projects = result.projects;
        if (projects && projects.length > 0) {
          this.allDropdownData.update((oldValue) => ({
            ...oldValue,
            projects,
          }));
          const projectModuleDropdown =
            this.commonService.convertToDependentDropdown(
              projects,
              'projectName',
              'modules',
              'moduleName',
            );
          this.projectModuleDropdown.set(projectModuleDropdown);
          this.getControl(SELECT_FORM_GROUP_KEY.project).setValue(
            projects[0]['projectName'],
          );
        }

        // Module
        const modules = result.modules;
        if (modules && modules.length > 0) {
          this.allDropdownData.update((oldValue) => ({ ...oldValue, modules }));
          const moduleMenuDropdown =
            this.commonService.convertToDependentDropdown(
              modules,
              'moduleName',
              'menus',
              'menuName',
            );
          this.moduleMenuDropdown.set(moduleMenuDropdown);
        }

        // Menu
        const menus = result.menus;
        if (menus && menus.length > 0) {
          this.allDropdownData.update((oldValue) => ({ ...oldValue, menus }));
          const menuScreenDropdown =
            this.commonService.convertToDependentDropdown(
              menus,
              'menuName',
              'screens',
              'screenName',
            );
          this.menuScreenDropdown.set(menuScreenDropdown);
        }

        // Màn hình
        const screens = result.screens;
        if (screens && screens.length > 0) {
          const screenFeatureDropdown =
            this.commonService.convertToDependentDropdown(
              screens,
              'screenName',
              'features',
              'featureName',
            );
          this.screenFeatureDropdown.set(screenFeatureDropdown);
        }

        // Bộ phận làm việc
        const departments = result.departments;
        if (departments && departments.length > 0) {
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

        if (this.activeTab() === ETabName.FIX_BUG_DO_IMPROVEMENT) {
          this.isLoading.set(false);
          this.fetchDataFromBugImprovementList();
          return;
        } else if (
          this.activeTab() === ETabName.BUG ||
          this.activeTab() === ETabName.IMPROVEMENT
        ) {
          this.isLoading.set(false);
          return;
        }

        console.log('3333333333333');

        this.callAPIGetAllIndependentDropdown();
      });
  }

  /**
   * @usage Gọi API lấy option của menu độc lập
   */
  callAPIGetAllIndependentDropdown() {
    this.timeTrackingService
      .getAllIndependentDropdownAsync({
        mode: EGetApiMode.INDEPENDENT_DROPDOWN,
      })
      .pipe(
        filter(
          (obj: IIndependentDropdownResponseDTO) => Object.keys(obj).length > 0,
        ),
      )
      .subscribe((obj: IIndependentDropdownResponseDTO) => {
        const tabOptions = obj.tabs?.map(
          (item: ITabsInIndependentDropdownResponseDTO) => ({
            label: item.tabName,
            value: item.tabName,
          }),
        );
        const categoryOptions = obj.categories?.map(
          (item: ICategoriesInIndependentDropdownResponseDTO) => ({
            label: item.categoryName,
            value: item.categoryName,
          }),
        );
        const dayoffOptions = obj.dayoffs?.map(
          (item: IDayoffsInIndependentDropdownResponseDTO) => ({
            label: item.dayoff,
            value: item.dayoff,
          }),
        );
        const departmentOptions = obj.departments?.map(
          (item: IDepartmentsInIndependentDropdownResponseDTO) => ({
            label: item.departmentName,
            value: item.departmentName,
          }),
        );
        this.independentDropdowns.update(
          (oldValue: IIndependentDropDownSignal) => ({
            ...oldValue,
            tabs: tabOptions,
            categories: categoryOptions,
            dayoffs: dayoffOptions,
            departments: departmentOptions,
          }),
        );

        this.isLoading.set(false);
        if (this.activeTab() !== ETabName.FIX_BUG_DO_IMPROVEMENT) {
          this.callAPIGetTableData();
        }
      });
  }

  getDependentProjectDropDown(formControlName: string) {
    const key = this.getControlValue(formControlName);
    return this.employeeProjectDropDown()[key];
  }

  getDependentModuleDropDown(formControlName: string, formGroup?: FormGroup) {
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
    rowData: ITimeTrackingRowData,
    dependentFormControlName: string,
  ) {
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
      case FORM_GROUP_KEYS.module: {
        dropDownOptions = this.moduleMenuDropdown();
        break;
      }
      case FORM_GROUP_KEYS.menu: {
        dropDownOptions = this.menuScreenDropdown();
        break;
      }
      case FORM_GROUP_KEYS.departmentMakeIssue: {
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
        employee: this.getControlValue(this.FORM_GROUP_KEYS.employee),
        employeeLevel: this.getControlValue(this.FORM_GROUP_KEYS.employeeLevel),
        isLunchBreak: true,
        createdDate: new Date(),
      },
    ];
  }

  onChangeTab(tabName: unknown) {
    this.activeTab.set(tabName as ETabName);
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
          tab: ETabName.LOG_WORK,
        }));
        this.callAPIGetTableData();
        clearInterval(this.intervalId);
        break;
      case ETabName.ISSUE:
        this.addCreateRowForm();
        this.doGetRequestDTO.update((oldValue) => ({
          ...oldValue,
          tab: ETabName.ISSUE,
        }));
        this.callAPIGetTableData();
        clearInterval(this.intervalId);
        break;
      case ETabName.BUG:
        this.fixedRowData = [];
        this.doGetRequestDTO.update((oldValue) => ({
          ...oldValue,
          tab: ETabName.BUG,
        }));
        this.callAPIGetTableData();
        clearInterval(this.intervalId);
        break;
      case ETabName.IMPROVEMENT:
        this.fixedRowData = [];
        this.doGetRequestDTO.update((oldValue) => ({
          ...oldValue,
          tab: ETabName.IMPROVEMENT,
        }));
        this.callAPIGetTableData();
        clearInterval(this.intervalId);
        break;
      case ETabName.FIX_BUG_DO_IMPROVEMENT:
        this.fixedRowData = [];
        this.fetchDataFromBugImprovementList();
        break;
    }
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
    const data: ITimeTrackingRowData = {
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

  onDelete(rowData: ITimeTrackingRowData) {
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
    window.open(this.currentEmployee().bugImprovementSpreedsheet, '_blank'); // Mở trong tab mới
  }

  convertListBugOrImprovementBeforeSave() {
    return this.tableData.map((rowData: ITimeTrackingRowData) => {
      let moduleId: ID;
      let menuId: ID;
      let screenId: ID;
      let featureId: ID;
      if (rowData.module) {
        moduleId = this.allDropdownData().modules?.find(
          (item: any) => item.moduleName === rowData.module,
        )?.id;
      }
      if (rowData.menu) {
        menuId = this.allDropdownData().menus?.find(
          (item: any) => item.menuName === rowData.menu,
        )?.id;
      }
      if (rowData.module) {
        screenId = this.allDropdownData().screens?.find(
          (item: any) => item.screenName === rowData.screen,
          (item: any) => item.screenName === rowData.screen,
        )?.id;
      }
      if (rowData.module) {
        featureId = this.allDropdownData().features?.find(
          (item: any) => item.featureName === rowData.feature,
        )?.id;
      }

      return {
        ...rowData,
        ...this.getCommonValue(),
        moduleId,
        menuId,
        screenId,
        featureId,
        employeeLevelId: this.getControlValue(
          this.SELECT_FORM_GROUP_KEY.employee,
        ),
        projectId: this.getControlValue(this.SELECT_FORM_GROUP_KEY.project),
        createdDate: new Date(),
      };
    });
  }

  onBulkCreate() {
    let listData: any;
    if (this.activeTab() === ETabName.FIX_BUG_DO_IMPROVEMENT) {
      console.log('this.fixList', this.allDropdownData());
      listData = this.convertListBugOrImprovementBeforeSave();
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
          (rowData: ITimeTrackingRowData) => rowData.id,
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
}
