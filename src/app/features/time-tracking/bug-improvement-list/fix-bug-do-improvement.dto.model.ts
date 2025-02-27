import { ID } from '../../../shared/interface/common.interface';

export interface IFixBugDoImprovementResponseDTO {
  moduleName: string;
  menuName: string;
  screenName: string;
  featureName: string;
  tabName: string;
  code: string;
  bugName: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  notes: string;
  createdDate: string;
}

export interface IFixBugDoImprovementRequestDTO {
  id: ID;
  employeeLevelId: string;
  employeeId: string;
  projectId: string;
  moduleId: string;
  menuId: string;
  screenId: string;
  featureId: string;
  categoryId: string;
  code: string;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: Date;
  updatedDate: Date;
}
