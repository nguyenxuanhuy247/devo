import { CommonService } from '../../services';
import {
  IColumnHeaderConfigs,
  ID,
  IOption,
} from '../../shared/interface/common.interface';
import { EMode } from '../../contants/common.constant';

export const SELECT_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<ISelectFormGroup>();

export interface ISelectFormGroup {
  employee: string;
  project: string;
  dateRange: [Date, Date];
  quickDateRange: any;
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

export const estimateHeaderColumns: IColumnHeaderConfigs[] = [
  {
    label: 'Module',
    value: COLUMN_FIELD.module,
    minWidth: 120,
  },
  {
    label: 'Menu',
    value: COLUMN_FIELD.menu,
    minWidth: 120,
  },
  {
    label: 'Màn hình',
    value: COLUMN_FIELD.screen,
    minWidth: 120,
  },
  {
    label: 'Tính năng',
    value: COLUMN_FIELD.feature,
    minWidth: 120,
  },
  {
    label: 'Phân loại',
    value: COLUMN_FIELD.category,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    value: COLUMN_FIELD.startTime,
    minWidth: 120,
  },
  {
    label: 'Thời lượng',
    value: COLUMN_FIELD.duration,
    minWidth: 120,
  },
  {
    label: 'Thời gian hoàn thành',
    value: COLUMN_FIELD.endTime,
    minWidth: 120,
  },
  {
    label: 'Hành động',
    value: COLUMN_FIELD.actions,
    minWidth: 120,
  },
];

export const logWorkHeaderColumns = [
  {
    label: 'Module',
    value: COLUMN_FIELD.module,
    minWidth: 120,
  },
  {
    label: 'Menu',
    value: COLUMN_FIELD.menu,
    minWidth: 120,
  },
  {
    label: 'Màn hình',
    value: COLUMN_FIELD.screen,
    minWidth: 120,
  },
  {
    label: 'Tính năng',
    value: COLUMN_FIELD.feature,
    minWidth: 120,
  },
  {
    label: 'Phân loại',
    value: COLUMN_FIELD.category,
    minWidth: 120,
  },
  {
    label: 'Nội dung công việc',
    value: COLUMN_FIELD.workContent,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    value: COLUMN_FIELD.startTime,
    minWidth: 180,
  },
  {
    label: 'Thời gian hoàn thành',
    value: COLUMN_FIELD.endTime,
    minWidth: 180,
  },
  {
    label: 'Thời lượng',
    value: COLUMN_FIELD.duration,
    minWidth: 60,
  },
  {
    label: 'Nghỉ trưa',
    value: COLUMN_FIELD.isLunchBreak,
    minWidth: 60,
  },
  {
    label: 'Giải quyết vấn đề',
    value: COLUMN_FIELD.isSolveIssue,
    minWidth: 120,
  },
  {
    label: 'Vấn đề gặp phải',
    value: COLUMN_FIELD.encounteredIssue,
    minWidth: 200,
  },
  {
    label: 'Hành động',
    value: COLUMN_FIELD.actions,
    minWidth: 120,
  },
];

export const issuesHeaderColumns: IColumnHeaderConfigs[] = [
  {
    label: 'Module',
    value: COLUMN_FIELD.module,
    minWidth: 120,
  },
  {
    label: 'Menu',
    value: COLUMN_FIELD.menu,
    minWidth: 120,
  },
  {
    label: 'Màn hình',
    value: COLUMN_FIELD.screen,
    minWidth: 120,
  },
  {
    label: 'Tính năng',
    value: COLUMN_FIELD.feature,
    minWidth: 120,
  },
  {
    label: 'Phân loại',
    value: COLUMN_FIELD.category,
    minWidth: 120,
  },
  {
    label: 'Lý do gián đoạn',
    value: COLUMN_FIELD.interruptionReason,
    minWidth: 120,
  },
  {
    label: 'Vấn đề gặp phải',
    value: COLUMN_FIELD.encounteredIssue,
    minWidth: 120,
  },
  {
    label: 'Block tiến độ',
    value: COLUMN_FIELD.isProgressBlock,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    value: COLUMN_FIELD.startTime,
    minWidth: 120,
  },
  {
    label: 'Thời gian hoàn thành',
    value: COLUMN_FIELD.endTime,
    minWidth: 120,
  },
  {
    label: 'Thời lượng',
    value: COLUMN_FIELD.duration,
    minWidth: 120,
  },
  {
    label: 'Hành động',
    value: COLUMN_FIELD.actions,
    minWidth: 120,
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
  isLunchBreak: true,
  isProgressBlock: null,
  notes: null,
  createdDate: null,
};

export interface IDependentDropDown {
  [s: string]: IOption[];
}

export interface IIndependentDropDownSignal {
  tabs: IOption[];
  categories: IOption[];
  dayoffs: IOption[];
}
