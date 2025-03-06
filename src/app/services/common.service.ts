import { Injectable, QueryList, TemplateRef } from '@angular/core';
import { DevTemplateDirective } from '../directives';

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
    key: string, // Giá trị của Dropdown
    subListName: string, // Tên danh sách con trong API
    optionLabel: string,
    optionValue: string = 'id',
  ) {
    return list.reduce((acc, item) => {
      acc[item[key]] = item[subListName]
        .filter((subItem: any) => subItem[optionValue]) // Lọc những project có tên
        .map((subItem: any) => ({
          label: subItem[optionLabel],
          value: subItem[optionValue],
        }));
      return acc;
    }, {});
  }

  /*
   * @usage Chuyển dữ liệu lấy từ Google sheet dạng nested array thành array của object
   */
  convertSheetToObjects = (data: any[][]) => {
    const headers = data[0]; // Lấy hàng đầu tiên làm key
    return (
      data?.slice(1)?.map((row) => {
        const obj: any = {};
        headers.forEach((key, index) => {
          obj[key] = row[index] || ''; // Nếu không có giá trị, đặt rỗng
        });
        return obj;
      }) || []
    );
  };

  parseGoogleSheetsDate = (dateStr: string): string => {
    if (!dateStr && !this.isValidGoogleSheetsDate(dateStr)) return '';
    const [time, date] = dateStr.split(' - '); // Tách thành "08:16" và "07/02"
    const [day, month] = date.split('/').map(Number); // Lấy ngày và tháng
    const [hour, minute] = time.split(':').map(Number); // Lấy giờ và phút

    // Lấy năm hiện tại (hoặc có thể thay bằng năm cụ thể)
    const year = new Date().getFullYear();

    // Tạo đối tượng Date với múi giờ local (không chuyển đổi UTC)
    const localDate = new Date(year, month - 1, day, hour, minute);

    // Format theo Local Time: YYYY-MM-DD HH:mm
    return `${localDate.getFullYear()}-${(localDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${localDate
      .getDate()
      .toString()
      .padStart(2, '0')} ${localDate
      .getHours()
      .toString()
      .padStart(2, '0')}:${localDate.getMinutes().toString().padStart(2, '0')}`;
  };

  private isValidGoogleSheetsDate = (dateStr: string): boolean => {
    const regex =
      /^([01]\d|2[0-3]):([0-5]\d) - ([0-2]\d|3[01])\/(0[1-9]|1[0-2])$/;
    return regex.test(dateStr);
  };

  getTemplateByAttribute(
    templates: QueryList<DevTemplateDirective>,
    attributeName: string,
  ): TemplateRef<any> {
    return templates.find((template) => {
      return template.devTemplate === attributeName;
    })?.templateRef;
  }

  /*
   * @usage Nếu cả hai giá trị đều khác null, lấy một trong hai (ưu tiên giá trị đầu tiên).
   * Nếu một giá trị là null, lấy giá trị còn lại.
   * Nếu cả hai giá trị đều là null, kết quả là null.
   */
  mergeObjects(obj1: any, obj2: any): any {
    const merged: any = {};
    Object.keys({ ...obj1, ...obj2 }).forEach((key) => {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (val2 !== null && val2 !== undefined) {
        merged[key] = val2; // Ưu tiên giá trị từ obj2
      } else if (val1 !== null && val1 !== undefined) {
        merged[key] = val1;
      } else {
        merged[key] = null;
      }
    });
    return merged;
  }
}
