import { ID } from '../../shared/interface/common.interface';
import { EApiMethod } from '../../contants/common.constant';
import { ITimeTrackingRowData } from './time-tracking.model';

export enum EGetApiMode {
  DROPDOWN = 'DROPDOWN',
  INDEPENDENT_DROPDOWN = 'INDEPENDENT_DROPDOWN',
  TABLE_DATA = 'TABLE_DATA',
  DETAIL = 'DETAIL',

  EMPLOYEES = 1,
  PROJECTS = 2,
  MODULES = 3,
  MENUS = 4,
  SCREENS = 5,
  FEATURES = 6,
  DEPARTMENTS = 7,
}

export enum ETabName {
  ESTIMATE = 'Dự toán',
  LOG_WORK = 'Log work',
  ISSUE = 'Vấn đề',
  BUG = 'Bug',
  IMPROVEMENT = 'Improvement',
  FIX_BUG_DO_IMPROVEMENT = 'Fix Bug & Do Improvement',
  REPORT = 'Report',
}

export enum ECategory {
  UI = 'UI',
  API = 'API',
  FIX_BUG = 'Fix bug',
  IMPROVEMENT = 'Improvement',
}

// 🡫🡫🡫🡫🡫 START REGION : Request DTO 🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫
export interface ITimeTrackingRequestDTO {
  mode: EGetApiMode;
}

export interface ITimeTrackingDoGetRequestDTO {
  method: EApiMethod.GET;
  mode: EGetApiMode;
  employee: string;
  project: string;
  tab: ETabName;
  startTime: Date;
  endTime: Date;
}

export interface ITimeTrackingDoPostRequestDTO {
  method: EApiMethod.POST | EApiMethod.PUT | EApiMethod.DELETE;
  isBulk: boolean;
  ids: ID[];
  data: ITimeTrackingRowData[];
}

// 🡩🡩🡩🡩🡩 END REGION : Request DTO 🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩

// 🡫🡫🡫🡫🡫 START REGION : Response DTO 🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫

// Lấy danh sách TableData từ DATABASE
export interface ILogWorkTableDataResponseDTO {
  id: ID;
  project: string;
  pic: string;
  picLevel: string;
  tab: string;
  module: string;
  menu: string;
  screen: string;
  feature: string;
  category: string;
  workContent: string;
  isSolveIssue: string;
  encounteredIssue: string;
  interruptionReason: string;
  startTime: string;
  endTime: string;
  duration: number;
  isLunchBreak: boolean;
  isProgressBlock: boolean;
  notes: string;
  createdDate: string;
  updatedDate: string;
}

// Lấy danh sách dropdown phụ thuộc

export interface IEmployeeLevelResponseDTO {
  id: ID;
  levelName: string;
  createdDate: string;
  updatedDate: string;
  employees: IEmployeeChildListResponseDTO[];
}

export interface IEmployeeChildListResponseDTO {
  id: ID;
  employeeName: string;
  employeeCode: number;
  username: string;
  email: string;
  bugImprovementApi: string;
  bugImprovementSpreadsheet: string;
  employeeLevelId: ID;
  createdDate: string;
  updatedDate: string;
}

export interface IEmployeeResponseDTO {
  id: ID;
  employeeName: string;
  employeeCode: number;
  username: string;
  email: string;
  bugImprovementApi: string;
  bugImprovementSpreadsheet: string;
  employeeLevelId: ID;
  createdDate: string;
  updatedDate: string;
  projects: IProjectChildListResponseDTO[];
}

export interface IProjectChildListResponseDTO {
  id: ID;
  projectName: string;
  createdDate: string;
  updatedDate: string;
}

export interface IProjectResponseDTO {
  id: ID;
  projectName: string;
  createdDate: string;
  updatedDate: string;
  modules: IModuleChildListResponseDTO[];
}

export interface IModuleChildListResponseDTO {
  id: ID;
  moduleName: string;
  projectId: ID;
  createdDate: string;
  updatedDate: string;
}

export interface IModuleResponseDTO {
  id: ID;
  moduleName: string;
  projectId: ID;
  createdDate: string;
  updatedDate: string;
  menus: IMenuChildListResponseDTO[];
}

export interface IMenuChildListResponseDTO {
  id: ID;
  menuName: string;
  moduleId: ID;
  createdDate: string;
  updatedDate: string;
}

export interface IMenuResponseDTO {
  id: ID;
  menuName: string;
  moduleId: ID;
  createdDate: string;
  updatedDate: string;
  screens: IScreenChildListResponseDTO[];
}

export interface IScreenChildListResponseDTO {
  id: ID;
  screenName: string;
  status: string;
  menuId: ID;
  createdDate: string;
  updatedDate: string;
}

export interface IScreenResponseDTO {
  id: ID;
  screenName: string;
  status: string;
  menuId: ID;
  createdDate: string;
  updatedDate: string;
  features: IFeatureResponseDTO[];
}

export interface IFeatureResponseDTO {
  id: ID;
  featureName: string;
  screenId: ID;
  createdDate: string;
  updatedDate: string;
}

export interface IDepartmentResponseDTO {
  id: ID;
  departmentName: string;
  createdDate: string;
  updatedDate: string;
  interruptionReasons: IInterruptionReasonChildListResponseDTO[];
}

export interface IInterruptionReasonChildListResponseDTO {
  id: ID;
  interruptionReasonName: string;
  departmentId: string;
  createdDate: string;
  updatedDate: string;
}

export interface ICategoryResponseDTO {
  id: ID;
  categoryName: string;
  createdDate: string;
  updatedDate: string;
}

export interface IDayOffResponseDTO {
  id: ID;
  dayOff: string;
  createdDate: string;
  updatedDate: string;
}

// 🡩🡩🡩🡩🡩 END REGION : Response DTO 🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩
