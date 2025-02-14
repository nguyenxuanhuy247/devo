import {
  Component,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { IOption } from 'src/app/shared/interface/common.interface';

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
export class LibFormSelectComponent
  implements ControlValueAccessor, OnInit, OnChanges
{
  @Input() options: IOption[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() appendTo = 'body';

  value: any;
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit() {
    console.log('aaaaaaaa 1111111', this.options);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      console.log('aaaaaaaa 22222222', changes);
    }
  }

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
