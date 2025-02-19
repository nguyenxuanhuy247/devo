import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BUG_IMPROVEMENT_LIST_COLUMN_FIELD } from './bug-improvement.model';
import { EMode } from 'src/app/contants/common.constant';
import { ETabName } from '../time-tracking.dto';

@Component({
  selector: 'app-bug-improvement',
  imports: [CommonModule],
  templateUrl: './bug-improvement.component.html',
  styleUrl: './bug-improvement.component.scss',
})
export class BugImprovementComponent {
    protected readonly FORM_GROUP_KEYS = BUG_IMPROVEMENT_LIST_COLUMN_FIELD;
    protected readonly ETabName = ETabName;
    protected readonly COLUMN_FIELD = BUG_IMPROVEMENT_LIST_COLUMN_FIELD;
    protected readonly EMode = EMode;
}
