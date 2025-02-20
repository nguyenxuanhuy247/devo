import { Injectable, Injector } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
  IAllDropDownResponseDTO,
  LOCAL_STORAGE_KEY,
} from './time-tracking.model';
import { catchError, EMPTY, Observable, switchMap } from 'rxjs';
import { TimeTrackingApiService } from './time-tracking-api.service';
import {
  EGetApiMode,
  ICategoryResponseDTO,
  IEmployeeResponseDTO,
  ITabResponseDTO,
} from './time-tracking.dto';
import { finalize, tap } from 'rxjs/operators';
import { message } from '../../contants/api.contant';
import { MessageService } from 'primeng/api';
import { ID, IOption } from '../../shared/interface/common.interface';
import { CommonService, LocalStorageService } from '../../services';

interface ITimeTrackingState {
  isLoading: boolean;
  originalAllDropdownData: IAllDropDownResponseDTO;
  employeeLevelOptions: IOption[];
  employeeDependentOptions: Record<ID, IOption[]>;
  projectDependentOptions: Record<ID, IOption[]>;
  moduleDependentOptions: Record<ID, IOption[]>;
  menuDependentOptions: Record<ID, IOption[]>;
  screenDependentOptions: Record<ID, IOption[]>;
  featureDependentOptions: Record<ID, IOption[]>;
  departmentOptions: IOption[];
  interruptionReasonDependentOptions: Record<ID, IOption[]>;
  tabOptions: IOption[];
  dayoffs: IOption[];
  categoryOptions: IOption[];
  common: {
    employeeLevelId: ID;
    employeeId: ID;
    employee: IEmployeeResponseDTO;
    projectId: ID;
  };
}

