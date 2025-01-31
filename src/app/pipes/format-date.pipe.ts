import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { DATE_FORMAT } from '../contants/common.constant';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(
    value: string | Date,
    formatType: DATE_FORMAT = DATE_FORMAT.CUSTOM_DATE_TIME,
  ): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;

    // Chuyển đổi sang UTC
    const utcDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
    );

    return format(utcDate, formatType); // Định dạng theo yêu cầu
  }
}
