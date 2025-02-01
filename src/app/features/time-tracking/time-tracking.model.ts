import { CommonService } from '../../services';
import { ID } from '../../shared/interface/common.interface';
import { EMode } from '../../contants/common.constant';

export const SELECT_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<ISelectFormGroup>();

export interface ISelectFormGroup {
  pic: string;
  project: string;
  dateRange: [Date, Date];
}

export const TIME_TRACKING_ROW_DATA_KEYS =
  CommonService.generateEnumFromInterface<ITimeTrackingRowData>();
export const COLUMN_FIELD = Object.assign(TIME_TRACKING_ROW_DATA_KEYS, {
  actions: 'actions',
});

export interface ITimeTrackingRowData {
  mode: EMode;
  id: ID;
  project: string;
  pic: string;
  picLevel: string;
  tab: string;
  module: string;
  menu: string;
  screen: string;
  feature: string;
  category: string;
  workContent: string;
  isSolveIssue: string;
  encounteredIssue: string;
  interruptionReason: string;
  startTime: string;
  endTime: string;
  duration: number;
  isLunchBreak: boolean;
  isProgressBlock: boolean;
  notes: string;
  createdDate: string;
}

export interface IFormGroup extends ITimeTrackingRowData {
  pic: string;
  dateRange: [Date, Date];
  project: string;
  quickDateRange: string;
}

export const FORM_GROUP_KEYS =
  CommonService.generateEnumFromInterface<IFormGroup>();

export const estimateHeaderColumns = [
  {
    label: 'Module',
    value: COLUMN_FIELD.module,
  },
  {
    label: 'Menu',
    value: COLUMN_FIELD.menu,
  },
  {
    label: 'Màn hình',
    value: COLUMN_FIELD.screen,
  },
  {
    label: 'Tính năng',
    value: COLUMN_FIELD.feature,
  },
  {
    label: 'Phân loại',
    value: COLUMN_FIELD.category,
  },
  {
    label: 'Thời gian bắt đầu',
    value: COLUMN_FIELD.startTime,
  },
  {
    label: 'Thời lượng',
    value: COLUMN_FIELD.duration,
  },
  {
    label: 'Thời gian hoàn thành',
    value: COLUMN_FIELD.endTime,
  },
  {
    label: 'Hành động',
    value: COLUMN_FIELD.actions,
  },
];

export const logWorkHeaderColumns = [
  {
    label: 'Module',
    value: COLUMN_FIELD.module,
  },
  {
    label: 'Menu',
    value: COLUMN_FIELD.menu,
  },
  {
    label: 'Màn hình',
    value: COLUMN_FIELD.screen,
  },
  {
    label: 'Tính năng',
    value: COLUMN_FIELD.feature,
  },
  {
    label: 'Phân loại',
    value: COLUMN_FIELD.category,
  },
  {
    label: 'Nội dung công việc',
    value: COLUMN_FIELD.workContent,
  },
  {
    label: 'Thời gian bắt đầu',
    value: COLUMN_FIELD.startTime,
  },
  {
    label: 'Thời gian hoàn thành',
    value: COLUMN_FIELD.endTime,
  },
  {
    label: 'Thời lượng',
    value: COLUMN_FIELD.duration,
  },
  {
    label: 'Nghỉ trưa',
    value: COLUMN_FIELD.isLunchBreak,
  },
  {
    label: 'Giải quyết vấn đề',
    value: COLUMN_FIELD.isSolveIssue,
  },
  {
    label: 'Vấn đề gặp phải',
    value: COLUMN_FIELD.encounteredIssue,
  },
  {
    label: 'Hành động',
    value: COLUMN_FIELD.actions,
  },
];

export const issuesHeaderColumns = [
  {
    label: 'Module',
    value: COLUMN_FIELD.module,
  },
  {
    label: 'Menu',
    value: COLUMN_FIELD.menu,
  },
  {
    label: 'Màn hình',
    value: COLUMN_FIELD.screen,
  },
  {
    label: 'Tính năng',
    value: COLUMN_FIELD.feature,
  },
  {
    label: 'Phân loại',
    value: COLUMN_FIELD.category,
  },
  {
    label: 'Lý do gián đoạn',
    value: COLUMN_FIELD.interruptionReason,
  },
  {
    label: 'Vấn đề gặp phải',
    value: COLUMN_FIELD.encounteredIssue,
  },
  {
    label: 'Block tiến độ',
    value: COLUMN_FIELD.isProgressBlock,
  },
  {
    label: 'Thời gian bắt đầu',
    value: COLUMN_FIELD.startTime,
  },
  {
    label: 'Thời gian hoàn thành',
    value: COLUMN_FIELD.endTime,
  },
  {
    label: 'Thời lượng',
    value: COLUMN_FIELD.duration,
  },
  {
    label: 'Hành động',
    value: COLUMN_FIELD.actions,
  },
];

// export enum COLUMN_FIELD {
//   ID = 'id',
//   PROJECT = 'project',
//   PIC = 'pic',
//   PIC_LEVEL = 'picLevel',
//   TAB = 'tab',
//   MODULE = 'module',
//   MENU = 'menu',
//   SCREEN = 'screen',
//   FEATURE = 'feature',
//   CATEGORY = 'category',
//   WORK_CONTENT = 'workContent',
//   IS_SOLVE_ISSUE = 'isSolveIssue',
//   ENCOUNTERED_ISSUE = 'encounteredIssue',
//   INTERRUPTION_REASON = 'interruptionReason',
//   START_TIME = 'startTime',
//   END_TIME = 'endTime',
//   DURATION = 'duration',
//   IS_LUNCH_BREAK = 'isLunchBreak',
//   IS_PROGRESS_BLOCK = 'isProgressBlock',
//   NOTES = 'notes',
//   CREATED_DATE = 'createdDate',
//   ACTIONS = 'actions',
// }

export const nullableObj: ITimeTrackingRowData = {
  mode: EMode.VIEW,
  id: null,
  project: null,
  pic: null,
  picLevel: null,
  tab: null,
  module: null,
  menu: null,
  screen: null,
  feature: null,
  category: null,
  workContent: null,
  isSolveIssue: null,
  encounteredIssue: null,
  interruptionReason: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: null,
  isProgressBlock: null,
  notes: null,
  createdDate: null,
};
