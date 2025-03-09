import { Component, computed, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import {
  IColumnHeaderConfigs,
  ID,
} from '../../../shared/interface/common.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ConvertIdToNamePipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { LibFormSelectComponent } from '../../../components';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import {
  DevTemplateDirective,
  WorkDurationDirective,
} from '../../../directives';
import { ICommonRowData, ITabComponent } from '../time-tracking.model';
import { Checkbox } from 'primeng/checkbox';
import { IIssuesRowData } from '../issues/issues.model';
import { BugComponent } from '../bug/bug.component';
import { ESheetName } from '../time-tracking.dto';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import {
  IMPROVEMENT_COLUMN_FIELD,
  IMPROVEMENT_FORM_GROUP_KEY,
  improvementHeaderColumnConfigs,
  improvementNullableObj,
} from './improvement.model';

@Component({
  selector: 'app-improvement',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    ButtonModule,
    ConvertIdToNamePipe,
    TagModule,
    LibFormSelectComponent,
    DatePicker,
    InputText,
    Textarea,
    WorkDurationDirective,
    Checkbox,
    PopoverModule,
    SelectModule,
    DevTemplateDirective,
  ],
  templateUrl: '../bug/bug.component.html',
  styleUrl: '../bug/bug.component.scss',
  host: {
    style: 'display: block; height: 100%;',
  },
})
export class ImprovementComponent
  extends BugComponent
  implements OnInit, ITabComponent
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

  override sheetName = signal<ESheetName>(ESheetName.IMPROVEMENT);
  override readonly FORM_GROUP_KEY: any = IMPROVEMENT_FORM_GROUP_KEY;
  override readonly COLUMN_FIELD: any = IMPROVEMENT_COLUMN_FIELD;
  override headerColumnConfigs: IColumnHeaderConfigs[] =
    improvementHeaderColumnConfigs;
  override initRowDataObj = improvementNullableObj;

  override ngOnInit() {
    this.initRowDataObj = {
      ...improvementNullableObj,
      ...this.issueCommonData(),
    };

    super.ngOnInit();

    console.log('issueCommonData', this.issueCommonData());
    console.log('improvementNullableObj', this.initRowDataObj);
  }
}
