import { ID } from '../../../shared/interface/common.interface';

export interface IImprovementResponseDTO {
  id: ID;
  employeeLevelId: ID;
  employeeId: ID;
  projectId: ID;
  moduleId: ID;
  menuId: ID;
  screenId: ID;
  featureId: ID;
  categoryId: ID;
  code: string;
  statusId: ID;
  note: string;
  issueId: ID;
  deadlineId: ID;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: string;
  updatedDate: string;
}
