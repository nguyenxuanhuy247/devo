import { Component, Injector, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { FormBaseComponent } from '../../shared';
import { TimeTrackingService } from './time-tracking.service';
import { ITimeTrackingRequestDTO } from './time-tracking.dto';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-time-tracking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    InputNumberModule,
    TabViewModule,
    TableModule,
    PaginatorModule,
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
})
export class TimeTrackingComponent extends FormBaseComponent {
  columns = [
    'ID',
    'Dự án',
    'PIC',
    'Module',
    'Menu',
    'Màn hình',
    'Tính năng',
    'Phân loại',
    'Nội dung công việc',
    'Thời gian bắt đầu',
    'Thời gian hoàn thành',
    'Thời lượng',
    'Nghỉ trưa',
    'Giải quyết vấn đề',
    'Vấn đề gặp phải',
    'Ngày tạo',
  ];
  // Dữ liệu mẫu
  workData: any = [
    {
      ID: 1,
      'Dự án': 'Project A',
      PIC: 'Nguyễn Văn A',
      Module: 'Module X',
      Menu: 'Menu 1',
      'Màn hình': 'Screen A',
      'Tính năng': 'Feature 1',
      'Phân loại': 'Type A',
      'Nội dung công việc': 'Task 1',
      'Thời gian bắt đầu': '2024-01-01 08:00',
      'Thời gian hoàn thành': '2024-01-01 10:00',
      'Thời lượng': '2 giờ',
      'Nghỉ trưa': '30 phút',
      'Giải quyết vấn đề': 'None',
      'Vấn đề gặp phải': 'None',
      'Ngày tạo': '2024-01-01',
    },
  ];

  requestDTO = signal<ITimeTrackingRequestDTO>({
    page: 0,
    size: 10,
    tabIndex: 0,
  });

  pagination = {};

  timeTrackingService = this.injector.get(TimeTrackingService);
  total = 0;

  constructor(override injector: Injector) {
    super(injector);

    this.formGroup = this.formBuilder.group({
      id: null,
      project: null,
      pic: null,
      module: null,
      menu: null,
      screen: null,
      feature: null,
      category: null,
      workContent: null,
      startTime: null,
      endTime: null,
      duration: null,
      isLunchBreak: null,
      isSolveIssue: null,
      encounteredIssue: null,
      creationDate: null,
    });
  }

  onPageChange(event: any) {
    this.requestDTO.update((oldValue) => ({
      ...oldValue,
      page: event.first,
      size: event.rows,
    }));
  }

  submitForm() {
    this.timeTrackingService
      .getTableDataAsync({
        page: 0,
        size: 10,
        tabIndex: 0,
      })
      .subscribe((response) => {
        console.log('aaa', response);
        this.workData = response.data as any;
        this.total = response.totalElements;
      });
  }
}
