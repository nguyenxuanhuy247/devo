import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingCalculateService {
  constructor() {}

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
}
