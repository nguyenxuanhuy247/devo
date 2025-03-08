import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { FormBaseComponent } from '../../../../shared';
import { CUSTOM_DRAWER_DATA } from '../../../../components/drawer/drawer-wrapper.model';
import { EClosePopupCode } from '../../../../contants/common.constant';
import { ImprovementComponent } from '../../improvement/improvement.component';
import { IIssuesRowData } from '../issues.model';
import { LibFormSelectComponent } from '../../../../components';

@Component({
  selector: 'app-log-improvement',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ButtonModule,
    ImprovementComponent,
  ],
  templateUrl: './log-improvement.component.html',
  styleUrl: './log-improvement.component.scss',
  host: {
    style: 'display: block; min-height: 100%',
  },
})
export class LogImprovementComponent
  extends FormBaseComponent
  implements OnInit
{
  @Input(CUSTOM_DRAWER_DATA) inputData: { data: any; close: () => void };
  data: any;
  onClosePopup: (params: { code: EClosePopupCode; data: any }) => void;
  issueRowData: IIssuesRowData;
  projectFormControl: LibFormSelectComponent;

  override ngOnInit() {
    super.ngOnInit();

    this.data = this.inputData?.['data'];
    this.onClosePopup = this.inputData?.['close'];
    this.issueRowData = this.data.rowData;
    this.projectFormControl = this.data.projectFormControl;
    this.projectFormControl = this.data.selectFormGroup;
  }

  submitForm() {}

  getDetailById() {}

  onClose() {
    this.onClosePopup({ code: EClosePopupCode.CANCEL, data: null });
  }

  onUpdate() {}

  onDelete() {}
}
