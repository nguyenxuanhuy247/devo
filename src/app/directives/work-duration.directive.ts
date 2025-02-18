import { Directive, Injector, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TimeTrackingCalculateService } from '../features/time-tracking/time-tracking-calculate.service';
import { LOG_WORK_CHILD_FORM_GROUP_KEYS } from '../features/time-tracking/time-tracking.model';
import { combineLatest, startWith } from 'rxjs';

@Directive({
  selector: '[appWorkDuration]',
  standalone: true, // Nếu dùng Angular 15+ và muốn directive hoạt động độc lập
})
export class WorkDurationDirective implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() formControlName!: string; // Trả về kết quả
  @Input() isLunchBreak: boolean = true; // Mặc định có nghỉ trưa

  timeTrackingCalculateService = this.injector.get(
    TimeTrackingCalculateService,
  );

  constructor(private injector: Injector) {}

  ngOnInit() {
    if (this.formGroup) {
      combineLatest(
        this.formGroup.get(LOG_WORK_CHILD_FORM_GROUP_KEYS.startTime)
          .valueChanges,
        this.formGroup.get(LOG_WORK_CHILD_FORM_GROUP_KEYS.endTime).valueChanges,
        this.formGroup
          .get(LOG_WORK_CHILD_FORM_GROUP_KEYS.isLunchBreak)
          .valueChanges.pipe(startWith(true)),
      ).subscribe(([startTime, endTime, isLunchBreak]) => {
        const duration = this.timeTrackingCalculateService.calculateWorkHours(
          startTime,
          endTime,
          isLunchBreak,
        );

        if (startTime && endTime) {
          this.formGroup
            .get(this.formControlName)
            .setValue(duration.toFixed(2));
        }
      });
    }
  }
}
