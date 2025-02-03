import { Injectable } from '@angular/core';

const POSSSIBLE =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor() {}

  static generateEnumFromInterface<T>(): { [K in keyof T]: K } {
    return new Proxy({} as { [K in keyof T]: K }, {
      get(_, prop) {
        return prop as keyof T;
      },
    });
  }

  parseObjToParams(obj: Record<string, any>) {
    let str = '';
    for (const key in obj) {
      if (str != '') {
        str += '&';
      }
      str += key + '=' + encodeURIComponent(obj[key]);
    }

    return str;
  }

  getParamsNotEmpty(obj: Record<string, any>) {
    const params = Object.create(null);
    for (const key in obj) {
      if (![null, 'null', undefined, NaN, ''].includes(obj[key])) {
        params[key] = obj[key];
      }
    }

    return params;
  }

  makeRandom(lengthOfCode: number = 10, possible: string = POSSSIBLE) {
    let text = '';
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  convertToDependentDropdown(
    list: any[],
    key: string,
    subListName: string,
    optionValue: string,
  ) {
    return list.reduce((acc, item) => {
      acc[item[key]] = item[subListName]
        .filter((subItem: any) => subItem[optionValue]) // Lọc những project có tên
        .map((subItem: any) => ({
          label: subItem[optionValue],
          value: subItem[optionValue],
        }));
      return acc;
    }, {});
  }
}
