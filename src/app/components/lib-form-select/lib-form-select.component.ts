import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Optional,
  Output,
  QueryList,
  Self,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NgControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ID, IOption } from 'src/app/shared/interface/common.interface';
import { DevTemplateDirective } from '../../directives';
import { CommonService } from '../../services';
import { Nullable } from 'primeng/ts-helpers';

@Component({
  selector: 'lib-form-select',
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './lib-form-select.component.html',
  styleUrl: './lib-form-select.component.scss',
})
export class LibFormSelectComponent implements ControlValueAccessor, Validator {
  @Input() options: IOption[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() appendTo = 'body';

  @Output() selectOption = new EventEmitter<ID>(null);

  @ContentChildren(DevTemplateDirective)
  vpsTemplates: QueryList<DevTemplateDirective>;
  value: any;

  templateName: string;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private commonService: CommonService,
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
      this.templateName = this.ngControl.name as string;
    }
  }

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Nếu cần disable select
  }

  handleChange(event: any) {
    this.onChange(event.value);
    this.selectOption.emit(event.value);
  }

  isTemplateRef(templateName: string): boolean {
    return !!this.findTemplateRefByName(templateName);
  }

  getTemplateRef(templateName: string): TemplateRef<any> {
    return this.findTemplateRefByName(templateName);
  }

  findTemplateRefByName(templateRefName: string): Nullable<TemplateRef<any>> {
    return this.commonService.getTemplateByAttribute(
      this.vpsTemplates,
      templateRefName,
    );
  }

  // Cài đặt Validator
  validate(control: AbstractControl): ValidationErrors | null {
    return this.value ? null : { required: true };
  }
}
