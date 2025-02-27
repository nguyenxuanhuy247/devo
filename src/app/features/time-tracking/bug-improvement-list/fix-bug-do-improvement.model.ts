import { IColumnHeaderConfigs } from '../../../shared/interface/common.interface';
import { CommonService } from '../../../services';

export const FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD =
  CommonService.generateEnumFromInterface<IFixBugDoImprovementRowData>();

export interface IFixBugDoImprovementRowData extends IBugImprovementRowData {
  no: number;
}

export interface IBugImprovementRowData {
  moduleId: null;
  menuId: null;
  screenId: null;
  featureId: null;
  categoryId: null;
  tabName: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  notes: string;
  createdDate: string;
}

export const fixBugDoImprovementNullableObj: IFixBugDoImprovementRowData = {
  no: 0,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  tabName: '',
  code: '',
  name: '',
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
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.moduleId,
    minWidth: 200,
  },
  {
    label: 'Menu',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.menuId,
    minWidth: 200,
  },
  {
    label: 'Màn hình',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.screenId,
    minWidth: 200,
  },
  {
    label: 'Tính năng',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.featureId,
    minWidth: 200,
  },
  {
    label: 'Phân loại',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.tabName,
    minWidth: 200,
  },
  {
    label: 'Mã bug & improvement',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.code,
    minWidth: 120,
  },
  {
    label: 'Tên bug & improvement',
    field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.name,
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
