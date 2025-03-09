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
  IStatuseResponseDTO,
} from './time-tracking.dto';
import { finalize, tap } from 'rxjs/operators';
import { message } from '../../contants/api.contant';
import { MessageService } from 'primeng/api';
import { ID, IOption } from '../../shared/interface/common.interface';
import { CommonService, LocalStorageService } from '../../services';

interface ITimeTrackingState {
  isLoading: boolean;
  originalAllDropdownData: IAllDropDownResponseDTO;
  common: {
    employeeLevelId: ID;
    employeeId: ID;
    employee: IEmployeeResponseDTO;
    projectId: ID;
  };
  employeeLevelOptions: IOption[];
  employeeDependentOptions: Record<ID, IOption[]>;
  projectDependentOptions: Record<ID, IOption[]>;
  moduleDependentOptions: Record<ID, IOption[]>;
  deadlineDependentModuleOptions: Record<ID, IOption[]>;
  menuDependentOptions: Record<ID, IOption[]>;
  screenDependentOptions: Record<ID, IOption[]>;
  issueDependentScreenOptions: Record<ID, IOption[]>;
  featureDependentOptions: Record<ID, IOption[]>;
  categoryOptions: IOption[];
  departmentOptions: IOption[];
  employeeDependentDepartmentOptions: Record<ID, IOption[]>;
  interruptionReasonDependentOptions: Record<ID, IOption[]>;
  statusOptions: IOption[];
  dayOffs: IOption[];
  statusDependentTabOptions: Record<ID, IOption[]>;
}

