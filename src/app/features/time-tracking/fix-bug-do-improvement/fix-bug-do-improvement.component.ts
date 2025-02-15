import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ETabName } from '../time-tracking.dto';
import { COLUMN_FIELD, FORM_GROUP_KEYS } from '../time-tracking.model';
import { EMode } from '../../../contants/common.constant';
import { CommonModule } from '@angular/common';
import { IColumnHeaderConfigs } from '../../../shared/interface/common.interface';
import { fixBugDoImprovementHeaderColumnConfigs } from './fix-bug-do-improvement.model';
import { TableModule } from 'primeng/table';
import { FormatDatePipe, RoundPipe } from '../../../pipes';
import { TagModule } from 'primeng/tag';
import { FormBaseComponent } from '../../../shared';

@Component({
  selector: 'app-fix-bug-do-improvement',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    FormatDatePipe,
    TagModule,
    RoundPipe,
  ],
  templateUrl: './fix-bug-do-improvement.component.html',
  styleUrl: './fix-bug-do-improvement.component.scss',
})
export class FixBugDoImprovementComponent extends FormBaseComponent {
  protected readonly ETabName = ETabName;
  protected readonly COLUMN_FIELD = COLUMN_FIELD;
  protected readonly FORM_GROUP_KEYS = FORM_GROUP_KEYS;
  protected readonly EMode = EMode;

  headerColumnConfigs: IColumnHeaderConfigs[] =
    fixBugDoImprovementHeaderColumnConfigs;

  tableData: any = [];
}
