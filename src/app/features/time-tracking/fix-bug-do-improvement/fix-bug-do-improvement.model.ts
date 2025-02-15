import { IColumnHeaderConfigs } from '../../../shared/interface/common.interface';
import { COLUMN_FIELD } from '../time-tracking.model';

export const fixBugDoImprovementHeaderColumnConfigs: IColumnHeaderConfigs[] = [
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
  ,
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

export interface IFixBugDoImprovementRowData {
  moduleId: string;
  menuId: string;
  screenId: string;
  featureId: string;
  categoryId: string;
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
}
