import { Component, Input, OnInit, Type, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drawer, DrawerModule } from 'primeng/drawer';
import {
  CUSTOM_DRAWER_DATA,
  IDrawerWrapperConfigs,
  IDrawerWrapperOptions,
} from './drawer-wrapper.model';
import { Nullable } from 'primeng/ts-helpers';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-drawer-wrapper',
  imports: [CommonModule, DrawerModule],
  templateUrl: './drawer-wrapper.component.html',
  styleUrl: './drawer-wrapper.component.scss',
})
export class DrawerWrapperComponent<T extends object>
  implements OnInit, IDrawerWrapperOptions<T>
{
  @Input() component: Type<T>;
  @Input() data: any;
  @Input() configs: Partial<IDrawerWrapperConfigs> = null;

  @ViewChild(Drawer, { static: true }) drawer: Drawer;
  isVisible: boolean = false;
  inputData: Nullable<Record<string, unknown>> = null;
  durationDefault = 150;
  onClose$: Subject<any> = new Subject();
  message: string;

  /**
   * @usage Hàm trả về Observable được sử dụng ở CustomDrawerService
   */
  get closeObservable() {
    return this.onClose$.asObservable();
  }

  /**
   * @usage inputData được sử dụng để truyền dữ liệu và hành động vào trong
   * Component được nhúng vào CustomDrawerService
   */
  ngOnInit(): void {
    this.inputData = {
      [CUSTOM_DRAWER_DATA]: {
        data: this.data,
        configs: this.configs,
        close: (message?: any) => {
          this.onClose(message);
        },
      },
    };
  }

  clearModal(): void {
    this.drawer.hide();
    this.drawer.destroyModal();
  }

  /**
   * @usage Sử dụng để đóng Drawer và truyền message cho CustomDrawerService
   */
  onClose(message?: any): void {
    this.message = message;
    this.isVisible = false;
    this.onCloseEvent();
  }

  onCloseEvent() {
    if (!this.isVisible) {
      this.onClose$.next(this.message);
    }
  }
}
