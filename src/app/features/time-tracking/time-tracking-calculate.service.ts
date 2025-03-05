import { Injectable } from '@angular/core';
import { TimeTrackingStore } from './time-tracking.store';
import { getValue } from 'src/app/utils/function';

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingCalculateService {
  allDropdownData$ = this.timeTrackingStore.allDropdownData$;

  constructor(private timeTrackingStore: TimeTrackingStore) {}

  calculateWorkHours(
    startDate: string | Date,
    endDate: string | Date,
    isLunchBreak: boolean = true,
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Tính số mili giây giữa hai thời điểm
    const differenceMs = end.getTime() - start.getTime();

    // Chuyển đổi mili giây thành giờ
    let totalHours = differenceMs / (1000 * 60 * 60);

    if (isLunchBreak) {
      // Giờ bắt đầu và kết thúc nghỉ trưa
      const lunchStart = new Date(start);
      lunchStart.setHours(12, 0, 0, 0); // 12:00 PM
      const lunchEnd = new Date(start);
      lunchEnd.setHours(13, 30, 0, 0); // 1:30 PM

      // Kiểm tra xem khoảng thời gian làm việc có bao gồm giờ nghỉ trưa không
      if (start < lunchEnd && end > lunchStart) {
        // Tính toán thời gian nghỉ trưa chồng lấn
        const overlapStart = start < lunchStart ? lunchStart : start;
        const overlapEnd = end > lunchEnd ? lunchEnd : end;
        const lunchDurationMs = overlapEnd.getTime() - overlapStart.getTime();

        // Trừ thời gian nghỉ trưa
        totalHours -= lunchDurationMs / (1000 * 60 * 60);
      }
    }

    return totalHours;
  }

  calculateBusinessHours(startDate: string | Date): number {
    if (!startDate) return null;
    const start = new Date(startDate);
    const now = new Date(); // Lấy thời gian hiện tại
    let totalHours = 0;

    const holidayList: Date[] = getValue(this.allDropdownData$)?.dayoffs?.map(
      (dayoff) => new Date(dayoff.dayOff),
    );

    const isHoliday = (date: Date) =>
      holidayList?.some(
        (holiday) => holiday.toISOString() === date.toDateString(),
      );

    const isWeekend = (date: Date) =>
      date.getDay() === 0 || date.getDay() === 6; // 0: Chủ nhật, 6: Thứ bảy

    const businessHours = {
      start: 8,
      lunchStart: 12,
      lunchEnd: 13.5,
      end: 17.5,
    };

    const current = new Date(start);

    while (current < now) {
      // Bỏ qua Thứ 7, Chủ Nhật và ngày nghỉ lễ
      if (!isWeekend(current) && !isHoliday(current)) {
        const startOfDay = new Date(current);
        startOfDay.setHours(businessHours.start, 0, 0, 0);

        const lunchStart = new Date(current);
        lunchStart.setHours(businessHours.lunchStart, 0, 0, 0);

        const lunchEnd = new Date(current);
        lunchEnd.setHours(businessHours.lunchEnd, 0, 0, 0);

        const endOfDay = new Date(current);
        endOfDay.setHours(businessHours.end, 0, 0, 0);

        if (current.toDateString() === now.toDateString()) {
          // Nếu là ngày hiện tại, chỉ tính đến giờ hiện tại
          if (current < lunchStart) {
            totalHours += Math.max(
              0,
              Math.min(
                (now.getTime() - current.getTime()) / 3600000,
                businessHours.lunchStart - current.getHours(),
              ),
            );
          }
          if (current < endOfDay && now > lunchEnd) {
            totalHours += Math.max(
              0,
              Math.min(
                (now.getTime() - lunchEnd.getTime()) / 3600000,
                businessHours.end - businessHours.lunchEnd,
              ),
            );
          }
        } else {
          // Nếu là ngày làm việc bình thường, tính đủ 8 giờ làm việc
          totalHours += 8;
        }
      }

      // Chuyển sang ngày tiếp theo
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
    }

    return totalHours;
  }
}
