import { CommonService } from '../../services';

export const SELECT_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<ISelectFormGroup>();

export interface ISelectFormGroup {
  pic: string;
  project: string;
  dateRange: [Date, Date];
}

export enum EColumnField {
  ID = 'id',
  PROJECT = 'project',
  PIC = 'pic',
  PIC_LEVEL = 'picLevel',
  TAB = 'tab',
  MODULE = 'module',
  MENU = 'menu',
  SCREEN = 'screen',
  FEATURE = 'feature',
  CATEGORY = 'category',
  WORK_CONTENT = 'workContent',
  IS_SOLVE_ISSUE = 'isSolveIssue',
  ENCOUNTERED_ISSUE = 'encounteredIssue',
  INTERRUPTION_REASON = 'interruptionReason',
  START_TIME = 'startTime',
  END_TIME = 'endTime',
  DURATION = 'duration',
  IS_LUNCH_BREAK = 'isLunchBreak',
  IS_PROGRESS_BLOCK = 'isProgressBlock',
  NOTES = 'notes',
  CREATED_DATE = 'createdDate',
  ACTIONS = 'actions',
}

export const estimateHeaderColumns = [
  {
    label: 'Module',
    value: EColumnField.MODULE,
  },
  {
    label: 'Menu',
    value: EColumnField.MENU,
  },
  {
    label: 'Màn hình',
    value: EColumnField.SCREEN,
  },
  {
    label: 'Tính năng',
    value: EColumnField.FEATURE,
  },
  {
    label: 'Phân loại',
    value: EColumnField.CATEGORY,
  },
  {
    label: 'Thời gian bắt đầu',
    value: EColumnField.START_TIME,
  },
  {
    label: 'Thời lượng',
    value: EColumnField.DURATION,
  },
  {
    label: 'Thời gian hoàn thành',
    value: EColumnField.END_TIME,
  },
  {
    label: 'Hành động',
    value: EColumnField.ACTIONS,
  },
];

export const logWorkHeaderColumns = [
  {
    label: 'Module',
    value: EColumnField.MODULE,
  },
  {
    label: 'Menu',
    value: EColumnField.MENU,
  },
  {
    label: 'Màn hình',
    value: EColumnField.SCREEN,
  },
  {
    label: 'Tính năng',
    value: EColumnField.FEATURE,
  },
  {
    label: 'Phân loại',
    value: EColumnField.CATEGORY,
  },
  {
    label: 'Nội dung công việc',
    value: EColumnField.WORK_CONTENT,
  },
  {
    label: 'Thời gian bắt đầu',
    value: EColumnField.START_TIME,
  },
  {
    label: 'Thời gian hoàn thành',
    value: EColumnField.END_TIME,
  },
  {
    label: 'Thời lượng',
    value: EColumnField.DURATION,
  },
  {
    label: 'Nghỉ trưa',
    value: EColumnField.IS_LUNCH_BREAK,
  },
  {
    label: 'Giải quyết vấn đề',
    value: EColumnField.IS_SOLVE_ISSUE,
  },
  {
    label: 'Vấn đề gặp phải',
    value: EColumnField.ENCOUNTERED_ISSUE,
  },
  {
    label: 'Hành động',
    value: EColumnField.ACTIONS,
  },
];

export const issuesHeaderColumns = [
  {
    label: 'Module',
    value: EColumnField.MODULE,
  },
  {
    label: 'Menu',
    value: EColumnField.MENU,
  },
  {
    label: 'Màn hình',
    value: EColumnField.SCREEN,
  },
  {
    label: 'Tính năng',
    value: EColumnField.FEATURE,
  },
  {
    label: 'Phân loại',
    value: EColumnField.CATEGORY,
  },
  {
    label: 'Lý do gián đoạn',
    value: EColumnField.INTERRUPTION_REASON,
  },
  {
    label: 'Vấn đề gặp phải',
    value: EColumnField.ENCOUNTERED_ISSUE,
  },
  {
    label: 'Block tiến độ',
    value: EColumnField.IS_PROGRESS_BLOCK,
  },
  {
    label: 'Thời gian bắt đầu',
    value: EColumnField.START_TIME,
  },
  {
    label: 'Thời gian hoàn thành',
    value: EColumnField.END_TIME,
  },
  {
    label: 'Thời lượng',
    value: EColumnField.DURATION,
  },
  {
    label: 'Hành động',
    value: EColumnField.ACTIONS,
  },
];
