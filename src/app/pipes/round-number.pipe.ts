import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundNumber',
})
export class RoundPipe implements PipeTransform {
  transform(value: number, decimalPlaces = 1): number {
    if (isNaN(value) || isNaN(decimalPlaces)) {
      return value;
    }
    return parseFloat(value.toFixed(decimalPlaces));
  }
}