const initState: ITimeTrackingState = {
  isLoading: false,
  originalAllDropdownData: {
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
    statuses: []
  },
  employeeLevelOptions: [],
  employeeDependentOptions: null,
  projectDependentOptions: null,
  moduleDependentOptions: null,
  menuDependentOptions: null,
  screenDependentOptions: null,
  featureDependentOptions: null,
  departmentOptions: null,
  interruptionReasonDependentOptions: null,
  tabOptions: null,
  dayoffs: null,
  categoryOptions: null,
  common: {
    employeeLevelId: null,
    employeeId: null,
    employee: null,
    projectId: null,
  },
};

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingStore extends ComponentStore<ITimeTrackingState> {
  private timeTrackingService = this.injector.get(TimeTrackingApiService);
  private messageService = this.injector.get(MessageService);
  private commonService = this.injector.get(CommonService);
  private localStorageService = this.injector.get(LocalStorageService);

  constructor(private injector: Injector) {
    super(initState);
  }

  readonly isLoading$ = this.select((state) => state.isLoading);
  readonly setLoading = this.updater((state, isLoading: boolean) => ({
    ...state,
    isLoading,
  }));

  readonly selectedEmployee$ = this.select((state) => state.common.employee);
  readonly setSharedData = this.updater(
    (
      state,
      data: {
        employeeLevelId: ID;
        employeeId: ID;
        employee: IEmployeeResponseDTO;
        projectId: ID;
      },
    ) => {
      this.localStorageService.setItem(LOCAL_STORAGE_KEY, data);
      return {
        ...state,
        common: {
          ...state.common,
          ...data,
        },
      };
    },
  );

  readonly allDropdownData$ = this.select(
    (state) => state.originalAllDropdownData,
  );
  readonly setAllDropdownData = this.updater(
    (state, allDropdownData: IAllDropDownResponseDTO) => ({
      ...state,
      originalAllDropdownData: allDropdownData,
    }),
  );
  readonly setAllDependentDropdownOptions = this.updater(
    (state, data: any) => ({
      ...state,
      ...data,
    }),
  );
  readonly employeeLevelOptions$ = this.select(
    (state) => state.employeeLevelOptions,
  );
  readonly employeeDependentOptions$ = this.select(
    (state) => state.employeeDependentOptions,
  );
  readonly projectDependentOptions$ = this.select(
    (state) => state.projectDependentOptions,
  );
  readonly moduleDependentOptions$ = this.select(
    (state) => state.moduleDependentOptions,
  );
  readonly menuDependentOptions$ = this.select(
    (state) => state.menuDependentOptions,
  );
  readonly screenDependentOptions$ = this.select(
    (state) => state.screenDependentOptions,
  );
  readonly featureDependentOptions$ = this.select(
    (state) => state.featureDependentOptions,
  );
  readonly tabOptions$ = this.select((state) => state.tabOptions);
  readonly categoryOptions$ = this.select((state) => state.categoryOptions);
  readonly getAllDropdownData = this.effect((trigger$: Observable<void>) => {
    return trigger$.pipe(
      switchMap(() => {
        this.patchState({ isLoading: true });
        return this.timeTrackingService
          .getDropdownListAsync({
            mode: EGetApiMode.DROPDOWN,
          })
          .pipe(
            tap((res: IAllDropDownResponseDTO) => {
              this.setAllDropdownData(res);

              // Level nhân viên
              const employeeLevelList = res.employeeLevels;
              let employeeLevelOptions: IOption[] = [];
              let employeeDependentOptions: IOption[] = [];
              if (employeeLevelList && employeeLevelList.length > 0) {
                employeeLevelOptions = employeeLevelList.map(
                  (employeeLevel) => ({
                    label: employeeLevel.levelName,
                    value: employeeLevel.id,
                  }),
                );

                // Nhân viên Options
                employeeDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    employeeLevelList,
                    'id',
                    'employees',
                    'employeeName',
                  );
              }

              //  Dự án Options
              const employeeList = res.employees;
              let projectDependentOptions: IOption[] = [];
              if (employeeList && employeeList.length > 0) {
                projectDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    employeeList,
                    'id',
                    'projects',
                    'projectName',
                  );
              }

              // Module Options
              const projectList = res.projects;
              let moduleDependentOptions: IOption[] = [];
              if (projectList && projectList.length > 0) {
                moduleDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    projectList,
                    'id',
                    'modules',
                    'moduleName',
                  );
              }

              // Menu Options
              const moduleList = res.modules;
              let menuDependentOptions: IOption[] = [];
              if (moduleList && moduleList.length > 0) {
                menuDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    moduleList,
                    'id',
                    'menus',
                    'menuName',
                  );
              }

              // Màn hình Options
              const menuList = res.menus;
              let screenDependentOptions: IOption[] = [];
              if (menuList && menuList.length > 0) {
                screenDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    menuList,
                    'id',
                    'screens',
                    'screenName',
                  );
              }

              // Tính năng Options
              const screenList = res.screens;
              let featureDependentOptions: IOption[] = [];
              if (screenList && screenList.length > 0) {
                featureDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    screenList,
                    'id',
                    'features',
                    'featureName',
                  );
              }

              // Bộ phận làm việc Options và Lý do gián đoạn Options
              const departments = res.departments;
              let departmentOptions: IOption[] = [];
              let interruptionReasonDependentOptions: IOption[] = [];
              if (departments && departments.length > 0) {
                departmentOptions = departments.map((department) => ({
                  label: department.departmentName,
                  value: department.id,
                }));

                interruptionReasonDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    departments,
                    'departmentName',
                    'interruptionReasons',
                    'interruptionReasonName',
                  );
              }

              // Bộ phận làm việc Options và Lý do gián đoạn Options
              const tabs = res.tabs;
              let tabOptions: IOption[] = [];
              if (tabs && tabs.length > 0) {
                tabOptions = tabs.map((tab: ITabResponseDTO) => ({
                  label: tab.tabName,
                  value: tab.id,
                }));
              }

              // Phân loại
              const categories = res.categories;
              let categoryOptions: IOption[] = [];
              if (categories && categories.length > 0) {
                categoryOptions = categories.map(
                  (category: ICategoryResponseDTO) => ({
                    label: category.categoryName,
                    value: category.id,
                  }),
                );
              }

              const data = {
                isLoading: false,
                employeeLevelOptions,
                employeeDependentOptions: employeeDependentOptions,
                projectDependentOptions: projectDependentOptions,
                moduleDependentOptions: moduleDependentOptions,
                menuDependentOptions: menuDependentOptions,
                screenDependentOptions: screenDependentOptions,
                featureDependentOptions: featureDependentOptions,
                departmentOptions,
                interruptionReasonDependentOptions,
                tabOptions,
                categoryOptions,
              };

              this.setAllDependentDropdownOptions(data);
            }),
            catchError((error: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Thất bại',
                detail: message.serverError,
              });

              return EMPTY;
            }),
            finalize(() => {
              this.patchState({ isLoading: false });
            }),
          );
      }),
    );
  });
}
