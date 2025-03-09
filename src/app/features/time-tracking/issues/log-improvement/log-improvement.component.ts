import { Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { LogWorkComponent } from '../../log-work/log-work.component';
import { IIssuesRowData } from '../issues.model';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { LibFormSelectComponent } from '../../../../components';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ConvertIdToNamePipe } from '../../../../pipes';
import { WorkDurationDirective } from '../../../../directives';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-log-improvement',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    LibFormSelectComponent,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    TagModule,
    ConvertIdToNamePipe,
    WorkDurationDirective,
    InputTextModule,
    TextareaModule,
  ],
  templateUrl: '../../log-work/log-work.component.html',
  styleUrl: '../../log-work/log-work.component.scss',
  host: {
    style: 'display: block; min-height: 100%',
  },
})
export class LogImprovementComponent
  extends LogWorkComponent
  implements OnInit
{
  issueRowData = input<IIssuesRowData>(null);
}
