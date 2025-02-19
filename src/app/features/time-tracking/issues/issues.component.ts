import { Component, Injector, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { LibFormSelectComponent } from 'src/app/components';
import {
  IIssuesRowData,
  ISSUES_COLUMN_FIELD,
  ISSUES_FORM_GROUP_KEYS,
  issuesHeaderColumnConfigs,
  nullableIssuesObj,
} from './issues.model';
import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { EMode } from '../../../contants/common.constant';
import { FormBaseComponent } from '../../../shared';
import { Subscription } from 'rxjs';
import { TimeTrackingStore } from '../time-tracking.store';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { WorkDurationDirective } from '../../../directives';
import { ConvertIdToNamePipe, FormatDatePipe, RoundPipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { LogWorkComponent } from '../log-work/log-work.component';
import { ITabComponent } from '../time-tracking.model';

@Component({
  selector: 'app-issues',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    LibFormSelectComponent,
    ButtonModule,
    TooltipModule,
    TextareaModule,
    DatePickerModule,
    InputTextModule,
    WorkDurationDirective,
    ConvertIdToNamePipe,
    FormatDatePipe,
    RoundPipe,
    TagModule,
    RippleModule,
    LogWorkComponent,
  ],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.scss',
})
export class IssuesComponent
  extends FormBaseComponent
  implements OnInit, ITabComponent
{
  formGroupControl = input<FormGroup>();
  projectFormControl = input<LibFormSelectComponent>();

  headerColumnConfigs: IColumnHeaderConfigs[] = issuesHeaderColumnConfigs;
  tableData: any[] = [];
  COLUMN_FIELD = ISSUES_COLUMN_FIELD;
  FORM_GROUP_KEYS = ISSUES_FORM_GROUP_KEYS;
  protected readonly EMode = EMode;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
  fixedRowData: IIssuesRowData[] = [];

  createFormGroup!: FormGroup;
  subscription: Subscription = new Subscription();
  private timeTrackingStore = this.injector.get(TimeTrackingStore);
  allDropdownData$ = this.timeTrackingStore.allDropdownData$;
  moduleDependentOptions$ = this.timeTrackingStore.moduleDependentOptions$;
  menuDependentOptions$ = this.timeTrackingStore.menuDependentOptions$;
  screenDependentOptions$ = this.timeTrackingStore.screenDependentOptions$;
  featureDependentOptions$ = this.timeTrackingStore.featureDependentOptions$;
  tabOptions$ = this.timeTrackingStore.tabOptions$;
  categoryOptions$ = this.timeTrackingStore.categoryOptions$;
  formArray: FormArray = new FormArray([]);

  constructor(override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.createFormGroup = this.formBuilder.group({
      ...nullableIssuesObj,
      mode: EMode.CREATE,
      createdDate: new Date(),
    });

    console.log(' this.createFormGroup', this.createFormGroup);
    this.addCreateRowForm();

    console.log('formArray', this.formArray);
    const newFormGroup = this.formBuilder.group({ ...nullableIssuesObj });
    this.formArray.push(newFormGroup);
    this.initSubscriptions();
  }

  initSubscriptions() {
    // this.onDestroy$.subscribe(() => {});
  }

  onSetCurrentTimeForDatepicker(index: number, formControlName: string) {
    let control: FormControl;
    if (this.mode() === EMode.UPDATE) {
      control = this.getFormControl(index, formControlName);
    } else {
      control = this.getControl(
        formControlName,
        this.createFormGroup,
      ) as FormControl;
    }
    control.setValue(new Date());
  }

  getFormControl(index: number, formControlName: string): FormControl {
    return this.formArray?.at(index)?.get(formControlName) as FormControl;
  }

  addCreateRowForm() {
    this.fixedRowData = [
      {
        ...nullableIssuesObj,
        mode: EMode.CREATE,
        createdDate: new Date(),
      },
    ];
  }

  onResetCreateForm() {
    this.createFormGroup.reset();
  }

  onChangeToUpdateMode(index: number) {
    this.mode.set(EMode.UPDATE);

    const formGroup = this.getFormGroup(index);
    formGroup.patchValue({ mode: EMode.UPDATE });
    this.tableData = this.formArray.value;
  }

  getFormGroup(index: number): FormGroup {
    return this.getFormGroupInFormArray(this.formArray, index);
  }

  onDelete(rowData: IIssuesRowData) {}

  onMarkFinish() {
    this.createFormGroup.reset();
  }

  onSaveCreate() {}

  callAPIGetTableData() {}
}
