import {
  ChangeDetectorRef,
  Component,
  Injector,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  template: ``,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export abstract class FormBaseComponent {
  formGroup!: FormGroup;

  renderer = this.injector.get(Renderer2);
  formBuilder = this.injector.get(FormBuilder);
  changeDetectorRef = this.injector.get(ChangeDetectorRef);

  constructor(protected injector: Injector) {}
}
