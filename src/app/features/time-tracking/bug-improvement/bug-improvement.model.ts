import { EMode } from 'src/app/contants/common.constant';
import { CommonService } from 'src/app/services';
import {
  IColumnHeaderConfigs,
  ID,
} from 'src/app/shared/interface/common.interface';

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

export interface IBugImprovementListRowData {
  mode: EMode;
  id: ID;
  moduleId: ID;
  menuId: ID;
  screenId: ID;
  featureId: ID;
  categoryId: ID;
  code: string;
  startTime: string;
  endTime: string;
  duration: number;
  isLunchBreak: boolean;
  createdDate: Date;
  updatedDate: Date;
}

export const bugImprovementListHeaderColumns: IColumnHeaderConfigs[] = [
  {
    label: 'STT',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.no,
    minWidth: 80,
  },
  {
    label: 'Module',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.moduleId,
    minWidth: 200,
  },
  {
    label: 'Menu',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.menuId,
    minWidth: 200,
  },
  {
    label: 'Màn hình',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.screenId,
    minWidth: 200,
  },
  {
    label: 'Tính năng',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.featureId,
    minWidth: 200,
  },
  {
    label: 'Phân loại',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.categoryId,
    minWidth: 140,
  },
  {
    label: 'Mã bug & improvement',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.code,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.startTime,
    minWidth: 200,
  },
  {
    label: 'Thời gian hoàn thành',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.endTime,
    minWidth: 200,
  },
  {
    label: 'Thời lượng',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.duration,
    minWidth: 100,
  },
  {
    label: 'Nghỉ trưa',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.isLunchBreak,
    minWidth: 100,
  },
  {
    label: 'Hành động',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.actions,
    minWidth: 120,
  },
];
