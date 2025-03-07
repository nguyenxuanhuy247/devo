import { EMode } from 'src/app/contants/common.constant';
import { CommonService } from 'src/app/services';
import {
  COMMON_COLUMN_FIELD,
  getHeaderColumnConfigsFactory,
} from '../time-tracking.model';
import { IBugResponseDTO } from './bug.dto.model';

export const BUG_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<IBugRowData>();

export type IBugFormGroup = IBugRowData;

export const bugNullableObj: IBugRowData = {
  mode: EMode.VIEW,
  selected: false,
  id: Math.random(),
  employeeLevelId: null,
  employeeId: null,
  projectId: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  code: null,
  name: null,
  statusId: null,
  note: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: true,
  createdDate: null,
  updatedDate: null,
};

export const BUG_COLUMN_FIELD = Object.assign(
  COMMON_COLUMN_FIELD,
  CommonService.generateEnumFromInterface<IBugRowData>(),
  {
    order: 'order',
    actions: 'actions',
  },
);

export interface IBugRowData extends IBugResponseDTO {
  mode: EMode;
  selected: boolean;
  name: string;
  isLunchBreak: boolean;
}

export const bugHeaderColumnConfigs = getHeaderColumnConfigsFactory(
  [
    {
      label: 'Mã bug',
      field: BUG_COLUMN_FIELD.code,
      minWidth: 120,
    },
    {
      label: 'Tên bug',
      field: BUG_COLUMN_FIELD.name,
      minWidth: 300,
    },
    {
      label: 'Hiện trạng',
      field: BUG_COLUMN_FIELD.statusId,
      minWidth: 200,
    },
    {
      label: 'Ghi chú',
      field: BUG_COLUMN_FIELD.note,
      minWidth: 200,
    },
  ],
  [
    {
      label: 'Nghỉ trưa',
      field: BUG_COLUMN_FIELD.isLunchBreak,
      minWidth: 100,
    },
  ],
);
