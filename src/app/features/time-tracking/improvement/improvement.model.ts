import { EMode } from 'src/app/contants/common.constant';
import { CommonService } from 'src/app/services';
import {
  IColumnHeaderConfigs,
  ID,
} from 'src/app/shared/interface/common.interface';
import {
  COMMON_COLUMN_FIELD,
  getHeaderColumnConfigsFactory,
  ICommonTimeTrackingRowData,
} from '../time-tracking.model';

export const IMPROVEMENT_FORM_GROUP_KEYS =
  CommonService.generateEnumFromInterface<IImprovementRowData>();

export const improvementNullableObj: IImprovementRowData = {
  selected: false,
  mode: EMode.VIEW,
  id: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  code: null,
  issueId: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: true,
  createdDate: null,
  updatedDate: null,
};

export const IMPROVEMENT_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<IImprovementRowData>(),
  COMMON_COLUMN_FIELD,
);

export interface IImprovementRowData extends ICommonTimeTrackingRowData {
  code: string;
  issueId: ID;
  isLunchBreak: boolean;
}

export const improvementHeaderColumnConfigs: IColumnHeaderConfigs[] =
  getHeaderColumnConfigsFactory(
    [
      {
        label: 'Mã improvement',
        field: IMPROVEMENT_COLUMN_FIELD.code,
        minWidth: 120,
      },
      {
        label: 'Tên vấn đề',
        field: IMPROVEMENT_COLUMN_FIELD.issueId,
        minWidth: 120,
      },
    ],
    [
      {
        label: 'Nghỉ trưa',
        field: IMPROVEMENT_COLUMN_FIELD.isLunchBreak,
        minWidth: 100,
      },
    ],
  );
