import { EMode } from 'src/app/contants/common.constant';
import { CommonService } from 'src/app/services';
import {
  IColumnHeaderConfigs,
  ID,
} from 'src/app/shared/interface/common.interface';
import { IIssueResponseDTO } from './issues.dto.model';
import { getHeaderColumnConfigsFactory } from '../time-tracking.model';

export type IIssueCreateFormGroup = IIssueResponseDTO;

export interface IIssuesRowData extends IIssueResponseDTO {
  selected: boolean;
  mode: EMode;
  deadlineId: ID;
  note: string;
}

export const ISSUES_FORM_GROUP_KEYS =
  CommonService.generateEnumFromInterface<IIssuesRowData>();

export const issuesNullableObj: IIssuesRowData = {
  selected: false,
  mode: EMode.VIEW,
  id: Math.random(),
  employeeLevelId: null,
  employeeId: null,
  projectId: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  issueCode: null,
  issueName: null,
  issueContent: null,
  departmentMakeId: null,
  employeeMakeId: null,
  interruptionReasonId: null,
  deadlineId: null,
  isBlockProgress: null,
  statusId: null,
  note: null,
  startTime: null,
  endTime: null,
  duration: null,
  createdDate: null,
  updatedDate: null,
};

export const ISSUES_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<IIssuesRowData>(),
  {
    order: 'order',
    actions: 'actions',
  },
);

export const issuesHeaderColumnConfigs: IColumnHeaderConfigs[] =
  getHeaderColumnConfigsFactory([
    {
      label: 'Mã vấn đề',
      field: ISSUES_COLUMN_FIELD.issueCode,
      minWidth: 120,
    },
    {
      label: 'Tên vấn đề',
      field: ISSUES_COLUMN_FIELD.issueName,
      minWidth: 120,
    },
    {
      label: 'Nội dung vấn đề',
      field: ISSUES_COLUMN_FIELD.issueContent,
      minWidth: 120,
    },
    {
      label: 'Đơn vị gây ra',
      field: ISSUES_COLUMN_FIELD.departmentMakeId,
      minWidth: 200,
    },
    {
      label: 'Nhân viên gây ra',
      field: ISSUES_COLUMN_FIELD.employeeMakeId,
      minWidth: 200,
    },
    {
      label: 'Lý do gián đoạn',
      field: ISSUES_COLUMN_FIELD.interruptionReasonId,
      minWidth: 200,
    },
    {
      label: 'Mốc bàn giao',
      field: ISSUES_COLUMN_FIELD.deadlineId,
      minWidth: 200,
    },
    {
      label: 'Hiện trạng',
      field: ISSUES_COLUMN_FIELD.statusId,
      minWidth: 200,
    },
    {
      label: 'Ghi chú',
      field: ISSUES_COLUMN_FIELD.note,
      minWidth: 200,
    },
    {
      label: 'Block tiến độ',
      field: ISSUES_COLUMN_FIELD.isBlockProgress,
      minWidth: 200,
    },
  ]);
