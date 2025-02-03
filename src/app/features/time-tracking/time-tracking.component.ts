import { Component, computed, Injector, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { FormBaseComponent } from '../../shared';
import { TimeTrackingService } from './time-tracking.service';
import {
  EGetApiMode,
  ILogWorkTableDataResponseDTO,
  ITimeTrackingTableDataRequestDTO,
} from './time-tracking.dto';
import { PaginatorModule } from 'primeng/paginator';
import { combineLatest, filter, Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleButton } from 'primeng/togglebutton';
import {
  COLUMN_FIELD,
  estimateHeaderColumns,
  FORM_GROUP_KEYS,
  issuesHeaderColumns,
  logWorkHeaderColumns,
  nullableObj,
  SELECT_FORM_GROUP_KEY,
} from './time-tracking.model';
import { TabsModule } from 'primeng/tabs';
import { CreateFormComponent } from './create-form/create-form.component';
import { FormatDatePipe } from '../../pipes';
import { TooltipModule } from 'primeng/tooltip';
import { EMode } from '../../contants/common.constant';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';

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
    ToggleButton,
    TabsModule,
    FormatDatePipe,
    TooltipModule,
    SplitButtonModule,
    ProgressSpinnerModule,
    BlockUIModule,
    TextareaModule,
    DatePickerModule,
    CheckboxModule,
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
})
export class TimeTrackingComponent extends FormBaseComponent implements OnInit {
  requestDTO = signal<ITimeTrackingTableDataRequestDTO>({
    tabIndex: 0,
    startTime: null,
    endTime: null,
    pic: null,
    mode: EGetApiMode.TABLE_DATA,
  });

  timeTrackingService = this.injector.get(TimeTrackingService);

  userListOptions = signal<string[]>([]);

  // selectFormGroup: FormGroup = this.formBuilder.group({
  //   pic: null,
  //   dateRange: null,
  //   project: null,
  //   quickDateRange: null,
  // });
  subscription: Subscription = new Subscription();

  SELECT_FORM_GROUP_KEY = SELECT_FORM_GROUP_KEY;
  activeTabIndex = signal<number>(1);
  headerColumns = computed(() => {
    switch (this.activeTabIndex()) {
      case 0:
        return estimateHeaderColumns;
      case 1:
        return logWorkHeaderColumns;
      case 2:
        return issuesHeaderColumns;
      default:
        return null;
    }
  });

  COLUMN_FIELD = COLUMN_FIELD;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.CREATE);
  EMode = EMode;
  createButtonMenu: MenuItem[] = [
    {
      label: 'Mở drawer',
      command: () => {
        this.openCreateDrawer();
      },
    },
  ];

  isLoading = signal(false);
  formArray!: FormArray;

  FORM_GROUP_KEYS = FORM_GROUP_KEYS;

  constructor(override injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      pic: null,
      dateRange: null,
      project: null,
      quickDateRange: null,
      formArray: this.formBuilder.array([]),
    });
    this.formArray = this.formGroup.get('formArray') as FormArray;

    this.getControl(SELECT_FORM_GROUP_KEY.dateRange).setValue([
      new Date(),
      new Date(),
    ]);

    this.callAPIGetUserList();

    // Phải gọi trước khi khởi tạo giá trị cho dateRange
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.onDestroy$.subscribe(() => {
      this.subscription.unsubscribe();
    });

    this.subscription.add(
      combineLatest(
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.pic),
        this.getControlValueChanges(SELECT_FORM_GROUP_KEY.dateRange).pipe(
          filter((range) => range.every((date: Date) => !!date)),
        ),
      ).subscribe(([user, dateRange]) => {
        this.requestDTO.update((oldValue) => ({
          ...oldValue,
          pic: user,
          startTime: dateRange[0].toISOString(),
          endTime: dateRange[1].toISOString(),
        }));

        this.callAAIGetTableData();
      }),
    );
  }

  callAPIGetUserList() {
    this.isLoading.set(true);
    this.timeTrackingService
      .getDropdownListAsync({ mode: EGetApiMode.USERS })
      .pipe(filter((list: string[]) => list?.length > 0))
      .subscribe((userList: string[]) => {
        this.userListOptions.set(userList);
        this.getControl(SELECT_FORM_GROUP_KEY.pic).setValue(userList[0]);
        this.isLoading.set(false);
      });
  }

  callAAIGetTableData() {
    this.isLoading.set(true);
    this.timeTrackingService
      .getListAsync(this.requestDTO())
      .subscribe((response) => {
        response.data.forEach((rowData: ILogWorkTableDataResponseDTO) => {
          const formGroup = this.formBuilder.group({
            ...rowData,
            mode: EMode.VIEW,
          });
          this.formArray.push(formGroup);
        });

        this.isLoading.set(false);
      });
  }

  onTabChange(value: unknown) {
    this.activeTabIndex.set(value as number);
  }

  openCreateDrawer() {
    const drawerRef = this.drawerService.create({
      component: CreateFormComponent,
      data: {},
      configs: {
        width: '51.5rem',
      },
    });

    drawerRef.onClose.subscribe((res: any) => {
      console.log('aaaaaaaaaaa ', res);
    });
  }

  get formArrayObservable() {
    return this.formArray.valueChanges;
  }

  onAddNewRow() {
    this.formArray.push(
      this.formBuilder.group({ ...nullableObj, mode: EMode.CREATE }),
    );
  }

  getFormGroup(index: number, formControlName: string): FormControl {
    return this.formArray?.at(index).get(formControlName) as FormControl;
  }

  onCancelCreate() {
    const lastIndex = this.formArray.length - 1;
    if (lastIndex >= 0) {
      this.formArray.removeAt(lastIndex); // Xóa control cuối cùng
    }
  }

  onCreate() {}
}
