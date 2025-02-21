import { CommonService } from '../../services';
import { ID, IOption } from '../../shared/interface/common.interface';
import { EMode } from '../../contants/common.constant';
import { FormArray } from '@angular/forms';
import {
  ICategoryResponseDTO,
  IDayOffResponseDTO,
  IDepartmentEmployeeResponseDTO,
  IDepartmentResponseDTO,
  IEmployeeLevelResponseDTO,
  IEmployeeResponseDTO,
  IFeatureResponseDTO,
  IInterruptionReasonResponseDTO,
  IMenuResponseDTO,
  IModuleResponseDTO,
  IProjectResponseDTO,
  IScreenResponseDTO,
  IStageResponseDTO,
  IStatuseResponseDTO,
} from './time-tracking.dto';

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
  quickDate: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
  formArray: FormArray;
}

export enum EStatsBy {
  ALL = 'ALL',
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  CUSTOM = 'CUSTOM',
}

export const nullableObj: any = {
  mode: EMode.VIEW,
  id: null,
  employeeLevelId: null,
  projectId: null,
  employeeId: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  tabId: null,
  categoryId: null,
  workContent: null,
  isSolveIssue: null,
  departmentMakeIssue: null,
  interruptionReason: null,
  employeeMakeIssue: null,
  encounteredIssue: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: true,
  isProgressBlock: null,
  // notes: null,
  status: null,
  createdDate: null,
  updatedDate: null,
};

export interface IDependentDropDown {
  [s: string]: Record<ID, IOption[]>;
}

export interface IIndependentDropDownSignal {
  tabs: IOption[];
  categories: IOption[];
  dayoffs: IOption[];
  departments: IOption[];
}

//
// export const FAKE_REPORT_DATA = [
//   {
//     id: '1000',
//     module: 'Lịch họp',
//     menu: 'Danh sách lịch họp',
//     screen: 'Danh sách lịch họp',
//     issueNumber: '3',
//     status: 'Đang làm',
//     details: [
//       {
//         id: '1000-0',
//         screen: 'f230fh0g3',
//         issueNumber: '3',
//         status: 'Đang làm',
//       },
//     ],
//   },
//   {
//     id: '1001',
//     module: 'Lịch họp 22',
//     menu: 'Danh sách lịch họp22',
//     screen: 'Danh sách lịch họp22',
//     issueNumber: '3',
//     status: 'Đang làm',
//     details: [
//       {
//         id: '1000-0',
//         screen: 'f230fh0g3',
//         issueNumber: '3',
//         status: 'Đang làm',
//       },
//     ],
//   },
// ];

export interface IAllDropDownResponseDTO {
  employeeLevels: IEmployeeLevelResponseDTO[];
  employees: IEmployeeResponseDTO[];
  projects: IProjectResponseDTO[];
  modules: IModuleResponseDTO[];
  menus: IMenuResponseDTO[];
  screens: IScreenResponseDTO[];
  features: IFeatureResponseDTO[];
  categories: ICategoryResponseDTO[];
  departments: IDepartmentResponseDTO[];
  departmentEmployees: IDepartmentEmployeeResponseDTO[];
  interruptionReasons: IInterruptionReasonResponseDTO[];
  dayOffs: IDayOffResponseDTO[];
  stages: IStageResponseDTO[];
  statuses: IStatuseResponseDTO[];
}

export interface ITabComponent {
  callAPIGetTableData(): void;
}
