import { ID } from '../../shared/interface/common.interface';

export enum EGetApiMode {
  USERS = 1,
  PROJECTS = 2,
  MODULES = 3,
  MENUS = 4,
  SCREENS = 5,
  FEATURES = 6,
  TABLE_DATA = 1111,
  DETAIL = 22222,
}

// 🡫🡫🡫🡫🡫 START REGION : Request DTO 🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫
export interface ITimeTrackingRequestDTO {
  mode: EGetApiMode;
}

export interface ITimeTrackingTableDataRequestDTO {
  tabIndex: number;
  startTime: Date;
  endTime: Date;
  pic: string;
  mode: EGetApiMode;
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
}

export interface IUsersResponseDTO {
  id: ID;
  employeeName: string;
  employeeCode: number;
  username: string;
  email: string;
  levelName: string;
  projects: IProjectsInUserResponseDTO[];
}

export interface IProjectsInUserResponseDTO {
  projectName: string;
  fk_modules: string;
}

export interface IProjectsResponseDTO {
  id: ID;
  projectName: 'VOffice';
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

// 🡩🡩🡩🡩🡩 END REGION : Response DTO 🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩

