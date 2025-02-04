import { Component, computed, Injector, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
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
import { TimeTrackingService } from './time-tracking.service';
import {
  EGetApiMode,
  ICategoriesInIndependentDropdownResponseDTO,
  IDayoffsInIndependentDropdownResponseDTO,
  IIndependentDropdownResponseDTO,
  ILogWorkTableDataResponseDTO,
  ITabsInIndependentDropdownResponseDTO,
  ITimeTrackingDoGetRequestDTO,
  ITimeTrackingDoPostRequestDTO,
} from './time-tracking.dto';
import { PaginatorModule } from 'primeng/paginator';
import { combineLatest, filter, Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleButton } from 'primeng/togglebutton';
import {
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
import { FormatDatePipe } from '../../pipes';
import { TooltipModule } from 'primeng/tooltip';
import { EApiMethod, EMode } from '../../contants/common.constant';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonService } from '../../services';
import { IOption } from '../../shared/interface/common.interface';

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
    ToggleButton,
    TabsModule,
    FormatDatePipe,
    TooltipModule,
    SplitButtonModule,
    ProgressSpinnerModule,
    BlockUIModule,
    TextareaModule,
    DatePickerModule,
    CheckboxModule,
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
})
export class TimeTrackingComponent extends FormBaseComponent implements OnInit {
  doGetRequestDTO = signal<ITimeTrackingDoGetRequestDTO>({
    method: EApiMethod.GET,
    mode: EGetApiMode.TABLE_DATA,
    tabIndex: 0,
    startTime: null,
    endTime: null,
    pic: null,
  });
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO>({
    method: EApiMethod.POST,
    id: null,
  });

  timeTrackingService = this.injector.get(TimeTrackingService);
  commonService = this.injector.get(CommonService);

  subscription: Subscription = new Subscription();

  SELECT_FORM_GROUP_KEY = SELECT_FORM_GROUP_KEY;
  activeTabIndex = signal<number>(1);
  headerColumns = computed(() => {
    switch (this.activeTabIndex()) {
      case 0:
        return estimateHeaderColumns;
      case 1:
        return logWorkHeaderColumns;
      case 2:
        return issuesHeaderColumns;
      default:
        return null;
    }
  });

