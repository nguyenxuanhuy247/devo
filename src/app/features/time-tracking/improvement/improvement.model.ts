import { EMode } from 'src/app/contants/common.constant';
import { CommonService } from 'src/app/services';
import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';
import { getHeaderColumnConfigsFactory } from '../time-tracking.model';
import { IImprovementResponseDTO } from './improvement.dto.model';

export const IMPROVEMENT_FORM_GROUP_KEY =
  CommonService.generateEnumFromInterface<IImprovementRowData>();

export const improvementNullableObj: IImprovementRowData = {
  selected: false,
  mode: EMode.VIEW,
  id: null,
  employeeLevelId: null,
  employeeId: null,
  projectId: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  code: null,
  name: null,
  note: null,
  statusId: null,
  issueId: null,
  deadlineId: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: true,
  createdDate: null,
  updatedDate: null,
};

export const IMPROVEMENT_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<IImprovementRowData>(),
  {
    order: 'order',
    actions: 'actions',
  },
);

export interface IImprovementRowData extends IImprovementResponseDTO {
  mode: EMode;
  selected: boolean;
  name: string;
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
        label: 'Tên improvement',
        field: IMPROVEMENT_COLUMN_FIELD.name,
        minWidth: 300,
      },
      {
        label: 'Hiện trạng',
        field: IMPROVEMENT_COLUMN_FIELD.statusId,
        minWidth: 200,
      },
      {
        label: 'Ghi chú',
        field: IMPROVEMENT_COLUMN_FIELD.note,
        minWidth: 300,
      },
      {
        label: 'Tên vấn đề',
        field: IMPROVEMENT_COLUMN_FIELD.issueId,
        minWidth: 300,
      },
      {
        label: 'Mốc bàn giao',
        field: IMPROVEMENT_COLUMN_FIELD.deadlineId,
        minWidth: 240,
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
