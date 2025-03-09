import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';
import { CommonService } from 'src/app/services';
import { COMMON_COLUMN_FIELD } from '../../time-tracking.model';
import { LOG_WORK_COLUMN_FIELD } from '../../log-work/log-work.model';
import { IImprovementResponseDTO } from '../../improvement/improvement.dto.model';

export const LOG_IMPROVEMENT_FORM_GROUP_KEY = Object.assign(
  CommonService.generateEnumFromInterface<IImprovementResponseDTO>(),
  {
    isLunchBreak: 'isLunchBreak',
  },
);

export const LOG_IMPROVEMENT_COLUMN_FIELD = Object.assign(
  CommonService.generateEnumFromInterface<IImprovementResponseDTO>(),
  {
    order: 'order',
    actions: 'actions',
    isLunchBreak: 'isLunchBreak',
  },
);

export const logImprovementHeaderColumnConfigs: IColumnHeaderConfigs[] = [
  {
    label: 'STT',
    field: COMMON_COLUMN_FIELD.order,
    minWidth: 80,
  },
  {
    label: 'Thời gian bắt đầu',
    field: LOG_IMPROVEMENT_COLUMN_FIELD.startTime,
    minWidth: 200,
  },
  {
    label: 'Thời gian hoàn thành',
    field: LOG_IMPROVEMENT_COLUMN_FIELD.endTime,
    minWidth: 200,
  },
  {
    label: 'Thời lượng',
    field: LOG_IMPROVEMENT_COLUMN_FIELD.duration,
    minWidth: 100,
  },
  {
    label: 'Nghỉ trưa',
    field: LOG_WORK_COLUMN_FIELD.isLunchBreak,
    minWidth: 120,
  },
  {
    label: 'Hành động',
    field: LOG_IMPROVEMENT_COLUMN_FIELD.actions,
    minWidth: 200,
  },
];
