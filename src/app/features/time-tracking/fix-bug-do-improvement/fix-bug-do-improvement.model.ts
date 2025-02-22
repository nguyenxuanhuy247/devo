import { IColumnHeaderConfigs } from '../../../shared/interface/common.interface';
import { CommonService } from '../../../services';
import { IFixBugDoImprovementResponseDTO } from './fix-bug-do-improvement.dto.model';

export const FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD =
  CommonService.generateEnumFromInterface<IFixBugDoImprovementRowData>();

export interface IFixBugDoImprovementRowData
  extends IFixBugDoImprovementResponseDTO {
  no: number;
}

export const fixBugDoImprovementNullableObj: IFixBugDoImprovementRowData = {
  no: 0,
  moduleName: '',
  menuName: '',
  screenName: '',
  featureName: '',
  tabName: '',
  workContent: '',
  bugName: '',
  startTime: '',
  endTime: '',
  duration: 0,
  status: '',
  notes: '',
  createdDate: '',
};

export const fixBugDoImprovementHeaderColumnConfigs: IColumnHeaderConfigs[] = [
  {
    label: 'STT',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.no,
    minWidth: 70,
  },
  {
    label: 'Module',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.moduleName,
    minWidth: 200,
  },
  {
    label: 'Menu',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.menuName,
    minWidth: 200,
  },
  {
    label: 'Màn hình',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.screenName,
    minWidth: 200,
  },
  {
    label: 'Tính năng',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.featureName,
    minWidth: 200,
  },
  {
    label: 'Phân loại',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.tabName,
    minWidth: 200,
  },
  {
    label: 'Mã bug & improvement',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.workContent,
    minWidth: 120,
  },
  {
    label: 'Tên bug & improvement',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.bugName,
    minWidth: 120,
  },
  {
    label: 'Thời gian bắt đầu',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.startTime,
    minWidth: 200,
  },
  {
    label: 'Thời gian hoàn thành',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.endTime,
    minWidth: 200,
  },
  {
    label: 'Thời lượng',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.duration,
    minWidth: 120,
  },
];
