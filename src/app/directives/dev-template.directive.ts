import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: 'ng-template[devTemplate]',
})
export class DevTemplateDirective {
  @Input() devTemplate: string;

  constructor(public templateRef: TemplateRef<any>) {}
}
