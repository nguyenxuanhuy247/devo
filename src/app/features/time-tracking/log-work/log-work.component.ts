import { Component, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FORM_GROUP_KEYS, LOG_WORK_COLUMN_FIELD } from '../time-tracking.model';
import { ETabName } from '../time-tracking.dto';
import { EMode } from '../../../contants/common.constant';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-log-work',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './log-work.component.html',
  styleUrl: './log-work.component.scss',
})
export class LogWorkComponent {
  protected readonly FORM_GROUP_KEYS = FORM_GROUP_KEYS;
  protected readonly ETabName = ETabName;
  protected readonly EMode = EMode;
  protected readonly COLUMN_FIELD = LOG_WORK_COLUMN_FIELD;
  mode = signal<EMode.VIEW | EMode.CREATE | EMode.UPDATE>(EMode.VIEW);
}
