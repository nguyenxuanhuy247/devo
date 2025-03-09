import { Component, computed, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { LogWorkComponent } from '../../log-work/log-work.component';
import { IIssuesRowData } from '../issues.model';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { WorkDurationDirective } from '../../../../directives';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import {
  ICommonRowData,
  ISelectFormGroup,
  SELECT_FORM_GROUP_KEY,
} from '../../time-tracking.model';
import { IImprovementRowData } from '../../improvement/improvement.model';
import { EApiMethod, EMode } from '../../../../contants/common.constant';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  switchMap,
} from 'rxjs';
import { ESheetName } from '../../time-tracking.dto';
import {
  IColumnHeaderConfigs,
  ID,
} from '../../../../shared/interface/common.interface';
import { logImprovementHeaderColumnConfigs } from './log-improvement.model';
import { endOfDay, startOfDay } from 'date-fns';
import { message } from '../../../../contants/api.contant';
import { ILogWorkResponseDTO } from '../../log-work/log-work.dto.model';

@Component({
  selector: 'app-log-improvement',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    TagModule,
    WorkDurationDirective,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: 'log-improvement.component.html',
  styleUrl: 'log-improvement.component.scss',
  host: {
    style: 'display: block; min-height: 100%',
  },
})
export class LogImprovementComponent
  extends LogWorkComponent
  implements OnInit
{
  issueRowData = input<IIssuesRowData>(null);
  issueCommonData = computed<ICommonRowData>(() => {
    return {
      employeeLevelId: this.issueRowData()?.employeeLevelId,
      employeeId: this.issueRowData()?.employeeId,
      projectId: this.issueRowData()?.projectId,
      moduleId: this.issueRowData()?.moduleId,
      menuId: this.issueRowData()?.menuId,
      screenId: this.issueRowData()?.screenId,
      featureId: this.issueRowData()?.featureId,
      categoryId: this.issueRowData()?.categoryId,
      issueId: this.issueRowData()?.id,
      deadlineId: this.issueRowData()?.deadlineId,
    };
  });
  issueId = computed<ID>(() => {
    return this.issueRowData()?.id;
  });
  logImprovementIssueDoGetRequestDTO = computed(() => {
    return this.issueId()
      ? {
          issueId: this.issueId(),
          startTime: startOfDay(new Date('1900-01-01')).toISOString(),
          endTime: endOfDay(new Date('9999-12-31')).toISOString(),
        }
      : {};
  });

  override sheetName = signal<ESheetName>(ESheetName.IMPROVEMENT);
  override headerColumnConfigs: IColumnHeaderConfigs[] =
    logImprovementHeaderColumnConfigs;

  override ngOnInit() {
    super.ngOnInit();
    this.createFormGroup = this.formBuilder.group({
      startTime: null,
      endTime: null,
      duration: null,
      isLunchBreak: true,
    });
    console.log('ngOnInit', this.createFormGroup.value);
  }

  override initSubscriptions() {
    this.subscription.add(
      this.getTableDataApiRequest$
        .pipe(
          debounceTime(300), // Giảm số lần gọi API nếu nhiều yêu cầu liên tiếp
          switchMap(() => {
            this.timeTrackingStore.setLoading(true);
            this.doGetRequestDTO.update((oldValue: any) => {
              const formGroupValue =
                this.formGroupControl.getRawValue() as ISelectFormGroup;

              return {
                ...oldValue,
                employeeLevelId: formGroupValue.employeeLevelId,
                employeeId: formGroupValue.employeeId,
                projectId: formGroupValue.projectId,
                startTime: formGroupValue.dateRange[0].toISOString(),
                endTime: formGroupValue.dateRange[1].toISOString(),
                sheetName: this.sheetName(),
                ...this.logImprovementIssueDoGetRequestDTO(),
              };
            });

            return this.timeTrackingService
              .getListAsync(this.doGetRequestDTO())
              .pipe(
                catchError(() => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Thất bại',
                    detail: message.serverError,
                  });
                  return EMPTY;
                }),
                finalize(() => {
                  this.timeTrackingStore.setLoading(false);
                }),
              );
          }),
        )
        .subscribe((listData: ILogWorkResponseDTO[]) => {
          this.mode.set(EMode.VIEW);
          this.formArray.clear();

          listData.forEach((rowData) => {
            const formGroup = this.formBuilder.group({
              ...rowData,
              mode: EMode.VIEW,
              isLunchBreak: true,
              startTime: rowData.startTime ? new Date(rowData.startTime) : null,
              endTime: rowData.endTime ? new Date(rowData.endTime) : null,
            });
            this.formArray.push(formGroup);
          });
        }),
    );

    this.subscription.add(
      this.getControlValueChanges(
        SELECT_FORM_GROUP_KEY.dateRange,
        this.formGroupControl,
      )
        .pipe(filter((dataRange) => !!dataRange))
        .subscribe(() => {
          // Sau khi thiết lập các giá trị chung như Level, Nhân viên, dự án, thời gian mới gọi API lấy danh sách
          this.callAPIGetTableData();
        }),
    );
  }

  override onSaveCreate() {
    const data: IImprovementRowData = {
      ...this.getCommonValue(),
      ...this.issueCommonData(),
      ...this.createFormGroup.value,
      createdDate: new Date(),
      updatedDate: null,
    };

    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      sheetName: this.sheetName(),
      data: [data],
      ...this.logImprovementIssueDoGetRequestDTO(),
    }));

    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .createItemAsync(this.doPostRequestDTO())
      .pipe(
        catchError(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: `Thêm mới Log work thất bại, kiểm tra hàm onSaveCreate`,
          });
          this.timeTrackingStore.setLoading(false);
          return EMPTY;
        }),
      )
      .subscribe((res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: res?.message,
        });

        this.onResetCreateForm();
        this.callAPIGetTableData();
      });
  }

  override callAPIGetTableData(): void {
    console.log('aaaaaaaaaa');
    this.getTableDataApiRequest$.next();
  }

  onReloadTableData() {
    this.callAPIGetTableData();
  }
}
