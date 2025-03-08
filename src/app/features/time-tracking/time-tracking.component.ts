import { Component, Injector, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { FormBaseComponent } from '../../shared';
import { ETabName } from './time-tracking.dto';
import { PaginatorModule } from 'primeng/paginator';
import { combineLatest, filter, Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import {
  EStatsBy,
  IDefaultValueInLocalStorage,
  ITabComponent,
  LOCAL_STORAGE_KEY,
  SELECT_FORM_GROUP_KEY,
} from './time-tracking.model';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { EMode } from '../../contants/common.constant';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ID } from '../../shared/interface/common.interface';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LibFormSelectComponent } from 'src/app/components';
import { TagModule } from 'primeng/tag';
import { LogWorkComponent } from './log-work/log-work.component';
import { TimeTrackingStore } from './time-tracking.store';
import { getValue } from 'src/app/utils/function';
import { IssuesComponent } from './issues/issues.component';
import { BugComponent } from './bug/bug.component';
import { ImprovementComponent } from './improvement/improvement.component';

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
    TableModule,
    PaginatorModule,
    SelectModule,
    DatePickerModule,
    TabsModule,
    TooltipModule,
    SplitButtonModule,
    ProgressSpinnerModule,
    BlockUIModule,
    TextareaModule,
    DatePickerModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    RadioButtonModule,
    ConfirmDialogModule,
    LibFormSelectComponent,
    TagModule,
    LogWorkComponent,
    IssuesComponent,
    BugComponent,
    ImprovementComponent,
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
  host: {
    class: 'block h-screen',
  },
})
export class TimeTrackingComponent extends FormBaseComponent implements OnInit {
  activeTab = signal<ETabName>(ETabName.ISSUE);
  subscription: Subscription = new Subscription();
  SELECT_FORM_GROUP_KEY = SELECT_FORM_GROUP_KEY;
  ETabName = ETabName;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  EMode = EMode;
  formArray!: FormArray;

  private timeTrackingStore = this.injector.get(TimeTrackingStore);

  allDropdownData$ = this.timeTrackingStore.allDropdownData$;
  employeeLevelOptions$ = this.timeTrackingStore.employeeLevelOptions$;
  employeeDependentOptions$ = this.timeTrackingStore.employeeDependentOptions$;
  projectDependentOptions$ = this.timeTrackingStore.projectDependentOptions$;

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();

    this.formGroup = this.formBuilder.group({
      [SELECT_FORM_GROUP_KEY.employeeLevelId]: null,
      [SELECT_FORM_GROUP_KEY.employeeId]: null,
      [SELECT_FORM_GROUP_KEY.projectId]: null,
      [SELECT_FORM_GROUP_KEY.dateRange]: null,
      [SELECT_FORM_GROUP_KEY.quickDate]: null,
      [SELECT_FORM_GROUP_KEY.formArray]: this.formBuilder.array([]),
    });

    this.formArray = this.formGroup.get('formArray') as FormArray;

    this.getControl(SELECT_FORM_GROUP_KEY.dateRange).disable();

    // Phải gọi trước khi khởi tạo giá trị cho dateRange
    this.initSubscriptions();

    // Thiết lập giá trị ban đầu cho "Thống kê bởi"
    if (this.activeTab() === ETabName.ISSUE) {
      this.getControl(SELECT_FORM_GROUP_KEY.quickDate).setValue(EStatsBy.ALL);
    } else {
      this.getControl(SELECT_FORM_GROUP_KEY.quickDate).setValue(EStatsBy.TODAY);
    }

    this.timeTrackingStore.getAllDropdownData();
  }

  initSubscriptions() {
    this.onDestroy$.subscribe(() => {
      this.subscription.unsubscribe();
    });

    this.subscription.add(
      combineLatest(
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.employeeLevelId),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.employeeId),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.projectId),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.dateRange).pipe(
          filter((range) => range.every((date: Date) => !!date)),
        ),
      ).subscribe(() => {
        this.tabComponent?.callAPIGetTableData();
      }),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.projectId).subscribe(
        () => {
          // Lưu những thông tin chung vào store và local storage
          const employeeId = this.getControlValue(
            SELECT_FORM_GROUP_KEY.employeeId,
          );
          const selectedEmployee = getValue(
            this.allDropdownData$,
          )?.employees.find((employee) => employee.id === employeeId);

          const commonValue = {
            employeeLevelId: this.getControlValue(
              SELECT_FORM_GROUP_KEY.employeeLevelId,
            ),
            employeeId: this.getControlValue(SELECT_FORM_GROUP_KEY.employeeId),
            employee: selectedEmployee,
            projectId: this.getControlValue(SELECT_FORM_GROUP_KEY.projectId),
          };

          this.timeTrackingStore.setSharedData(commonValue);
        },
      ),
    );

    this.subscription.add(
      this.getControlValueChanges(SELECT_FORM_GROUP_KEY.quickDate).subscribe(
        (dateString: string) => {
          this.getControl(SELECT_FORM_GROUP_KEY.dateRange).disable({
            emitEvent: false,
          });

          switch (dateString) {
            case EStatsBy.ALL:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
                new Date('1900-01-01'), // Ngày nhỏ nhất hợp lý
                new Date('9999-12-31'), // Ngày lớn nhất hợp lý
              ]);

              break;
            case EStatsBy.TODAY:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
                startOfDay(new Date()),
                endOfDay(new Date()),
              ]);
              break;
            case EStatsBy.WEEK:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
                startOfWeek(new Date(), { weekStartsOn: 1 }),
                endOfWeek(new Date(), { weekStartsOn: 1 }),
              ]);
              break;
            case EStatsBy.MONTH:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
                startOfMonth(new Date()),
                endOfMonth(new Date()),
              ]);
              break;
            default:
              this.getControl(SELECT_FORM_GROUP_KEY.dateRange).enable({
                emitEvent: false,
              });

              console.log(
                'AAAAAAAA 2222222',
                this.getControl(SELECT_FORM_GROUP_KEY.dateRange).value,
              );
          }
        },
      ),
    );

    this.subscription.add(
      this.projectDependentOptions$.subscribe((_) => {
        this.setDefaultValue();
      }),
    );
  }

  /**
   * Thiết lập giá trị mặc định từ Local Storage để user không cần nhập thông tin chung
   */
  setDefaultValue() {
    const defaultValue: IDefaultValueInLocalStorage =
      this.localStorageService.getItem(LOCAL_STORAGE_KEY);
    if (defaultValue) {
      this.formGroup.patchValue(defaultValue);
    }
  }

  @ViewChild('tab') tabComponent!: ITabComponent;

  onChangeTab(event: ID) {
    this.activeTab.set(event as ETabName);
    if (this.activeTab() === ETabName.ISSUE) {
      this.getControl(this.SELECT_FORM_GROUP_KEY.quickDate).setValue(
        EStatsBy.ALL,
      );
    } else {
      this.getControl(this.SELECT_FORM_GROUP_KEY.quickDate).setValue(
        EStatsBy.TODAY,
      );
    }

    setTimeout(() => {
      console.log('onChangeTab ', this.tabComponent);
      this.tabComponent.callAPIGetTableData();
    }, 600);
  }

  onReload() {
    this.tabComponent.callAPIGetTableData();
  }
}
