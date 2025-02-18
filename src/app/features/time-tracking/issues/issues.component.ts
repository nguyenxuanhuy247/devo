import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { LibFormSelectComponent } from 'src/app/components';
import { issuesHeaderColumnConfigs } from './issues.model';
import { IColumnHeaderConfigs } from 'src/app/shared/interface/common.interface';

@Component({
  selector: 'app-issues',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    LibFormSelectComponent,
  ],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.scss',
})
export class IssuesComponent {
  formGroupControl = input<FormGroup>();
  projectFormControl = input<LibFormSelectComponent>();

  headerColumnConfigs: IColumnHeaderConfigs[] = issuesHeaderColumnConfigs;
}
