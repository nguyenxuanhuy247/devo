import { Injectable } from '@angular/core';
export enum ELogStorageKey {
  CURRENT_BUG = 'logFixBug',
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  /**
   * Lưu dữ liệu vào LocalStorage
   * @param key Tên khóa (key)
   * @param value Giá trị cần lưu (có thể là object hoặc string)
   */
  setItem(key: string, value: any): void {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, data);
    } catch (error) {
      console.error(
        `Lỗi khi lưu dữ liệu vào LocalStorage với key=${key}:`,
        error,
      );
    }
  }

  /**
   * Lấy dữ liệu từ LocalStorage
   * @param key Tên khóa (key)
   * @returns Giá trị (dạng object nếu là JSON hoặc string)
   */
  getItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data
        ? this.isJsonString(data)
          ? JSON.parse(data)
          : (data as unknown as T)
        : null;
    } catch (error) {
      console.error(
        `Lỗi khi lấy dữ liệu từ LocalStorage với key=${key}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Xóa dữ liệu khỏi LocalStorage
   * @param key Tên khóa (key)
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(
        `Lỗi khi xóa dữ liệu từ LocalStorage với key=${key}:`,
        error,
      );
    }
  }

  /**
   * Xóa toàn bộ dữ liệu trong LocalStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Lỗi khi xóa toàn bộ LocalStorage:', error);
    }
  }

  /**
   * Kiểm tra xem một khóa có tồn tại trong LocalStorage hay không
   * @param key Tên khóa (key)
   * @returns true nếu tồn tại, ngược lại false
   */
  hasKey(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Kiểm tra xem chuỗi có phải là JSON hợp lệ hay không
   * @param str Chuỗi cần kiểm tra
   * @returns true nếu là JSON hợp lệ, ngược lại false
   */
  private isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
}
