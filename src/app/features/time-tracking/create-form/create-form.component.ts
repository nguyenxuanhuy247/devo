import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormBaseComponent } from '../../../shared';

@Component({
  selector: 'app-create-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
  ],
  templateUrl: './create-form.component.html',
  styleUrl: './create-form.component.scss',
})
export class CreateFormComponent extends FormBaseComponent implements OnInit {
  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      id: null,
      project: null,
      pic: null,
      module: null,
      menu: null,
      screen: null,
      feature: null,
      category: null,
      workContent: null,
      startTime: null,
      endTime: null,
      duration: null,
      isLunchBreak: null,
      isSolveIssue: null,
      encounteredIssue: null,
      createdDate: null,
    });
  }

  submitForm() {}

  getDetailById() {}
}
