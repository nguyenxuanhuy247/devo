import {
  Component,
  effect,
  Injector,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ETabName,
  IEmployeeResponseDTO,
  ITimeTrackingDoPostRequestDTO,
} from '../time-tracking.dto';
import { EApiMethod, EMode } from '../../../contants/common.constant';
import { CommonModule } from '@angular/common';
import { IColumnHeaderConfigs } from '../../../shared/interface/common.interface';
import {
  FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD,
  fixBugDoImprovementHeaderColumnConfigs,
  fixBugDoImprovementNullableObj,
  IFixBugDoImprovementRowData,
} from './fix-bug-do-improvement.model';
import { TableModule } from 'primeng/table';
import { ConvertIdToNamePipe, RoundPipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { FormBaseComponent } from '../../../shared';
import { TooltipModule } from 'primeng/tooltip';
import { Button } from 'primeng/button';
import { catchError, EMPTY, filter, finalize } from 'rxjs';
import { TimeTrackingApiService } from '../time-tracking-api.service';
import { message } from '../../../contants/api.contant';
import { IFixBugDoImprovementRequestDTO } from './fix-bug-do-improvement.dto.model';
import { TimeTrackingStore } from '../time-tracking.store';
import { getValue } from 'src/app/utils/function';
import * as Papa from 'papaparse';
import { BUG_IMPROVEMENT_FORM_GROUP_KEYS } from '../bug/bug.model';
import { DatePickerModule } from 'primeng/datepicker';
import { LibFormSelectComponent } from 'src/app/components';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  standalone: true,
  selector: 'app-fix-bug-do-improvement-1',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TagModule,
    RoundPipe,
    TooltipModule,
    Button,
    DatePickerModule,
    LibFormSelectComponent,
    TextareaModule,
    InputTextModule,
    RadioButtonModule,
    ConvertIdToNamePipe,
  ],
  templateUrl: './fix-bug-do-improvement.component.html',
  styleUrl: './fix-bug-do-improvement.component.scss',
})
export class FixBugDoImprovement1Component
  extends FormBaseComponent
  implements OnInit
{
  formGroupControl = input.required<FormGroup>();
  commonFormGroupKey = input.required<any>();
  projectFormControl = input<LibFormSelectComponent>();

  private timeTrackingStore = this.injector.get(TimeTrackingStore);

  protected readonly COLUMN_FIELD = FIX_BUG_DO_IMPROVEMENT_COLUMN_FIELD;
  protected readonly FORM_GROUP_KEYS = BUG_IMPROVEMENT_FORM_GROUP_KEYS;

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

  allDropdownData$ = this.timeTrackingStore.allDropdownData$;
  moduleDependentOptions$ = this.timeTrackingStore.moduleDependentOptions$;
  menuDependentOptions$ = this.timeTrackingStore.menuDependentOptions$;
  screenDependentOptions$ = this.timeTrackingStore.screenDependentOptions$;
  featureDependentOptions$ = this.timeTrackingStore.featureDependentOptions$;
  categoryOptions$ = this.timeTrackingStore.categoryOptions$;
  statusDependentTabOptions$ =
    this.timeTrackingStore.statusDependentTabOptions$;
  ETabName = ETabName;
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
    if (true) return;
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

  // convertListBugOrImprovementBeforeSave() {
  //   const commonValue: ISelectFormGroup = _.cloneDeep(
  //     this.formGroupControl().value,
  //   );
  //   delete commonValue[SELECT_FORM_GROUP_KEY.dateRange];
  //   delete commonValue[SELECT_FORM_GROUP_KEY.quickDate];
  //   delete commonValue[SELECT_FORM_GROUP_KEY.formArray];
  //   const allDropdownData = getValue(this.allDropdownData$);

  //   return this.tableData.map((rowData: IFixBugDoImprovementResponseDTO) => {
  //     let moduleId: ID;
  //     let menuId: ID;
  //     let screenId: ID;
  //     let featureId: ID;

  //     if (rowData.moduleName) {
  //       moduleId = allDropdownData.modules?.find(
  //         (item: IModuleResponseDTO) => item.moduleName === rowData.moduleName,
  //       )?.id;
  //     }
  //     if (rowData.menuName) {
  //       menuId = allDropdownData.menus?.find(
  //         (item: IMenuResponseDTO) => item.menuName === rowData.menuName,
  //       )?.id;
  //     }
  //     if (rowData.screenName) {
  //       screenId = allDropdownData.screens?.find(
  //         (item: IScreenResponseDTO) => item.screenName === rowData.screenName,
  //       )?.id;
  //     }
  //     if (rowData.featureName) {
  //       featureId = allDropdownData.features?.find(
  //         (item: IFeatureResponseDTO) =>
  //           item.featureName === rowData.featureName,
  //       )?.id;
  //     }

  //     return {
  //       employeeLevelId: commonValue.employeeLevelId,
  //       employeeId: commonValue.employeeId,
  //       projectId: commonValue.projectId,
  //       moduleId,
  //       menuId,
  //       screenId,
  //       featureId,
  //       code: rowData.code,
  //       startTime: rowData.startTime,
  //       endTime: rowData.endTime,
  //       duration: rowData.duration,
  //       createdDate: new Date(),
  //     } as IFixBugDoImprovementRequestDTO;
  //   });
  // }

  onBulkCreate() {
    // const listData: IFixBugDoImprovementRequestDTO[] =
    // this.convertListBugOrImprovementBeforeSave();

    this.isLoading.set(true);
    this.doPostRequestDTO.update((oldValue) => ({
      ...oldValue,
      method: EApiMethod.POST,
      // data: listData,
      data: [],
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

  csvData: any[] = [];
  headers: string[] = [];

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const csv = reader.result as string;
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const columnMapping: { [key: string]: string } = {
            Summary: 'name',
            'Issue key': 'code',
            'Issue Type': 'tabName',
            Status: 'Status',
            Reporter: 'tester',
            Created: 'createdDate',
          };

          this.csvData = result.data.map((row: any) => {
            const newRow: any = {};
            Object.keys(columnMapping).forEach((oldKey) => {
              if (Object.prototype.hasOwnProperty.call(row, oldKey)) {
                const newKey = columnMapping[oldKey];
                newRow[newKey] = row[oldKey];
              }
            });
            return newRow;
          });

          this.formArray.clear();
          this.csvData.forEach((rowData: any) => {
            const formGroup = this.formBuilder.group({
              ...fixBugDoImprovementNullableObj,
              mode: this.EMode.UPDATE,
              isLunchBreak: true,
              startTime: rowData.startTime ? new Date(rowData.startTime) : null,
              endTime: rowData.endTime ? new Date(rowData.endTime) : null,
              ...rowData,
            });
            this.formArray.push(formGroup);
          });

          console.log('formArray ', this.formArray);
          this.tableData = this.formArray.value;

          // this.headers = Object.values(columnMapping); // Lấy danh sách key mới
          console.log('result.data ', result.data);
          console.log('tableData ', this.tableData);
        },
      });
    };

    reader.readAsText(file);
  }

  formArray: FormArray = new FormArray([]);

  getFormControl(index: number, formControlName: string): FormControl {
    return this.formArray?.at(index)?.get(formControlName) as FormControl;
  }

  getFormGroup(index: number): FormGroup {
    return this.getFormGroupInFormArray(this.formArray, index);
  }

  onSetCurrentTimeForDatepicker(index: number, formControlName: string) {
    const control = this.getFormControl(index, formControlName);
    control.setValue(new Date());
  }

  ingredient: 'ALL' | 'BUG' | 'IMPROVEMENT' = 'ALL';
  protected readonly EMode = EMode;
  onContinueFix(rowData: any) {}
  onUpdate(rowData: any) {}
  onDelete(rowData: any) {}
}
