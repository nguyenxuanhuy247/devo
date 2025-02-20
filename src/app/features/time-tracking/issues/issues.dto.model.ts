import { ID } from 'src/app/shared/interface/common.interface';

export interface IIssuesTableDataResponseDTO {
  id: ID;
  employeeLevelId: ID;
  employeeId: ID;
  projectId: ID;
  moduleId: ID;
  menuId: ID;
  screenId: ID;
  featureId: ID;
  categoryId: ID;
  issueCode: string;
  IssueName: string;
  issueContent: string;
  departmentMakeId: ID;
  employeeMakeId: ID;
  interruptionReasonId: ID;
  deadlineId: ID;
  statusId: ID;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: string;
  updatedDate: string;
}
