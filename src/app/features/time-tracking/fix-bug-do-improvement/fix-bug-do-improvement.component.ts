import {
  Component,
  effect,
  Injector,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IEmployeeResponseDTO,
  IFeatureResponseDTO,
  IMenuResponseDTO,
  IModuleResponseDTO,
  IScreenResponseDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../time-tracking.dto';
import {
  IAllDropDownResponseDTO,
  ISelectFormGroup,
  nullableObj,
  SELECT_FORM_GROUP_KEY,
} from '../time-tracking.model';
import { EApiMethod } from '../../../contants/common.constant';
import { CommonModule } from '@angular/common';
import {
  IColumnHeaderConfigs,
  ID,
} from '../../../shared/interface/common.interface';
import {
  fixBugDoImprovementHeaderColumnConfigs,
  IFixBugDoImprovementRowData,
} from './fix-bug-do-improvement.model';
import { TableModule } from 'primeng/table';
import { FormatDatePipe, RoundPipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { FormBaseComponent } from '../../../shared';
import { TooltipModule } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { catchError, EMPTY, finalize } from 'rxjs';
import { TimeTrackingApiService } from '../time-tracking-api.service';
import { message } from '../../../contants/api.contant';
import * as _ from 'lodash';
import { IFixBugDoImprovementResponseDTO } from './fix-bug-do-improvement.dto.model';
import { ILogWorkRequestDTO } from '../log-work/log-work.dto.model';
import { LOG_WORK_COLUMN_FIELD } from '../log-work/log-work.model';

@Component({
  standalone: true,
  selector: 'app-fix-bug-do-improvement',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    FormatDatePipe,
    TagModule,
    RoundPipe,
    TooltipModule,
    Button,
  ],
  templateUrl: './fix-bug-do-improvement.component.html',
  styleUrl: './fix-bug-do-improvement.component.scss',
})
export class FixBugDoImprovementComponent
  extends FormBaseComponent
  implements OnInit
{
  formGroupControl = input.required<FormGroup>();
  commonFormGroupKey = input.required<any>();
  currentEmployee = input.required<IEmployeeResponseDTO>();
  allDropdownData = input.required<IAllDropDownResponseDTO>();
  updateList = output<boolean>();
  protected readonly COLUMN_FIELD = LOG_WORK_COLUMN_FIELD;

  headerColumnConfigs: IColumnHeaderConfigs[] =
    fixBugDoImprovementHeaderColumnConfigs;

  tableData: IFixBugDoImprovementRowData[] = [];
  timeTrackingService = this.injector.get(TimeTrackingApiService);
  isLoading = signal(false);
  doPostRequestDTO = signal<ITimeTrackingDoPostRequestDTO<ILogWorkRequestDTO>>({
    method: EApiMethod.POST,
    ids: null,
    data: null,
  });
  intervalId: any;

  constructor(override injector: Injector) {
    super(injector);

    effect(() => {
      console.log('effect ', this.currentEmployee());
      if (this.currentEmployee()) {
        this.checkForFixBugAndImprovementUpdates();
        this.intervalId = setInterval(
          () => this.checkForFixBugAndImprovementUpdates(),
          36000,
        );
      }
    });
  }

  ngOnInit() {
    this.onDestroy$.subscribe(() => {
      clearInterval(this.intervalId);
      console.log('onDestroy$');
    });
  }

  checkForFixBugAndImprovementUpdates() {
    console.log('1111111 ', this.currentEmployee());
    if (!this.currentEmployee()?.bugImprovementApi) return;

    console.log('2222222 ', this.currentEmployee());
    this.isLoading.set(true);
    this.timeTrackingService
      .getBugImprovementContinuousUpdate(
        this.currentEmployee().bugImprovementApi,
        {},
      )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe((list) => {
        this.tableData = list?.map((rowData) => {
          return {
            ...nullableObj,
            ...rowData,
            startTime: rowData.startTime ? new Date(rowData.startTime) : null,
            endTime: rowData.endTime ? new Date(rowData.endTime) : null,
            createdDate: rowData.createdDate
              ? new Date(rowData.createdDate)
              : null,
          };
        });

        console.log('this.tableData = ', this.tableData);
        const isStartTimeTracking = this.tableData?.some(
          (item) => item.startTime && !item.endTime,
        );
        this.updateList.emit(isStartTimeTracking);
      });
  }

  openGoogleSheets() {
    window.open(this.currentEmployee().bugImprovementSpreadsheet, '_blank'); // Mở trong tab mới
  }

  convertListBugOrImprovementBeforeSave() {
    const commonValue: ISelectFormGroup = _.cloneDeep(
      this.formGroupControl().value,
    );
    delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
    delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
    delete commonValue[SELECT_FORM_GROUP_KEY.formArray];

    return this.tableData.map((rowData: IFixBugDoImprovementResponseDTO) => {
      let moduleId: ID;
      let menuId: ID;
      let screenId: ID;
      let featureId: ID;
      let tabId: ID;
      if (rowData.moduleName) {
        moduleId = this.allDropdownData().modules?.find(
          (item: IModuleResponseDTO) => item.moduleName === rowData.moduleName,
        )?.id;
      }
      if (rowData.menuName) {
        menuId = this.allDropdownData().menus?.find(
          (item: IMenuResponseDTO) => item.menuName === rowData.menuName,
        )?.id;
      }
      if (rowData.screenName) {
        screenId = this.allDropdownData().screens?.find(
          (item: IScreenResponseDTO) => item.screenName === rowData.screenName,
        )?.id;
      }
      if (rowData.featureName) {
        featureId = this.allDropdownData().features?.find(
          (item: IFeatureResponseDTO) =>
            item.featureName === rowData.featureName,
        )?.id;
      }
      if (rowData.tabName) {
        tabId = this.allDropdownData().tabs?.find(
          (item: any) => item.tabName === rowData.tabName,
        )?.id;
      }
      return {
        employeeLevelId: commonValue.employeeLevelId,
        employeeId: commonValue.employeeId,
        projectId: commonValue.projectId,
        moduleId,
        menuId,
        screenId,
        featureId,
        tabId,
        workContent: rowData.workContent,
        startTime: rowData.startTime,
        endTime: rowData.endTime,
        duration: rowData.duration,
        createdDate: new Date(),
      } as ILogWorkRequestDTO;
    });
  }

  onBulkCreate() {
    const listData: ILogWorkRequestDTO[] =
      this.convertListBugOrImprovementBeforeSave();

    this.isLoading.set(true);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      data: listData,
    }));

    this.timeTrackingService
      .createItemAsync(this.doPostRequestDTO())
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
          this.isLoading.set(false);
        }),
      )
      .subscribe((res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: res?.message,
        });

        this.onDeleteLogTimeFixBugSheets();
      });
  }

  // Xóa thời gian bắt đầu và kết thúc ở Trang tính fix bug
  onDeleteLogTimeFixBugSheets() {
    this.timeTrackingService
      .deleteLogTimeInFixBugSheetAsync()
      .subscribe((res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: res?.message,
        });
      });
  }
}
