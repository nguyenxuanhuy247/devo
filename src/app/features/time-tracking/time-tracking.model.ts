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
}

export interface ITabComponent {
  callAPIGetTableData(): void;
}
