import { Directive, Injector, Input, OnInit } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { TimeTrackingCalculateService } from '../features/time-tracking/time-tracking-calculate.service';
import { distinctUntilChanged, map } from 'rxjs';

@Directive({
  selector: '[appWorkDuration]',
  standalone: true, // Nếu dùng Angular 15+ và muốn directive hoạt động độc lập
})
export class WorkDurationDirective implements OnInit {
  @Input() formControlName!: string; // Trả về kết quả

  formGroup!: FormGroup;
  timeTrackingCalculateService = this.injector.get(
    TimeTrackingCalculateService,
  );

  private controlContainer = this.injector.get(ControlContainer);

  constructor(private injector: Injector) {}

  ngOnInit() {
    this.formGroup = this.controlContainer.control as FormGroup;
    if (this.formGroup) {
      this.formGroup.valueChanges
        .pipe(
          // Chỉ lấy giá trị của 3 trường cần theo dõi
          map((value) => ({
            startTime: value.startTime,
            endTime: value.endTime,
            isLunchBreak: value.isLunchBreak,
          })),
          // Loại bỏ các giá trị trùng lặp liên tiếp
          distinctUntilChanged(
            (prev, curr) =>
              prev.startTime === curr.startTime &&
              prev.endTime === curr.endTime &&
              prev.isLunchBreak === curr.isLunchBreak,
          ),
        )
        .subscribe(({ startTime, endTime, isLunchBreak }) => {
          const duration = this.timeTrackingCalculateService.calculateWorkHours(
            startTime,
            endTime,
            isLunchBreak,
          );

          this.formGroup
            .get(this.formControlName)
            .setValue(duration > 0 ? duration.toFixed(2) : 0);
        });
    }
  }
}
