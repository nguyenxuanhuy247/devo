import { EMode } from 'src/app/contants/common.constant';
import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';
import { CommonService } from 'src/app/services';
import {
  COMMON_COLUMN_FIELD,
  getHeaderColumnConfigsFactory,
  ICommonTimeTrackingRowData,
} from '../time-tracking.model';

export const LOG_WORK_CHILD_FORM_GROUP_KEYS =
  CommonService.generateEnumFromInterface<ILogWorkRowData>();

export const LOG_WORK_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<ILogWorkRowData>(),
  COMMON_COLUMN_FIELD,
);

export interface ILogWorkRowData extends ICommonTimeTrackingRowData {
  workContent: string;
  // issueId: ID;
  isLunchBreak: boolean;
}

export const logWorkNullableObj: ILogWorkRowData = {
  mode: EMode.VIEW,
  id: null,
  moduleId: null,
  menuId: null,
  screenId: null,
  featureId: null,
  categoryId: null,
  workContent: null,
  startTime: null,
  endTime: null,
  duration: null,
  isLunchBreak: true,
  createdDate: null,
  updatedDate: null,
};

export const logWorkHeaderColumnConfigs: IColumnHeaderConfigs[] =
  getHeaderColumnConfigsFactory(
    [
      {
        label: 'Nội dung công việc',
        field: LOG_WORK_COLUMN_FIELD.workContent,
        minWidth: 120,
      },
    ],
    [
      {
        label: 'Nghỉ trưa',
        field: LOG_WORK_COLUMN_FIELD.isLunchBreak,
        minWidth: 120,
      },
    ],
  );
