import { Component, computed, Injector, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  ITimeTrackingTableDataRequestDTO,
} from './time-tracking.dto';
import { PaginatorModule } from 'primeng/paginator';
import { combineLatest, filter, Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleButton } from 'primeng/togglebutton';
import {
  EColumnField,
  estimateHeaderColumns,
  issuesHeaderColumns,
  logWorkHeaderColumns,
  SELECT_FORM_GROUP_KEY,
} from './time-tracking.model';
import { TabsModule } from 'primeng/tabs';
import { CreateFormComponent } from './create-form/create-form.component';
import { FormatDatePipe } from '../../pipes';
import { TooltipModule } from 'primeng/tooltip';
import { EMode } from '../../contants/common.constant';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';

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
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
})
export class TimeTrackingComponent extends FormBaseComponent implements OnInit {
  headerColumnNames: string[] = [];
  headerColumnKeys: string[] = [];

  tableData: any[];

  requestDTO = signal<ITimeTrackingTableDataRequestDTO>({
    tabIndex: 0,
    startTime: null,
    endTime: null,
    pic: null,
    page: 0,
    size: 10,
    mode: EGetApiMode.TABLE_DATA,
  });

  pagination = signal<{
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  }>({
    page: 0,
    size: 10,
    totalPages: null,
    totalElements: null,
  });

  timeTrackingService = this.injector.get(TimeTrackingService);

  userListOptions = signal<string[]>([]);
  checked: string;
  selectFormGroup: FormGroup = this.formBuilder.group({
    pic: null,
    dateRange: null,
    project: null,
  });
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

  EColumnField = EColumnField;
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

  constructor(override injector: Injector) {
    super(injector);

    // Phải gọi trước khi khởi tạo giá trị cho dateRange
    this.initSubscriptions();

    this.getControl(
      SELECT_FORM_GROUP_KEY.dateRange,
      this.selectFormGroup,
    ).setValue([new Date(), new Date()]);
  }

  get tabIndexModel(): number {
    return this.activeTabIndex();
  }

  set tabIndexModel(value: number) {
    this.activeTabIndex.set(value);
  }

  initSubscriptions() {
    this.onDestroy$.subscribe(() => {
      this.subscription.unsubscribe();
    });

    this.subscription.add(
      combineLatest(
        this.getControlValueChanges(
          SELECT_FORM_GROUP_KEY.pic,
          this.selectFormGroup,
        ),
        this.getControlValueChanges(
          SELECT_FORM_GROUP_KEY.dateRange,
          this.selectFormGroup,
        ).pipe(filter((range) => range.every((date: Date) => !!date))),
      ).subscribe(([user, dateRange]) => {
        console.log(SELECT_FORM_GROUP_KEY.pic, user, dateRange);

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

  ngOnInit() {
    this.callAPIGetUserList();
  }

  callAPIGetUserList() {
    this.timeTrackingService
      .getUserListAsync({ mode: EGetApiMode.USER_LIST })
      .pipe(filter((list: string[]) => list?.length > 0))
      .subscribe((userList: string[]) => {
        this.userListOptions.set(userList);
        this.getControl(
          SELECT_FORM_GROUP_KEY.pic,
          this.selectFormGroup,
        ).setValue(userList[0]);
      });
  }

  onPageChange(event: any) {
    console.log('onPageChange', event);
    this.requestDTO.update((oldValue) => ({
      ...oldValue,
      page: event.page,
      size: event.rows,
    }));

    this.callAAIGetTableData();
  }

  submitForm() {}

  getDetailById() {
    this.timeTrackingService
      .getDetailByIdAsync({
        tabIndex: 0,
        id: 1111,
      })
      .subscribe((response) => {
        this.formGroup.patchValue(response);
      });
  }

  callAAIGetTableData() {
    this.timeTrackingService
      .getListAsync(this.requestDTO())
      .subscribe((response) => {
        this.tableData = response.data;
        const header = response.header;
        this.headerColumnNames = Object.values(header);
        this.headerColumnKeys = Object.keys(header);

        this.pagination.update((oldValue) => ({
          ...oldValue,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
        }));
      });
  }

  getHeaderColumns() {
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

  onAddNewRow() {
    this.requestDTO.update((oldValue) => ({
      ...oldValue,
      page: this.pagination().totalPages - 1,
    }));

    this.callAAIGetTableData();
  }
}
