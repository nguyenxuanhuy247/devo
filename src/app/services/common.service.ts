import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor() {}

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
}
