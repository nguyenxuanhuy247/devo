import { CommonService } from '../../services';
import { FormArray } from '@angular/forms';
import {
  ICategoryResponseDTO,
  IDayOffResponseDTO,
  IDeadlineResponseDTO,
  IDepartmentEmployeeResponseDTO,
  IDepartmentResponseDTO,
  IEmployeeLevelResponseDTO,
  IEmployeeResponseDTO,
  IFeatureResponseDTO,
  IInterruptionReasonResponseDTO,
  IMenuResponseDTO,
  IModuleDeadlineResponseDTO,
  IModuleResponseDTO,
  IProjectResponseDTO,
  IScreenIssuesResponseDTO,
  IScreenResponseDTO,
  IStageResponseDTO,
  IStatuseResponseDTO,
} from './time-tracking.dto';
import { IIssueResponseDTO } from './issues/issues.dto.model';
import { EMode } from '../../contants/common.constant';
import {
  IColumnHeaderConfigs,
  ID,
} from '../../shared/interface/common.interface';

export const LOCAL_STORAGE_KEY = 'defaultValue';

export interface IDefaultValueInLocalStorage {
  employeeLevelId: string;
  employeeId: string;
  projectId: string;
}

export const SELECT_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<ISelectFormGroup>();

export interface ISelectFormGroup {
  employeeLevelId: string;
  employeeId: string;
  projectId: string;
  dateRange: [Date, Date];
  quickDate: EStatsBy;
  formArray: FormArray;
}

export enum EStatsBy {
  ALL = 'ALL',
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

export interface IAllDropDownResponseDTO {
  employeeLevels: IEmployeeLevelResponseDTO[];
  employees: IEmployeeResponseDTO[];
  projects: IProjectResponseDTO[];
  modules: IModuleResponseDTO[];
  moduleDeadlines: IModuleDeadlineResponseDTO[];
  menus: IMenuResponseDTO[];
  screens: IScreenResponseDTO[];
  screenIssues: IScreenIssuesResponseDTO[];
  features: IFeatureResponseDTO[];
  categories: ICategoryResponseDTO[];
  departments: IDepartmentResponseDTO[];
  departmentEmployees: IDepartmentEmployeeResponseDTO[];
  interruptionReasons: IInterruptionReasonResponseDTO[];
  issues: IIssueResponseDTO[];
  deadlines: IDeadlineResponseDTO[];
  dayOffs: IDayOffResponseDTO[];
  stages: IStageResponseDTO[];
  statuses: IStatuseResponseDTO[];
  tabStatuses: IInterruptionReasonResponseDTO[];
}

export interface ITabComponent {
  callAPIGetTableData(): void;
}

export const COMMON_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<ICommonTimeTrackingRowData>(),
  {
    order: 'order',
    actions: 'actions',
  },
);

export interface ICommonTimeTrackingRowData {
  mode: EMode;
  id: ID;
  moduleId: ID;
  menuId: ID;
  screenId: ID;
  featureId: ID;
  categoryId: ID;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: Date;
  updatedDate: Date;
}

export const getHeaderColumnConfigsFactory = (
  configs01: IColumnHeaderConfigs[],
  configs02: IColumnHeaderConfigs[] = [],
): IColumnHeaderConfigs[] => {
  return [
    {
      label: 'STT',
      field: COMMON_COLUMN_FIELD.order,
      minWidth: 80,
    },
    {
      label: 'Module',
      field: COMMON_COLUMN_FIELD.moduleId,
      minWidth: 200,
    },
    {
      label: 'Menu',
      field: COMMON_COLUMN_FIELD.menuId,
      minWidth: 200,
    },
    {
      label: 'Màn hình',
      field: COMMON_COLUMN_FIELD.screenId,
      minWidth: 200,
    },
    {
      label: 'Tính năng',
      field: COMMON_COLUMN_FIELD.featureId,
      minWidth: 200,
    },
    {
      label: 'Phân loại',
      field: COMMON_COLUMN_FIELD.categoryId,
      minWidth: 140,
    },
    ...configs01,
    {
      label: 'Thời gian bắt đầu',
      field: COMMON_COLUMN_FIELD.startTime,
      minWidth: 200,
    },
    {
      label: 'Thời gian hoàn thành',
      field: COMMON_COLUMN_FIELD.endTime,
      minWidth: 200,
    },
    {
      label: 'Thời lượng',
      field: COMMON_COLUMN_FIELD.duration,
      minWidth: 100,
    },
    ...configs02,
    {
      label: 'Hành động',
      field: COMMON_COLUMN_FIELD.actions,
      minWidth: 200,
    },
  ];
};
