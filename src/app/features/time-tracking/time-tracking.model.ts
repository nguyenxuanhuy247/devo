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
  employeeLevel: string;
  project: string;
  dateRange: [Date, Date];
  quickDate: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
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
  employee: string;
  employeeLevel: string;
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
  createdDate: Date;
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

export const nullableObj: ITimeTrackingRowData = {
  mode: EMode.VIEW,
  id: null,
  project: null,
  employee: null,
  employeeLevel: null,
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
