import { CommonService } from '../../services';
import {
  IColumnHeaderConfigs,
  ID,
  IOption,
} from '../../shared/interface/common.interface';
import { EMode } from '../../contants/common.constant';
import { FormArray } from '@angular/forms';
import {
  ICategoryResponseDTO,
  IDayOffResponseDTO,
  IDepartmentResponseDTO,
  IEmployeeLevelResponseDTO,
  IEmployeeResponseDTO,
  IFeatureResponseDTO,
  IMenuResponseDTO,
  IModuleResponseDTO,
  IProjectResponseDTO,
  IScreenResponseDTO,
  ITabResponseDTO,
} from './time-tracking.dto';
import {
  ILogWorkRowData,
  LOG_WORK_COLUMN_FIELD,
} from './log-work/log-work.model';

export const LOCAL_STORAGE_KEY = 'defaultValue';

export interface IDefaultValueInLocalStorage {
  employeeLevelId: string;
  employeeId: string;
  projectId: string;
}

export const SELECT_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<ISelectFormGroup>();

export interface ISelectFormGroup {
  employeeLevelId: string;
  employeeId: string;
  projectId: string;
  dateRange: [Date, Date];
  quickDate: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
  formArray: FormArray;
}

export interface IFormGroup extends ILogWorkRowData {
  pic: string;
  dateRange: [Date, Date];
  project: string;
  quickDateRange: string;
}

// export const LOG_WORK_CHILD_FORM_GROUP_KEYS =
//   CommonService.generateEnumFromInterface<IFormGroup>();

export const commonHeaderColumn: IColumnHeaderConfigs[] = [
  {
    label: 'STT',
    field: LOG_WORK_COLUMN_FIELD.no,
    minWidth: 80,
  },
  {
    label: 'Module',
    field: LOG_WORK_COLUMN_FIELD.moduleId,
    minWidth: 200,
  },
  {
    label: 'Menu',
    field: LOG_WORK_COLUMN_FIELD.menuId,
    minWidth: 200,
  },
  {
    label: 'Màn hình',
    field: LOG_WORK_COLUMN_FIELD.screenId,
    minWidth: 200,
  },
  {
    label: 'Tính năng',
    field: LOG_WORK_COLUMN_FIELD.featureId,
    minWidth: 200,
  },
];

export const estimateHeaderColumns: IColumnHeaderConfigs[] = [
  ...commonHeaderColumn,
  {
    label: 'Phân loại',
    field: LOG_WORK_COLUMN_FIELD.categoryId,
    minWidth: 200,
  },
  {
    label: 'Thời gian bắt đầu',
    field: LOG_WORK_COLUMN_FIELD.startTime,
    minWidth: 120,
  },
  {
    label: 'Thời lượng',
    field: LOG_WORK_COLUMN_FIELD.duration,
    minWidth: 120,
  },
  {
    label: 'Thời gian hoàn thành',
    field: LOG_WORK_COLUMN_FIELD.endTime,
    minWidth: 120,
  },
  {
    label: 'Hành động',
    field: LOG_WORK_COLUMN_FIELD.actions,
    minWidth: 120,
  },
];

export const bugImprovementListHeaderColumns: IColumnHeaderConfigs[] = [
  ...commonHeaderColumn,
  {
    label: 'Phân loại',
    field: LOG_WORK_COLUMN_FIELD.categoryId,
    minWidth: 200,
  },
  {
    label: 'Mã bug & improvement',
    field: LOG_WORK_COLUMN_FIELD.workContent,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    field: LOG_WORK_COLUMN_FIELD.startTime,
    minWidth: 120,
  },
  {
    label: 'Thời gian hoàn thành',
    field: LOG_WORK_COLUMN_FIELD.endTime,
    minWidth: 120,
  },
  {
    label: 'Thời lượng',
    field: LOG_WORK_COLUMN_FIELD.duration,
    minWidth: 120,
  },
  {
    label: 'Hành động',
    field: LOG_WORK_COLUMN_FIELD.actions,
    minWidth: 120,
  },
];

export const nullableObj: any = {
  mode: EMode.VIEW,
  id: null,
  employeeLevelId: null,
  projectId: null,
  employeeId: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  tabId: null,
  categoryId: null,
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
  [s: string]: Record<ID, IOption[]>;
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

export interface IAllDropDownResponseDTO {
  employees: IEmployeeResponseDTO[];
  projects: IProjectResponseDTO[];
  modules: IModuleResponseDTO[];
  menus: IMenuResponseDTO[];
  screens: IScreenResponseDTO[];
  features: IFeatureResponseDTO[];
  employeeLevels: IEmployeeLevelResponseDTO[];
  departments: IDepartmentResponseDTO[];
  categories: ICategoryResponseDTO[];
  tabs: ITabResponseDTO[];
  dayOffs: IDayOffResponseDTO[];
}
