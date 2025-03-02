import { EMode } from 'src/app/contants/common.constant';
import { CommonService } from 'src/app/services';
import {
  getHeaderColumnConfigsFactory,
  ICommonTimeTrackingRowData,
} from '../time-tracking.model';

export const BUG_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<IBugRowData>();

export type IBugFormGroup = IBugRowData;

export const bugNullableObj: IBugRowData = {
  selected: false,
  mode: EMode.VIEW,
  id: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  code: null,
  name: null,
  status: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: true,
  createdDate: null,
  updatedDate: null,
};

export const BUG_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<IBugRowData>(),
  {
    order: 'order',
    actions: 'actions',
  },
);

export interface IBugRowData extends ICommonTimeTrackingRowData {
  code: string;
  isLunchBreak: boolean;
  name: 'name';
  status: 'status';
}

export const bugHeaderColumnConfigs = getHeaderColumnConfigsFactory(
  [
    {
      label: 'Mã bug',
      field: BUG_COLUMN_FIELD.code,
      minWidth: 120,
    },
    {
      label: 'Tên bug & improvement',
      field: BUG_COLUMN_FIELD.name,
      minWidth: 300,
    },
    {
      label: 'Hiện trạng',
      field: BUG_COLUMN_FIELD.status,
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
