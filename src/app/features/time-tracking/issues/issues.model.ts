import { EMode } from 'src/app/contants/common.constant';
import { CommonService } from 'src/app/services';
import {
  IColumnHeaderConfigs,
  ID,
} from 'src/app/shared/interface/common.interface';

export const ISSUES_FORM_GROUP_KEYS =
  CommonService.generateEnumFromInterface<IIssuesRowData>();

export interface IIssuesRowData {
  mode: EMode;
  id: ID;
  moduleId: ID;
  menuId: ID;
  screenId: ID;
  featureId: ID;
  categoryId: ID;
  issueCode: string;
  issueName: string;
  issueContent: string;
  departmentMakeId: ID;
  employeeMakeId: ID;
  interruptionReasonId: ID;
  deadlineId: ID;
  statusId: ID;
  startTime: string;
  endTime: string;
  duration: number;
  createdDate: Date;
  updatedDate: Date;
}

export const nullableIssuesObj: IIssuesRowData = {
  mode: EMode.VIEW,
  id: null,
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
  statusId: null,
  startTime: null,
  endTime: null,
  duration: null,
  createdDate: null,
  updatedDate: null,
};

export const ISSUES_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<IIssuesRowData>(),
  {
    no: 'no',
    actions: 'actions',
  },
);

export const issuesHeaderColumnConfigs: IColumnHeaderConfigs[] = [
  {
    label: 'STT',
    field: ISSUES_COLUMN_FIELD.no,
    minWidth: 70,
  },
  {
    label: 'Module',
    field: ISSUES_COLUMN_FIELD.moduleId,
    minWidth: 200,
  },
  {
    label: 'Menu',
    field: ISSUES_COLUMN_FIELD.menuId,
    minWidth: 200,
  },
  {
    label: 'Màn hình',
    field: ISSUES_COLUMN_FIELD.screenId,
    minWidth: 200,
  },
  {
    label: 'Tính năng',
    field: ISSUES_COLUMN_FIELD.featureId,
    minWidth: 200,
  },
  {
    label: 'Phân loại',
    field: ISSUES_COLUMN_FIELD.categoryId,
    minWidth: 200,
  },
  {
    label: 'Mã vấn đề',
    field: ISSUES_COLUMN_FIELD.issueCode,
    minWidth: 120,
  },
  {
    label: 'Tên vấn đề',
    field: ISSUES_COLUMN_FIELD.issueContent,
    minWidth: 120,
  },
  {
    label: 'Nội dung vấn đề',
    field: ISSUES_COLUMN_FIELD.issueName,
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
    label: 'Thời gian bắt đầu',
    field: ISSUES_COLUMN_FIELD.startTime,
    minWidth: 200,
  },
  {
    label: 'Thời gian hoàn thành',
    field: ISSUES_COLUMN_FIELD.endTime,
    minWidth: 200,
  },
  {
    label: 'Thời lượng',
    field: ISSUES_COLUMN_FIELD.duration,
    minWidth: 60,
  },
  {
    label: 'Hành động',
    field: ISSUES_COLUMN_FIELD.actions,
    minWidth: 120,
  },
];
