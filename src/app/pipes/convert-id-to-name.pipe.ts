import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertIdToName',
})
export class ConvertIdToNamePipe implements PipeTransform {
  transform(
    id: string,
    list: any[],
    nameField: string = 'menuName',
    idField: string = 'id',
  ): string {
    if (!id || !list || list.length === 0) return '--';

    const item = list.find((item) => item[idField] === id);
    return item ? item[nameField] : '--';
  }
}
