import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertIdToName',
})
export class ConvertIdToNamePipe implements PipeTransform {
  transform(
    id: string,
    list: any[],
    nameField: string = 'menuName',
    isDate: boolean = false,
    idField: string = 'id',
  ): string {
    if (!id || !list || list.length === 0) return null;

    const item = list.find((item) => item[idField] === id);
    let newValue = item[nameField];
    if (isDate) {
      newValue = new Date(item[nameField]);
    }
    return item ? newValue : null;
  }
}
