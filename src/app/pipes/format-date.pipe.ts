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
    if (!value) return value as string;

    // Kiểm tra nếu value là chuỗi ISO 8601 hợp lệ
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    if (typeof value === 'string' && isoRegex.test(value)) {
      try {
        return format(new Date(value), formatType); // Định dạng thành "DD/MM HH:mm"
      } catch (error) {
        return value; // Trả về giá trị gốc nếu có lỗi
      }
    }

    // Kiểm tra nếu value là một local Date string (VD: "Sat Feb 22 2025 15:28:08 GMT+0700 (Giờ Đông Dương)")
    const parsedDate = Date.parse(value as string);
    if (!isNaN(parsedDate)) {
      try {
        return format(new Date(parsedDate), formatType);
      } catch (error) {
        return value as string;
      }
    }

    return value as string; // Trả về giá trị gốc nếu không đúng định dạng
  }
}
