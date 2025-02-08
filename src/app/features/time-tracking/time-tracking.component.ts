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
  EMPTY,
  filter,
  forkJoin,
  Subscription,
} from 'rxjs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import {
  bugImprovementFixHeaderColumns,
  bugImprovementStatsHeaderColumns,
  COLUMN_FIELD,
  estimateHeaderColumns,
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
import { SafeResourceUrl } from '@angular/platform-browser';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
})
export class TimeTrackingComponent extends FormBaseComponent implements OnInit {
  activeTab = signal<ETabName>(ETabName.BUG_IMPROVEMENT_STATS);
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
      case ETabName.BUG_IMPROVEMENT_FIX:
        return bugImprovementFixHeaderColumns;
      default:
        return bugImprovementStatsHeaderColumns;
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
  googleSheetUrl: SafeResourceUrl;

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
      if (this.activeTab() === ETabName.BUG_IMPROVEMENT_FIX) {
        this.intervalId = setInterval(() => this.checkForUpdates(), 10000);
      } else {
        this.intervalId && clearInterval(this.intervalId);
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
    this.googleSheetUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.sheetUrl,
    );
  }

  initSubscriptions() {
    this.onDestroy$.subscribe(() => {
      this.subscription.unsubscribe();
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
          const employeeLevel = this.employeeList()?.find(
            (employee) => employee.username === employeeName,
          )?.levelName;

          this.getControl(SELECT_FORM_GROUP_KEY.employeeLevel).setValue(
            employeeLevel,
          );

          if (this.activeTab() !== ETabName.BUG_IMPROVEMENT_FIX) {
            this.addCreateRowForm();
          }
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
          console.log('dateString ', dateString);
        },
      ),
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
  });
  employeeList = signal<IEmployeeResponseDTO[]>([]);

  callAPIGetDependentDropdown() {
    this.isLoading.set(true);
    const apiObject = {
      employees: this.timeTrackingService.getDropdownListAsync({
        mode: EGetApiMode.EMPLOYEES,
      }),
      projects: this.timeTrackingService.getDropdownListAsync({
        mode: EGetApiMode.PROJECTS,
      }),
      modules: this.timeTrackingService.getDropdownListAsync({
        mode: EGetApiMode.MODULES,
      }),
      menus: this.timeTrackingService.getDropdownListAsync({
        mode: EGetApiMode.MENUS,
      }),
      screens: this.timeTrackingService.getDropdownListAsync({
        mode: EGetApiMode.SCREENS,
      }),
      features: this.timeTrackingService.getDropdownListAsync({
        mode: EGetApiMode.FEATURES,
      }),
      departments: this.timeTrackingService.getDropdownListAsync({
        mode: EGetApiMode.DEPARTMENTS,
      }),
    };

    forkJoin(apiObject).subscribe((result) => {
      // Nhân viên
      this.employeeList.set(result.employees);
      const options = this.employeeList()?.map((item: any) => ({
        label: item['username'],
        value: item['username'],
      }));
      this.employeeOptions.set(options);
      const userProjectDropdown = this.commonService.convertToDependentDropdown(
        this.employeeList(),
        'username',
        'projects',
        'projectName',
      );
      this.employeeProjectDropDown.set(userProjectDropdown);
      this.getControl(SELECT_FORM_GROUP_KEY.employee).setValue(
        this.employeeOptions()[0].value,
      );

      //  Dự án
      const projects = result.projects;
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

      // Module
      const modules = result.modules;
      const moduleMenuDropdown = this.commonService.convertToDependentDropdown(
        modules,
        'moduleName',
        'menus',
        'menuName',
      );
      this.moduleMenuDropdown.set(moduleMenuDropdown);

      // Menu
      const menus = result.menus;
      const menuScreenDropdown = this.commonService.convertToDependentDropdown(
        menus,
        'menuName',
        'screens',
        'screenName',
      );
      this.menuScreenDropdown.set(menuScreenDropdown);

      // Menu
      const screens = result.screens;
      const screenFeatureDropdown =
        this.commonService.convertToDependentDropdown(
          screens,
          'screenName',
          'features',
          'featureName',
        );
      this.screenFeatureDropdown.set(screenFeatureDropdown);

      // Bộ phận làm việc
      const departments = result.departments;
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

      this.callAPIGetAllIndependentDropdown();
    });
  }

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
        this.independentDropdowns.update(
          (oldValue: IIndependentDropDownSignal) => ({
            ...oldValue,
            tabs: tabOptions,
            categories: categoryOptions,
            dayoffs: dayoffOptions,
          }),
        );
        this.isLoading.set(false);
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

  getDependentDropDown(
    index: number,
    rowData: ITimeTrackingRowData,
    formControlName: string,
  ) {
    const mode = rowData.mode;
    let value;
    if (mode === EMode.CREATE) {
      value = this.getControlValue(formControlName, this.createFormGroup);
    } else {
      value = this.getFormControl(index, formControlName)?.value;
    }

    let dropDownOptions: IDependentDropDown;
    switch (formControlName) {
      case FORM_GROUP_KEYS.module: {
        dropDownOptions = this.moduleMenuDropdown();
        break;
      }
      case FORM_GROUP_KEYS.menu: {
        dropDownOptions = this.menuScreenDropdown();
        break;
      }
      default: {
        dropDownOptions = this.screenFeatureDropdown();
        break;
      }
    }
    return dropDownOptions?.[value] || [];
  }

  callAPIGetTableData(): void {
    if (this.activeTab() === ETabName.BUG_IMPROVEMENT_FIX) return;

    this.isLoading.set(true);

    this.timeTrackingService
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
      )
      .subscribe((listData: any[]) => {
        this.formArray.clear();

        listData.forEach((rowData: ILogWorkTableDataResponseDTO) => {
          const formGroup = this.formBuilder.group({
            ...rowData,
            mode: EMode.VIEW,
            startTime: rowData.startTime ? new Date(rowData.startTime) : null,
            endTime: rowData.endTime ? new Date(rowData.endTime) : null,
          });
          this.formArray.push(formGroup);
        });

        this.tableData = this.formArray.value;
        this.isLoading.set(false);
        this.createFormGroup.reset();
      });
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

    let tab: ETabName = tabName as ETabName;
    if (
      tabName === ETabName.BUG_IMPROVEMENT_FIX ||
      tabName === ETabName.BUG_IMPROVEMENT_STATS ||
      tabName === ETabName.LOG_WORK
    ) {
      tab = ETabName.LOG_WORK;
    }
    this.doGetRequestDTO.update((oldValue) => ({
      ...oldValue,
      tab: tab,
    }));
    this.tableData = [];
    this.callAPIGetTableData();

    if (this.activeTab() === ETabName.BUG_IMPROVEMENT_FIX) {
      this.fixedRowData = [];
      this.checkForUpdates();
    } else {
      this.addCreateRowForm();
    }
  }

  openCreateDrawer() {
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
    console.log('value ', value);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.PUT,
      data: {
        ...value,
        updatedDate: new Date(),
      },
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

  checkForUpdates() {
    const apiKey = 'AIzaSyC-cEdNbjo5nAw3Tn1QqZQS6iYOCh_O0qU';
    const sheetId = '111PSYmy5v-KntrtuFdNET9F26B6Kkyr5PPqme047URU';
    const sheetRange = 'A3:O';

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${apiKey}`;

    this.timeTrackingService
      .getBugImprovementContinuousUpdate(url)
      .subscribe((list) => {
        if (list?.values) {
          const convertedList = this.commonService.convertSheetToObjects(
            list?.values,
          );
          const filteredList = convertedList?.filter((row) => row.createdDate);
          this.tableData = filteredList?.map((rowData) => {
            console.log('rowData', rowData);
            return {
              ...nullableObj,
              ...rowData,
              startTime: this.commonService.parseGoogleSheetsDate(
                rowData.startTime,
              ),
              endTime: this.commonService.parseGoogleSheetsDate(
                rowData.endTime,
              ),
            };
          });

          this.fixedRowData = [];
          console.log('this.tableData', this.tableData);
        }
      });
  }

  sheetUrl =
    'https://docs.google.com/spreadsheets/d/111PSYmy5v-KntrtuFdNET9F26B6Kkyr5PPqme047URU/edit?gid=944613379#gid=944613379'; // Thay YOUR_SHEET_ID bằng ID thật
  openGoogleSheets() {
    window.open(this.sheetUrl, '_blank'); // Mở trong tab mới
  }

  onBulkCreate() {
    const listData = this.tableData.map((rowData: ITimeTrackingRowData) => {
      return {
        ...rowData,
        ...this.getCommonValue(),
        createdDate: new Date(),
        tab: this.activeTab(),
      };
    });

    console.log('bulk create', listData);

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

        if (this.activeTab() === ETabName.BUG_IMPROVEMENT_FIX) {
          this.isLoading.set(false);
          this.onDeleteLogTimeFixBugSheets();
        }

        this.callAPIGetTableData();
      });
  }

  onDeleteLogTimeFixBugSheets() {
    const url =
      'https://script.google.com/macros/s/AKfycbyyLLzf1NCVnUBUe9fuNKvTw7un5N6j48LuzWIihqQlXmlWku7oIwP7VkC7Ogr9zPpc/exec';
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

            if (this.activeTab() === ETabName.BUG_IMPROVEMENT_FIX) {
              this.isLoading.set(false);
            }

            this.callAPIGetTableData();
          });
      },
    });
  }
}
