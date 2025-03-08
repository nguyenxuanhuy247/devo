import { ID } from '../../../shared/interface/common.interface';

export interface IEstimateRequestDTO {
  id: ID;
  employeeLevelId: string;
  employeeId: string;
  projectId: string;
  moduleId: string;
  menuId: string;
  screenId: string;
  featureId: string;
  categoryId: string;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: Date;
  updatedDate: Date;
}

export interface IEstimateResponseDTO {
  id: ID;
  employeeLevelId: string;
  employeeId: string;
  projectId: string;
  moduleId: string;
  menuId: string;
  screenId: string;
  featureId: string;
  categoryId: string;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: string;
  updatedDate: string;
}
