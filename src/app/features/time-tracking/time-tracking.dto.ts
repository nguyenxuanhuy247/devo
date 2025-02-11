import { ID } from '../../shared/interface/common.interface';
import { EApiMethod } from '../../contants/common.constant';
import { ITimeTrackingRowData } from './time-tracking.model';

export enum EGetApiMode {
  EMPLOYEES = 1,
  PROJECTS = 2,
  MODULES = 3,
  MENUS = 4,
  SCREENS = 5,
  FEATURES = 6,
  DEPARTMENTS = 7,
  INDEPENDENT_DROPDOWN = 8,

  TABLE_DATA = 10,
  DETAIL = 11,
}

export enum ETabName {
  ESTIMATE = 'Dự toán',
  LOG_WORK = 'Log work',
  ISSUE = 'Vấn đề',
  BUG = 'Bug',
  IMPROVEMENT = 'Improvement',
  FIX_BUG_IMPROVEMENT = 'Fix Bug & Do Improvement',
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
export interface ITimeTrackingResponseDTO {
  mode: EGetApiMode;
}

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

export interface IEmployeeResponseDTO {
  id: ID;
  employeeName: string;
  employeeCode: number;
  username: string;
  email: string;
  levelName: string;
  bugImprovementApi: string;
  projects: IProjectInEmployeeResponseDTO[];
}

export interface IProjectInEmployeeResponseDTO {
  projectName: string;
  fk_modules: string;
}

export interface IProjectResponseDTO {
  id: ID;
  projectName: string;
  modules: IModulesInProjectResponseDTO[];
}

export interface IModulesInProjectResponseDTO {
  moduleName: string;
  fk_menus: string;
}

export interface IModulesResponseDTO {
  id: ID;
  moduleName: 'Danh mục';
  menus: IMenusInModuleResponseDTO[];
}

export interface IMenusInModuleResponseDTO {
  menuName: string;
  fk_screens: string;
}

export interface IMenusResponseDTO {
  id: ID;
  menuName: string;
  screens: IScreensInMenuResponseDTO[];
}

export interface IScreensInMenuResponseDTO {
  menuName: string;
  fk_screens: string;
}

export interface IMenusResponseDTO {
  id: ID;
  menuName: string;
  screens: IScreensInMenuResponseDTO[];
}

export interface IScreensInMenuResponseDTO {
  menuName: string;
  fk_screens: string;
}

export interface IScreensResponseDTO {
  id: ID;
  screenName: string;
  features: IFeaturesInScreenResponseDTO[];
}

export interface IFeaturesInScreenResponseDTO {
  featureName: string;
}

export interface IIndependentDropdownResponseDTO {
  tabs: ITabsInIndependentDropdownResponseDTO[];
  categories: ICategoriesInIndependentDropdownResponseDTO[];
  dayoffs: IDayoffsInIndependentDropdownResponseDTO[];
}

export interface ITabsInIndependentDropdownResponseDTO {
  id: ID;
  tabName: string;
}

export interface ICategoriesInIndependentDropdownResponseDTO {
  id: ID;
  categoryName: string;
}

export interface IDayoffsInIndependentDropdownResponseDTO {
  id: ID;
  dayoff: string;
}

export interface IBugImprovementSheetData {
  range: string;
  majorDimension: string;
  values: any[][];
}

// 🡩🡩🡩🡩🡩 END REGION : Response DTO 🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩
