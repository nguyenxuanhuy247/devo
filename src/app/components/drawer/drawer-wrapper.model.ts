import { Type } from '@angular/core';
import { Nullable } from 'primeng/ts-helpers';

/**
 * @usage Cấu hình những thuộc tính và phương thức của tham số options
 * khi gọi hàm create của CustomDrawerService
 * @param component là Class componet của form truyền vào,
 * @param data Dữ liệu muốn truyền vào form
 * @param configs Cấu hình thông số của Custom Drawer Component
 * @param actions Hành động truyền vào form
 * @note Nullable<T> = T || null
 */
export interface IDrawerWrapperOptions<T> {
  component: Type<T>;
  data?: Nullable<unknown>;
  configs?: Nullable<Partial<IDrawerWrapperConfigs>>;
  actions?: Nullable<Partial<IActions>>;
}

/**
 * @usage Cấu hình giao diện của VpsDrawerComponent
 * @property hasHeader : Có Header mặc định (bao gồm Tiêu đề và nút đóng) hay không
 * @property heading : Tiêu đề (Chỉ sử dụng được khi hasHeader = true)
 * @property hasFooter : Có Header mặc định (bao gồm Nút Đóng và Lưu) hay không
 * @property width : Chiều rộng của Drawer. Ví dụ: '500px'
 * @property position : Vị trí của Drawer
 * @property closeOnEscape : Có đóng Drawer khi ấn nút ESC hay không
 * @property dismissible : Có đóng khi kích ra ngoài khu vực Drawer hay không
 */
export interface IDrawerWrapperConfigs {
  heading: string;
  width: string;
  minWidth: string;
  position: 'left' | 'right' | 'bottom' | 'top';
  closeOnEscape: boolean;
  dismissible: boolean;
}

/**
 * @usage Giá trị mặc định của VpsDrawerComponent
 */
export const defaultDrawerConfigs: IDrawerWrapperConfigs = {
  heading: 'Vui lòng nhập tiêu đề',
  width: '500px',
  minWidth: '300px',
  position: 'right',
  closeOnEscape: true,
  dismissible: true,
};

/**
 * @usage Quy định những hành động như onClose, onSave để truyền
 * vào trong các Drawer, Dialog,... khi sử dụng CustomDrawerService, VpsDialogService
 */
export interface IActions {
  onClose: (data?: any) => void;
  onSave: (data?: any) => void;
  onCloseAndRedirect: (data?: any) => void;
}

/**
 * @usage Giá trị mặc định của các hành động như onClose, onSave để truyền vào trong các Drawer, Dialog,...
 * khi sử dụng CustomDrawerService, VpsDialogService
 */
export const defaultActions: IActions = {
  onClose: (data?: any) => {
    return data;
  },
  onSave: (data?: any) => {
    return data;
  },
  onCloseAndRedirect: (data?: any) => {
    return data;
  },
};

export const CUSTOM_DRAWER_DATA = 'customDrawerData';
