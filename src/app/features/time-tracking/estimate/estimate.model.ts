import { EMode } from 'src/app/contants/common.constant';
import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';
import { CommonService } from 'src/app/services';
import { COMMON_COLUMN_FIELD } from '../time-tracking.model';
import { IEstimateResponseDTO } from './estimate.dto.model';

export const ESTIMATE_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<IEstimateRowData>();

export const ESTIMATE_COLUMN_FIELD = Object.assign(
  COMMON_COLUMN_FIELD,
  CommonService.generateEnumFromInterface<IEstimateRowData>(),
  {
    order: 'order',
    actions: 'actions',
  },
);

export interface IEstimateRowData extends IEstimateResponseDTO {
  selected: boolean;
  mode: EMode;
}

export const estimateNullableObj: IEstimateRowData = {
  selected: false,
  mode: EMode.VIEW,
  id: null,
  employeeLevelId: null,
  employeeId: null,
  projectId: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  startTime: null,
  endTime: null,
  duration: null,
  createdDate: null,
  updatedDate: null,
};

export const estimateHeaderColumnConfigs: IColumnHeaderConfigs[] = [
  {
    label: 'STT',
    field: COMMON_COLUMN_FIELD.order,
    minWidth: 80,
  },
  {
    label: 'Module',
    field: COMMON_COLUMN_FIELD.moduleId,
    minWidth: 200,
  },
  {
    label: 'Menu',
    field: COMMON_COLUMN_FIELD.menuId,
    minWidth: 200,
  },
  {
    label: 'Màn hình',
    field: COMMON_COLUMN_FIELD.screenId,
    minWidth: 200,
  },
  {
    label: 'Tính năng',
    field: COMMON_COLUMN_FIELD.featureId,
    minWidth: 200,
  },
  {
    label: 'Phân loại',
    field: COMMON_COLUMN_FIELD.categoryId,
    minWidth: 140,
  },
  {
    label: 'Thời gian bắt đầu',
    field: COMMON_COLUMN_FIELD.startTime,
    minWidth: 200,
  },
  {
    label: 'Thời lượng',
    field: COMMON_COLUMN_FIELD.duration,
    minWidth: 100,
  },
  {
    label: 'Thời gian hoàn thành',
    field: COMMON_COLUMN_FIELD.endTime,
    minWidth: 200,
  },
  {
    label: 'Hành động',
    field: COMMON_COLUMN_FIELD.actions,
    minWidth: 200,
  },
];
