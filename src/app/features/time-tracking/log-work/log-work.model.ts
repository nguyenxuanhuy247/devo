import { EMode } from 'src/app/contants/common.constant';
import {
  IColumnHeaderConfigs,
  ID,
} from 'src/app/shared/interface/common.interface';
import { commonHeaderColumn } from '../time-tracking.model';
import { CommonService } from 'src/app/services';

export const LOG_WORK_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<ILogWorkRowData>(),
  {
    no: 'no',
    actions: 'actions',
  },
);

export interface ILogWorkRowData {
  mode: EMode;
  id: ID;
  employeeLevelId: string;
  employeeId: string;
  projectId: string;
  moduleId: string;
  menuId: string;
  screenId: string;
  featureId: string;
  tabId: string;
  categoryId: string;
  workContent: string;
  issueId: string;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: Date;
  updatedDate: Date;
  isLunchBreak: boolean;
}

export const logWorkHeaderColumnConfigs: IColumnHeaderConfigs[] = [
  ...commonHeaderColumn,
  {
    label: 'Phân loại',
    field: LOG_WORK_COLUMN_FIELD.categoryId,
    minWidth: 200,
  },
  {
    label: 'Nội dung công việc',
    field: LOG_WORK_COLUMN_FIELD.workContent,
    minWidth: 120,
  },
  {
    label: 'Vấn đề gặp phải',
    field: LOG_WORK_COLUMN_FIELD.issueId,
    minWidth: 200,
  },
  {
    label: 'Thời gian bắt đầu',
    field: LOG_WORK_COLUMN_FIELD.startTime,
    minWidth: 200,
  },
  {
    label: 'Thời gian hoàn thành',
    field: LOG_WORK_COLUMN_FIELD.endTime,
    minWidth: 200,
  },
  {
    label: 'Thời lượng',
    field: LOG_WORK_COLUMN_FIELD.duration,
    minWidth: 60,
  },
  {
    label: 'Nghỉ trưa',
    field: LOG_WORK_COLUMN_FIELD.isLunchBreak,
    minWidth: 60,
  },
  {
    label: 'Hành động',
    field: LOG_WORK_COLUMN_FIELD.actions,
    minWidth: 120,
  },
];
