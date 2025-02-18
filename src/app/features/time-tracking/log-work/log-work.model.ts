import { EMode } from 'src/app/contants/common.constant';
import {
  IColumnHeaderConfigs,
  ID,
} from 'src/app/shared/interface/common.interface';
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
  moduleId: ID;
  menuId: ID;
  screenId: ID;
  featureId: ID;
  tabId: ID;
  categoryId: ID;
  workContent: string;
  issueId: ID;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: Date;
  updatedDate: Date;
  isLunchBreak: boolean;
}

export const nullableLogWorkObj: ILogWorkRowData = {
  mode: EMode.VIEW,
  id: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  tabId: null,
  categoryId: null,
  workContent: null,
  issueId: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: true,
  createdDate: null,
  updatedDate: null,
};

export const logWorkHeaderColumnConfigs: IColumnHeaderConfigs[] = [
  {
    label: 'STT',
    field: LOG_WORK_COLUMN_FIELD.no,
    minWidth: 70,
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