  COLUMN_FIELD = COLUMN_FIELD;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.CREATE);
  EMode = EMode;
  createButtonMenu: MenuItem[] = [
    {
      label: 'Mở drawer',
      command: () => {
        this.openCreateDrawer();
      },
    },
  ];

  isLoading = signal(false);
  formArray!: FormArray;

  FORM_GROUP_KEYS = FORM_GROUP_KEYS;

  constructor(override injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      [SELECT_FORM_GROUP_KEY.employee]: null,
      [SELECT_FORM_GROUP_KEY.project]: null,
      [SELECT_FORM_GROUP_KEY.dateRange]: null,
      [SELECT_FORM_GROUP_KEY.quickDateRange]: null,
      formArray: this.formBuilder.array([]),
    });
    this.formArray = this.formGroup.get('formArray') as FormArray;

    this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
      new Date(),
      new Date(),
    ]);

    // Phải gọi trước khi khởi tạo giá trị cho dateRange
    this.initSubscriptions();

    this.callAPIGetDependentDropdown(EGetApiMode.EMPLOYEES);
    this.callAPIGetAllIndependentDropdown();
  }

  initSubscriptions() {
    this.onDestroy$.subscribe(() => {
      this.subscription.unsubscribe();
    });

    this.subscription.add(
      combineLatest(
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.employee),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.dateRange).pipe(
          filter((range) => range.every((date: Date) => !!date)),
        ),
      ).subscribe(([user, dateRange]) => {
        this.doGetRequestDTO.update((oldValue) => ({
          ...oldValue,
          pic: user,
          startTime: dateRange[0].toISOString(),
          endTime: dateRange[1].toISOString(),
        }));

        this.callAAIGetTableData();
      }),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.project).subscribe(
        (_: string) => {
          if (!this.projectModuleDropdown()) {
            this.callAPIGetDependentDropdown(EGetApiMode.PROJECTS);
            this.callAPIGetDependentDropdown(EGetApiMode.MODULES);
            this.callAPIGetDependentDropdown(EGetApiMode.MENUS);
            this.callAPIGetDependentDropdown(EGetApiMode.SCREENS);
            this.callAPIGetDependentDropdown(EGetApiMode.FEATURES);
            this.callAPIGetDependentDropdown(EGetApiMode.DEPARTMENTS);
          }
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

  callAPIGetDependentDropdown(mode: EGetApiMode) {
    this.isLoading.set(true);
    this.timeTrackingService
      .getDropdownListAsync({ mode: mode })
      .pipe(filter((list: string[]) => list?.length > 0))
      .subscribe((mainList: string[]) => {
        switch (mode) {
          case EGetApiMode.EMPLOYEES: {
            const options = mainList?.map((item: any) => ({
              label: item['username'],
              value: item['username'],
            }));
            this.employeeOptions.set(options);
            const userProjectDropdown =
              this.commonService.convertToDependentDropdown(
                mainList,
                'username',
                'projects',
                'projectName',
              );
            this.employeeProjectDropDown.set(userProjectDropdown);
            this.getControl(SELECT_FORM_GROUP_KEY.employee).setValue(
              this.employeeOptions()[0].value,
            );
            console.log('userProjectDropdown ', userProjectDropdown);
            break;
          }
          case EGetApiMode.PROJECTS: {
            const projectModuleDropdown =
              this.commonService.convertToDependentDropdown(
                mainList,
                'projectName',
                'modules',
                'moduleName',
              );
            this.projectModuleDropdown.set(projectModuleDropdown);
            console.log('projectModuleDropdown ', projectModuleDropdown);
            break;
          }
          case EGetApiMode.MODULES: {
            const moduleMenuDropdown =
              this.commonService.convertToDependentDropdown(
                mainList,
                'moduleName',
                'menus',
                'menuName',
              );
            this.moduleMenuDropdown.set(moduleMenuDropdown);
            console.log('moduleMenuDropdown', moduleMenuDropdown);
            break;
          }
          case EGetApiMode.MENUS: {
            console.log('menuScreenDropdown 111');
            const menuScreenDropdown =
              this.commonService.convertToDependentDropdown(
                mainList,
                'menuName',
                'screens',
                'screenName',
              );
            this.menuScreenDropdown.set(menuScreenDropdown);
            console.log('menuScreenDropdown ', menuScreenDropdown);
            break;
          }
          case EGetApiMode.SCREENS: {
            const screenFeatureDropdown =
              this.commonService.convertToDependentDropdown(
                mainList,
                'screenName',
                'features',
                'featureName',
              );
            this.screenFeatureDropdown.set(screenFeatureDropdown);
            console.log('screenFeatureDropdown ', screenFeatureDropdown);
            break;
          }
          case EGetApiMode.DEPARTMENTS: {
            const departmentInterruptionReasonDropdown =
              this.commonService.convertToDependentDropdown(
                mainList,
                'departmentName',
                'interruptionReasons',
                'interruptionReasonName',
              );
            this.departmentInterruptionReasonDropdown.set(
              departmentInterruptionReasonDropdown,
            );
            console.log(
              'screenFeatureDropdown ',
              departmentInterruptionReasonDropdown,
            );
          }
        }

        this.isLoading.set(false);
      });
  }

  callAPIGetAllIndependentDropdown() {
    this.isLoading.set(true);
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
        console.log('obj ', obj);
        this.isLoading.set(false);
      });
  }

  getDependentProjectDropDown(formControlName: string) {
    const key = this.getControlValue(formControlName);
    return this.employeeProjectDropDown()[key];
  }

  getDependentModuleDropDown(formControlName: string) {
    const value = this.getControlValue(formControlName);
    return this.projectModuleDropdown()?.[value] || [];
  }

  getDependentDropDown(index: number, formControlName: string) {
    const value = this.getFormControl(index, formControlName).value;
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

  callAAIGetTableData() {
    this.isLoading.set(true);
    this.timeTrackingService
      .getListAsync(this.doGetRequestDTO())
      .subscribe((response) => {
        response.data.forEach((rowData: ILogWorkTableDataResponseDTO) => {
          const formGroup = this.formBuilder.group({
            ...rowData,
            mode: EMode.VIEW,
          });
          this.formArray.push(formGroup);
        });

        this.isLoading.set(false);
      });
  }

  onTabChange(value: unknown) {
    this.activeTabIndex.set(value as number);
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

  get formArrayObservable() {
    return this.formArray.valueChanges;
  }

  onAddNewRow() {
    this.formArray.push(
      this.formBuilder.group({ ...nullableObj, mode: EMode.CREATE }),
    );

    this.formArray.controls.forEach((formGroup: any) => {
      const controlObj = formGroup.controls;
    });
    console.log('this.formArray', this.formArray);
  }

  getFormControl(index: number, formControlName: string): FormControl {
    return this.formArray?.at(index).get(formControlName) as FormControl;
  }

  onCancelCreate() {
    const lastIndex = this.formArray.length - 1;
    if (lastIndex >= 0) {
      this.formArray.removeAt(lastIndex); // Xóa control cuối cùng
    }
  }

  onCreate() {}

  onUpdate(rowData: ITimeTrackingRowData) {}

  onDelete(rowData: ITimeTrackingRowData) {
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      id: rowData.id,
      method: EApiMethod.DELETE,
    }));
    this.timeTrackingService
      .deleteItemAsync(this.doPostRequestDTO())
      .subscribe((res) => {
        console.log('delete', res);
      });
  }
}
