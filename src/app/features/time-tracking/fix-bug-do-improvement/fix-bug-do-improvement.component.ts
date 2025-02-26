import {
  Component,
  effect,
  Injector,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ETabName,
  IEmployeeResponseDTO,
  IFeatureResponseDTO,
  IMenuResponseDTO,
  IModuleResponseDTO,
  IScreenResponseDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../time-tracking.dto';
import {
  ISelectFormGroup,
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
  fixBugDoImprovementNullableObj,
  IFixBugDoImprovementRowData,
} from './fix-bug-do-improvement.model';
import { TableModule } from 'primeng/table';
import { FormatDatePipe, RoundPipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { FormBaseComponent } from '../../../shared';
import { TooltipModule } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { catchError, EMPTY, filter, finalize } from 'rxjs';
import { TimeTrackingApiService } from '../time-tracking-api.service';
import { message } from '../../../contants/api.contant';
import * as _ from 'lodash';
import {
  IFixBugDoImprovementRequestDTO,
  IFixBugDoImprovementResponseDTO,
} from './fix-bug-do-improvement.dto.model';
import { LOG_WORK_COLUMN_FIELD } from '../log-work/log-work.model';
import { TimeTrackingStore } from '../time-tracking.store';
import { getValue } from 'src/app/utils/function';

@Component({
  standalone: true,
  selector: 'app-fix-bug-do-improvement',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
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

  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  allDropdownData$ = this.timeTrackingStore.allDropdownData$;

  protected readonly COLUMN_FIELD = LOG_WORK_COLUMN_FIELD;

  headerColumnConfigs: IColumnHeaderConfigs[] =
    fixBugDoImprovementHeaderColumnConfigs;

  tableData: IFixBugDoImprovementRowData[] = [];
  timeTrackingService = this.injector.get(TimeTrackingApiService);
  isLoading = signal(false);
  doPostRequestDTO = signal<
    ITimeTrackingDoPostRequestDTO<IFixBugDoImprovementRequestDTO>
  >({
    method: EApiMethod.POST,
    sheetName: ETabName.BUG,
    ids: null,
    data: null,
  });
  intervalId: any;
  selectedEmployee$ = this.timeTrackingStore.selectedEmployee$;

  constructor(override injector: Injector) {
    super(injector);

    effect(() => {
      if (getValue(this.selectedEmployee$)) {
        this.checkForFixBugAndImprovementUpdates();
        this.intervalId = setInterval(
          () => this.checkForFixBugAndImprovementUpdates(),
          36000,
        );
      }
    });
  }

  override ngOnInit() {
    super.ngOnInit();

    this.selectedEmployee$
      .pipe(filter((employee: IEmployeeResponseDTO) => !!employee))
      .subscribe((_) => {
        this.checkForFixBugAndImprovementUpdates();
        this.intervalId = setInterval(
          () => this.checkForFixBugAndImprovementUpdates(),
          36000,
        );
      });
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    clearInterval(this.intervalId);
  }

  checkForFixBugAndImprovementUpdates() {
    const currentEmployee = getValue(this.selectedEmployee$);
    if (!currentEmployee?.bugImprovementApi) return;

    this.timeTrackingStore.setLoading(true);
    this.timeTrackingService
      .getBugImprovementContinuousUpdate(currentEmployee.bugImprovementApi, {})
      .pipe(
        finalize(() => {
          this.timeTrackingStore.setLoading(false);
        }),
      )
      .subscribe((list) => {
        this.tableData = list?.map((rowData) => {
          return {
            ...fixBugDoImprovementNullableObj,
            ...rowData,
            createdDate: rowData.createdDate
              ? new Date(rowData.createdDate)
              : null,
          } as any;
        });

        this.totalDuration = this.tableData.reduce(
          (acc, rowData) => acc + rowData.duration,
          0,
        );

        this.warningWhenChangeChromeTab();
      });
  }

  totalDuration: number = 0;

  override warningWhenChangeChromeTab = () => {
    const isStartTimeTracking = this.tableData?.some(
      (item) => item.startTime && !item.endTime,
    );

    if (!isStartTimeTracking) {
      this.startBlinking();
    } else {
      this.clearBlinking();
    }
  };

  openGoogleSheets() {
    window.open(
      getValue(this.selectedEmployee$)?.bugImprovementSpreadsheet,
      '_blank',
    ); // Mở trong tab mới
  }

  convertListBugOrImprovementBeforeSave() {
    const commonValue: ISelectFormGroup = _.cloneDeep(
      this.formGroupControl().value,
    );
    delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
    delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
    delete commonValue[SELECT_FORM_GROUP_KEY.formArray];
    const allDropdownData = getValue(this.allDropdownData$);
    return this.tableData.map((rowData: IFixBugDoImprovementResponseDTO) => {
      let moduleId: ID;
      let menuId: ID;
      let screenId: ID;
      let featureId: ID;

      if (rowData.moduleName) {
        moduleId = allDropdownData.modules?.find(
          (item: IModuleResponseDTO) => item.moduleName === rowData.moduleName,
        )?.id;
      }
      if (rowData.menuName) {
        menuId = allDropdownData.menus?.find(
          (item: IMenuResponseDTO) => item.menuName === rowData.menuName,
        )?.id;
      }
      if (rowData.screenName) {
        screenId = allDropdownData.screens?.find(
          (item: IScreenResponseDTO) => item.screenName === rowData.screenName,
        )?.id;
      }
      if (rowData.featureName) {
        featureId = allDropdownData.features?.find(
          (item: IFeatureResponseDTO) =>
            item.featureName === rowData.featureName,
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
        code: rowData.code,
        startTime: rowData.startTime,
        endTime: rowData.endTime,
        duration: rowData.duration,
        createdDate: new Date(),
      } as IFixBugDoImprovementRequestDTO;
    });
  }

  onBulkCreate() {
    const listData: IFixBugDoImprovementRequestDTO[] =
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
