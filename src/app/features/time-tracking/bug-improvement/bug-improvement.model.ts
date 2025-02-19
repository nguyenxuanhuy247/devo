import { EMode } from 'src/app/contants/common.constant';
import { CommonService } from 'src/app/services';
import {
  IColumnHeaderConfigs,
  ID,
} from 'src/app/shared/interface/common.interface';

export const BUG_IMPROVEMENT_FORM_GROUP_KEYS =
  CommonService.generateEnumFromInterface<IBugImprovementRowData>();

export interface IBugImprovementRowData {
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
  createdDate: Date;
  updatedDate: Date;
}

export const nullableBugImprovementObj: IBugImprovementRowData = {
  mode: EMode.VIEW,
  id: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  workContent: null,
  deadlineId: null,
  startTime: null,
  endTime: null,
  duration: null,
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
  tabId: ID;
  categoryId: ID;
  workContent: string;
  startTime: string;
  endTime: string;
  duration: number;
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
    minWidth: 200,
  },
  {
    label: 'Mã bug & improvement',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.workContent,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.startTime,
    minWidth: 120,
  },
  {
    label: 'Thời gian hoàn thành',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.endTime,
    minWidth: 120,
  },
  {
    label: 'Thời lượng',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.duration,
    minWidth: 120,
  },
  {
    label: 'Hành động',
    field: BUG_IMPROVEMENT_LIST_COLUMN_FIELD.actions,
    minWidth: 120,
  },
];
