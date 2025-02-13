import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'lib-form-select',
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './lib-form-select.component.html',
  styleUrl: './lib-form-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LibFormSelectComponent),
      multi: true,
    },
  ],
})
export class LibFormSelectComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() appendTo: string = 'body';

  value: any;
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
  }
}
