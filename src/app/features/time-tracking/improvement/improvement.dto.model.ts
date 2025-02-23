import { ID } from '../../../shared/interface/common.interface';

export interface IImprovementResponseDTO {
  id: ID;
  moduleId: ID;
  menuId: ID;
  screenId: ID;
  featureId: ID;
  categoryId: ID;
  code: string;
  issueId: ID;
  deadlineId: ID;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: string;
  updatedDate: string;
}
