import { Directive, Injector, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TimeTrackingCalculateService } from '../features/time-tracking/time-tracking-calculate.service';
import { FORM_GROUP_KEYS } from '../features/time-tracking/time-tracking.model';
import { combineLatest, startWith } from 'rxjs';

@Directive({
  selector: '[appWorkDuration]',
  standalone: true, // Nếu dùng Angular 15+ và muốn directive hoạt động độc lập
})
export class WorkDurationDirective implements OnInit {
  @Input() formGroupControl!: FormGroup;
  @Input() formControl!: FormControl; // Trả về kết quả
  @Input() isLunchBreak: boolean = true; // Mặc định có nghỉ trưa

  timeTrackingCalculateService = this.injector.get(
    TimeTrackingCalculateService,
  );

  constructor(private injector: Injector) {}

  ngOnInit() {
    if (this.formGroupControl) {
      combineLatest(
        this.formGroupControl.get(FORM_GROUP_KEYS.startTime).valueChanges,
        this.formGroupControl.get(FORM_GROUP_KEYS.endTime).valueChanges,
        this.formGroupControl
          .get(FORM_GROUP_KEYS.isLunchBreak)
          .valueChanges.pipe(startWith(true)),
      ).subscribe(([startTime, endTime, isLunchBreak]) => {
        const duration = this.timeTrackingCalculateService.calculateWorkHours(
          startTime,
          endTime,
          isLunchBreak,
        );
        console.log('duration:', duration);
        this.formControl.setValue(duration.toFixed(2));
      });
    }
  }
}
