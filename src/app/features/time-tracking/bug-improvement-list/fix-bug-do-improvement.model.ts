import { IColumnHeaderConfigs } from '../../../shared/interface/common.interface';
import { CommonService } from '../../../services';
import { getHeaderColumnConfigsFactory } from '../time-tracking.model';

export const FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<IFixBugDoImprovementRowData>(),
  {
    no: 'no',
    actions: 'actions',
  },
);

export type IFixBugDoImprovementRowData = IBugImprovementRowData;

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

export const fixBugDoImprovementHeaderColumnConfigs: IColumnHeaderConfigs[] =
  getHeaderColumnConfigsFactory([
    {
      label: 'Mã bug & improvement',
      field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.code,
      minWidth: 120,
    },
    {
      label: 'Tên bug & improvement',
      field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.name,
      minWidth: 300,
    },
    {
      label: 'Hiện trạng',
      field: FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD.name,
      minWidth: 200,
    },
  ]);
