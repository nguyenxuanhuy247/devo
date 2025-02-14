import { CommonService } from '../../services';
import {
  IColumnHeaderConfigs,
  ID,
  IOption,
} from '../../shared/interface/common.interface';
import { EMode } from '../../contants/common.constant';
import { FormArray } from '@angular/forms';

export const SELECT_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<ISelectFormGroup>();

export interface ISelectFormGroup {
  employee: string;
  employeeLevel: string;
  project: string;
  dateRange: [Date, Date];
  quickDate: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
  formArray: FormArray;
  bugOrImprovement: 'Bug' | 'Improvement';
}

export const TIME_TRACKING_ROW_DATA_KEYS =
  CommonService.generateEnumFromInterface<ITimeTrackingRowData>();
export const COLUMN_FIELD = Object.assign(TIME_TRACKING_ROW_DATA_KEYS, {
  actions: 'actions',
  bugName: 'bugName',
  no: 'no',
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
  departmentMakeIssue: string;
  employeeMakeIssue: string;
  startTime: string;
  endTime: string;
  duration: number;
  isLunchBreak: boolean;
  isProgressBlock: boolean;
  status: 'Đang xử lý' | 'Đã giải quyết';
  // notes: string;
  createdDate: Date;
  updatedDate: Date;
}

export interface IFormGroup extends ITimeTrackingRowData {
  pic: string;
  dateRange: [Date, Date];
  project: string;
  quickDateRange: string;
}

export const FORM_GROUP_KEYS =
  CommonService.generateEnumFromInterface<IFormGroup>();

const commonHeaderColumn: IColumnHeaderConfigs[] = [
  {
    label: 'STT',
    field: COLUMN_FIELD.no,
    minWidth: 70,
  },
  {
    label: 'Module',
    field: COLUMN_FIELD.module,
    minWidth: 200,
  },
  {
    label: 'Menu',
    field: COLUMN_FIELD.menu,
    minWidth: 200,
  },
  {
    label: 'Màn hình',
    field: COLUMN_FIELD.screen,
    minWidth: 200,
  },
  {
    label: 'Tính năng',
    field: COLUMN_FIELD.feature,
    minWidth: 200,
  },
];

export const estimateHeaderColumns: IColumnHeaderConfigs[] = [
  ...commonHeaderColumn,
  {
    label: 'Phân loại',
    field: COLUMN_FIELD.category,
    minWidth: 200,
  },
  {
    label: 'Thời gian bắt đầu',
    field: COLUMN_FIELD.startTime,
    minWidth: 120,
  },
  {
    label: 'Thời lượng',
    field: COLUMN_FIELD.duration,
    minWidth: 120,
  },
  {
    label: 'Thời gian hoàn thành',
    field: COLUMN_FIELD.endTime,
    minWidth: 120,
  },
  {
    label: 'Hành động',
    field: COLUMN_FIELD.actions,
    minWidth: 120,
  },
];

export const logWorkHeaderColumns: IColumnHeaderConfigs[] = [
  ...commonHeaderColumn,
  {
    label: 'Phân loại',
    field: COLUMN_FIELD.category,
    minWidth: 200,
  },
  {
    label: 'Nội dung công việc',
    field: COLUMN_FIELD.workContent,
    minWidth: 120,
  },
  {
    label: 'Vấn đề gặp phải',
    field: COLUMN_FIELD.encounteredIssue,
    minWidth: 200,
  },
  {
    label: 'Thời gian bắt đầu',
    field: COLUMN_FIELD.startTime,
    minWidth: 200,
  },
  {
    label: 'Thời gian hoàn thành',
    field: COLUMN_FIELD.endTime,
    minWidth: 200,
  },
  {
    label: 'Thời lượng',
    field: COLUMN_FIELD.duration,
    minWidth: 60,
  },
  {
    label: 'Nghỉ trưa',
    field: COLUMN_FIELD.isLunchBreak,
    minWidth: 60,
  },
  // {
  //   label: 'Giải quyết vấn đề',
  //   field: COLUMN_FIELD.isSolveIssue,
  //   minWidth: 120,
  // },
  {
    label: 'Hành động',
    field: COLUMN_FIELD.actions,
    minWidth: 120,
  },
];

export const issuesHeaderColumns: IColumnHeaderConfigs[] = [
  ...commonHeaderColumn,
  {
    label: 'Phân loại',
    field: COLUMN_FIELD.category,
    minWidth: 200,
  },
  {
    label: 'Bộ phận gây gián đoạn',
    field: COLUMN_FIELD.departmentMakeIssue,
    minWidth: 140,
  },
  {
    label: 'Lý do gián đoạn',
    field: COLUMN_FIELD.interruptionReason,
    minWidth: 200,
  },
  {
    label: 'Nội dung vấn đề',
    field: COLUMN_FIELD.encounteredIssue,
    minWidth: 200,
  },
  {
    label: 'Người gây gián đoạn',
    field: COLUMN_FIELD.employeeMakeIssue,
    minWidth: 120,
  },
  {
    label: 'Block tiến độ',
    field: COLUMN_FIELD.isProgressBlock,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    field: COLUMN_FIELD.startTime,
    minWidth: 200,
  },
  {
    label: 'Thời gian hoàn thành',
    field: COLUMN_FIELD.endTime,
    minWidth: 200,
  },
  {
    label: 'Thời lượng',
    field: COLUMN_FIELD.duration,
    minWidth: 80,
  },
  {
    label: 'Trạng thái',
    field: COLUMN_FIELD.status,
    minWidth: 180,
  },
  {
    label: 'Hành động',
    field: COLUMN_FIELD.actions,
    minWidth: 120,
  },
];

export const bugImprovementFixHeaderColumns: IColumnHeaderConfigs[] = [
  ...commonHeaderColumn,
  {
    label: 'Phân loại',
    field: COLUMN_FIELD.tab,
    minWidth: 200,
  },
  {
    label: 'Mã bug & improvement',
    field: COLUMN_FIELD.workContent,
    minWidth: 120,
  },
  {
    label: 'Tên bug & improvement',
    field: COLUMN_FIELD.bugName,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    field: COLUMN_FIELD.startTime,
    minWidth: 200,
  },
  {
    label: 'Thời gian hoàn thành',
    field: COLUMN_FIELD.endTime,
    minWidth: 200,
  },
  {
    label: 'Thời lượng',
    field: COLUMN_FIELD.duration,
    minWidth: 120,
  },
];

export const bugImprovementStatsHeaderColumns: IColumnHeaderConfigs[] = [
  ...commonHeaderColumn,
  {
    label: 'Phân loại',
    field: COLUMN_FIELD.tab,
    minWidth: 200,
  },
  {
    label: 'Mã bug & improvement',
    field: COLUMN_FIELD.workContent,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    field: COLUMN_FIELD.startTime,
    minWidth: 120,
  },
  {
    label: 'Thời gian hoàn thành',
    field: COLUMN_FIELD.endTime,
    minWidth: 120,
  },
  {
    label: 'Thời lượng',
    field: COLUMN_FIELD.duration,
    minWidth: 120,
  },
  {
    label: 'Hành động',
    field: COLUMN_FIELD.actions,
    minWidth: 120,
  },
];

// Bảng tiến độ
export const reportHeaderColumns: IColumnHeaderConfigs[] = [
  ...commonHeaderColumn,
  {
    label: 'Phân loại',
    field: COLUMN_FIELD.tab,
    minWidth: 200,
  },
  {
    label: 'Mã bug & improvement',
    field: COLUMN_FIELD.workContent,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    field: COLUMN_FIELD.startTime,
    minWidth: 120,
  },
  {
    label: 'Thời gian hoàn thành',
    field: COLUMN_FIELD.endTime,
    minWidth: 120,
  },
  {
    label: 'Thời lượng',
    field: COLUMN_FIELD.duration,
    minWidth: 120,
  },
  {
    label: 'Hành động',
    field: COLUMN_FIELD.actions,
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
  departmentMakeIssue: null,
  interruptionReason: null,
  employeeMakeIssue: null,
  encounteredIssue: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: true,
  isProgressBlock: null,
  // notes: null,
  status: null,
  createdDate: null,
  updatedDate: null,
};

export interface IDependentDropDown {
  [s: string]: IOption[];
}

export interface IIndependentDropDownSignal {
  tabs: IOption[];
  categories: IOption[];
  dayoffs: IOption[];
  departments: IOption[];
}

export const FAKE_REPORT_DATA = [
  {
    id: '1000',
    module: 'Lịch họp',
    menu: 'Danh sách lịch họp',
    screen: 'Danh sách lịch họp',
    issueNumber: '3',
    status: 'Đang làm',
    details: [
      {
        id: '1000-0',
        screen: 'f230fh0g3',
        issueNumber: '3',
        status: 'Đang làm',
      },
    ],
  },
  {
    id: '1001',
    module: 'Lịch họp 22',
    menu: 'Danh sách lịch họp22',
    screen: 'Danh sách lịch họp22',
    issueNumber: '3',
    status: 'Đang làm',
    details: [
      {
        id: '1000-0',
        screen: 'f230fh0g3',
        issueNumber: '3',
        status: 'Đang làm',
      },
    ],
  },
];
