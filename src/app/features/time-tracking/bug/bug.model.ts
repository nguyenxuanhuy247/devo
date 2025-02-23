import { EMode } from 'src/app/contants/common.constant';
import { CommonService } from 'src/app/services';
import {
  getHeaderColumnConfigsFactory,
  ICommonTimeTrackingRowData,
} from '../time-tracking.model';

// export interface IBugImprovementRowData {
//   mode: EMode;
//   id: ID;
//   moduleId: ID;
//   menuId: ID;
//   screenId: ID;
//   featureId: ID;
//   categoryId: ID;
//   workContent: string;
//   deadlineId: ID;
//   startTime: string;
//   endTime: string;
//   duration: number;
//   createdDate: Date;
//   updatedDate: Date;
// }

export const BUG_IMPROVEMENT_FORM_GROUP_KEYS =
  CommonService.generateEnumFromInterface<IBugImprovementListRowData>();

export const nullableBugImprovementObj: IBugImprovementListRowData = {
  mode: EMode.VIEW,
  id: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  code: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: true,
  createdDate: null,
  updatedDate: null,
};

export const BUG_IMPROVEMENT_LIST_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<IBugImprovementListRowData>(),
  {
    no: 'no',
    actions: 'actions',
  },
);

export interface IBugImprovementListRowData extends ICommonTimeTrackingRowData {
  code: string;
  isLunchBreak: boolean;
}

export const bugHeaderColumnConfigs = getHeaderColumnConfigsFactory(
  [
    {
      label: 'Mã bug',
      field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.code,
      minWidth: 120,
    },
  ],
  [
    {
      label: 'Nghỉ trưa',
      field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.isLunchBreak,
      minWidth: 100,
    },
  ],
);
