import { ID } from '../../../shared/interface/common.interface';
import { EMode } from '../../../contants/common.constant';

export interface IBugResponseDTO {
  mode: EMode;
  id: ID;
  moduleId: ID;
  menuId: ID;
  screenId: ID;
  featureId: ID;
  categoryId: ID;
  workContent: string;
  deadlineId: ID;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: string;
  updatedDate: string;
}
