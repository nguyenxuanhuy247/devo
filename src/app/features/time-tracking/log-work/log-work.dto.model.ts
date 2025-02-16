import { ID } from '../../../shared/interface/common.interface';

export interface ILogWorkRequestDTO {
  id: ID;
  employeeLevelId: string;
  employeeId: string;
  projectId: string;
  moduleId: string;
  menuId: string;
  screenId: string;
  featureId: string;
  tabId: string;
  categoryId: string;
  workContent: string;
  issueId: string;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: Date;
  updatedDate: Date;
}
