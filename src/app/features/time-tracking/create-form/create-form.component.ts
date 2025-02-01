import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormBaseComponent } from '../../../shared';
import { CUSTOM_DRAWER_DATA } from '../../../components/drawer/drawer-wrapper.model';
import { EClosePopupCode } from '../../../contants/common.constant';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-create-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ButtonModule,
  ],
  templateUrl: './create-form.component.html',
  styleUrl: './create-form.component.scss',
  host: {
    style: 'display: block; min-height: 100%',
  },
})
export class CreateFormComponent extends FormBaseComponent implements OnInit {
  @Input(CUSTOM_DRAWER_DATA) inputData: { data: any; close: () => void };
  data: any;
  onClosePopup: (params: { code: EClosePopupCode; data: any }) => void;

  ngOnInit() {
    this.data = this.inputData?.['data'];
    this.onClosePopup = this.inputData?.['close'];

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

  onClose() {
    this.onClosePopup({ code: EClosePopupCode.CANCEL, data: null });
  }

  onUpdate() {}

  onDelete() {}
}