const initState: ITimeTrackingState = {
  isLoading: false,
  originalAllDropdownData: {
    employeeLevels: [],
    employees: [],
    projects: [],
    modules: [],
    menus: [],
    screens: [],
    features: [],
    categories: [],
    departments: [],
    departmentEmployees: [],
    interruptionReasons: [],
    stages: [],
    statuses: [],
    dayoffs: [],
    moduleDeadlines: [],
    screenIssues: [],
    issues: [],
    deadlines: [],
    tabStatuses: [],
  },
  common: {
    employeeLevelId: null,
    employeeId: null,
    employee: null,
    projectId: null,
  },
  employeeLevelOptions: [],
  employeeDependentOptions: null,
  projectDependentOptions: null,
  moduleDependentOptions: null,
  deadlineDependentModuleOptions: null,
  menuDependentOptions: null,
  screenDependentOptions: null,
  issueDependentScreenOptions: null,
  featureDependentOptions: null,
  categoryOptions: null,
  departmentOptions: null,
  employeeDependentDepartmentOptions: null,
  interruptionReasonDependentOptions: null,
  statusOptions: null,
  dayOffs: null,
  statusDependentTabOptions: null,
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
  readonly deadlineDependentModuleOptions$ = this.select(
    (state) => state.deadlineDependentModuleOptions,
  );
  readonly menuDependentOptions$ = this.select(
    (state) => state.menuDependentOptions,
  );
  readonly screenDependentOptions$ = this.select(
    (state) => state.screenDependentOptions,
  );
  readonly issueDependentScreenOptions$ = this.select(
    (state) => state.issueDependentScreenOptions,
  );
  readonly featureDependentOptions$ = this.select(
    (state) => state.featureDependentOptions,
  );
  readonly categoryOptions$ = this.select((state) => state.categoryOptions);
  readonly departmentOptions$ = this.select((state) => state.departmentOptions);
  readonly employeeInDepartmentOptions$ = this.select(
    (state) => state.employeeDependentDepartmentOptions,
  );
  readonly interruptionReasonDependentOptions = this.select(
    (state) => state.interruptionReasonDependentOptions,
  );
  readonly statusOptions = this.select((state) => state.statusOptions);
  readonly statusDependentTabOptions$ = this.select(
    (state) => state.statusDependentTabOptions,
  );

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
              let employeeDependentOptions: Record<ID, IOption[]>;
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
              let projectDependentOptions: Record<ID, IOption[]>;
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
              let moduleDependentOptions: Record<ID, IOption[]>;
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
              let menuDependentOptions: Record<ID, IOption[]>;
              if (moduleList && moduleList.length > 0) {
                menuDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    moduleList,
                    'id',
                    'menus',
                    'menuName',
                  );
              }

              // Deadline phụ thuộc Module
              const moduleDeadlines = res.moduleDeadlines;
              let deadlineDependentModuleOptions: Record<ID, IOption[]>;
              if (moduleDeadlines && moduleDeadlines.length > 0) {
                deadlineDependentModuleOptions =
                  this.commonService.convertToDependentDropdown(
                    moduleDeadlines,
                    'id',
                    'deadlines',
                    'deadlineTime',
                  );
              }

              // Màn hình Options
              const menuList = res.menus;
              let screenDependentOptions: Record<ID, IOption[]>;
              if (menuList && menuList.length > 0) {
                screenDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    menuList,
                    'id',
                    'screens',
                    'screenName',
                  );
              }

              // Dropdown Tính năng phụ thuộc vào Dropdown Màn hình
              const screenList = res.screens;
              let featureDependentOptions: Record<ID, IOption[]>;
              if (screenList && screenList.length > 0) {
                featureDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    screenList,
                    'id',
                    'features',
                    'featureName',
                  );
              }

              // Dropdown Vấn đề phụ thuộc vào Dropdown Màn hình
              const screenIssues = res.screenIssues;
              let issueDependentScreenOptions: Record<ID, IOption[]>;
              if (screenIssues && screenIssues.length > 0) {
                issueDependentScreenOptions =
                  this.commonService.convertToDependentDropdown(
                    screenIssues,
                    'id',
                    'issues',
                    'issueName',
                  );
              }

              // Bộ phận làm việc Options và Lý do gián đoạn Options
              const departments = res.departments;
              let departmentOptions: IOption[] = [];
              let interruptionReasonDependentOptions: Record<ID, IOption[]>;
              if (departments && departments.length > 0) {
                departmentOptions = departments.map((department) => ({
                  label: department.departmentName,
                  value: department.id,
                }));

                interruptionReasonDependentOptions =
                  this.commonService.convertToDependentDropdown(
                    departments,
                    'id',
                    'interruptionReasons',
                    'interruptionReasonName',
                  );
              }

              // Nhân viên trong phòng ban
              const departmentEmployees = res.departmentEmployees;
              let employeeDependentDepartmentOptions: Record<ID, IOption[]>;
              if (departmentEmployees && departmentEmployees.length > 0) {
                employeeDependentDepartmentOptions =
                  this.commonService.convertToDependentDropdown(
                    departmentEmployees,
                    'id',
                    'employees',
                    'username',
                  );
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

              // Phân loại
              const statuses = res.statuses;
              let statusOptions: IOption[] = [];
              if (statuses && statuses.length > 0) {
                statusOptions = statuses.map((status: IStatuseResponseDTO) => ({
                  label: status.statusName,
                  value: status.id,
                }));
              }

              // Phân loại
              const tabStatuses = res.tabStatuses;
              let statusDependentTabOptions: Record<ID, IOption[]>;
              if (tabStatuses && tabStatuses.length > 0) {
                statusDependentTabOptions =
                  this.commonService.convertToDependentDropdown(
                    tabStatuses,
                    'tabName',
                    'statuses',
                    'statusName',
                  );
              }

              const data = {
                isLoading: false,
                employeeLevelOptions,
                employeeDependentOptions,
                projectDependentOptions,
                moduleDependentOptions,
                deadlineDependentModuleOptions,
                menuDependentOptions,
                screenDependentOptions,
                issueDependentScreenOptions,
                featureDependentOptions,
                departmentOptions,
                employeeDependentDepartmentOptions,
                interruptionReasonDependentOptions,
                categoryOptions,
                statusOptions,
                statusDependentTabOptions,
              };

              this.setAllDependentDropdownOptions(data);
            }),
            catchError((error: any) => {
              console.error(error);
              console.error(
                'Lỗi tại hàm getAllDropdownData và file time-tracking.store.ts',
              );
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
