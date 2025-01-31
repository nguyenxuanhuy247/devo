import {
  ComponentRef,
  Injectable,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, delay, Subject } from 'rxjs';
import { CommonService } from './common.service';
import { DrawerWrapperComponent } from '../components';
import {
  defaultDrawerConfigs,
  IDrawerWrapperOptions,
} from '../components/drawer/drawer-wrapper.model';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class DrawerService implements OnDestroy {
  public destroyAll$ = new BehaviorSubject<boolean>(false);
  public destroyFullScreen$ = new BehaviorSubject<any>(false);
  drawerComponentRefMap: Map<
    string,
    ComponentRef<DrawerWrapperComponent<any>>
  > = new Map<string, ComponentRef<DrawerWrapperComponent<any>>>();
  private destroy$ = new Subject<void>();
  private viewContainerRef: ViewContainerRef;

  constructor(private commonService: CommonService) {}

  /**
   * @usage Sử dụng để khắc phục lôi "NullInjectorError: No provider for ViewContainerRef!"
   * @reason ViewContainerRef chỉ có thể được inject vào trong Component hoặc Directive,
   * không phải trong Service. Điều này là do ViewContainerRef liên quan trực tiếp đến View
   * và không thể tồn tại bên ngoài Context của View đó.
   * @otherSolutions Có 1 cách khác là thêm service vào providers của Component "providers: [CustomDrawerService]"
   */
  setViewContainerRef(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }

  /**
   * @usage Khởi tạo 1 VpsDrawerComponent, sau đó chèn 1 Component và dữ liệu (data) của nó vào
   * @param options Tham số truyền vào là 1 Object được định nghĩa theo interface ICustomDrawerOptions<T>
   * @returns Trả về Object chứa phương thức onClose là Observable chứa message
   */
  create<T extends object>(options: IDrawerWrapperOptions<T>) {
    const componentRef = this.viewContainerRef?.createComponent<
      DrawerWrapperComponent<T>
    >(DrawerWrapperComponent<T>);

    const componentId = this.commonService.makeRandom(15);

    const configs = Object.assign(
      _.cloneDeep(defaultDrawerConfigs),
      options.configs || {},
    );

    Object.assign(componentRef.instance, {
      ...options,
      configs,
    });

    componentRef.instance.isVisible = true;

    this.drawerComponentRefMap.set(componentId, componentRef);

    return {
      onClose: this.destroyComponent(componentRef, componentId),
    };
  }

  /**
   * Xóa tất cả các VpsDrawerComponent đã được tạo bởi service.
   */
  destroyAllComponents() {
    this.drawerComponentRefMap.forEach((componentRef, componentId) => {
      componentRef.instance.clearModal();
      componentRef.destroy();
    });
    this.drawerComponentRefMap.clear();
    this.destroyAll$.next(true);
  }

  destroyFullScreenComponents(dataFullScreen: any = true) {
    this.drawerComponentRefMap.forEach((componentRef, componentId) => {
      componentRef.instance.clearModal();
      componentRef.destroy();
    });
    this.drawerComponentRefMap.clear();
    this.destroyFullScreen$.next(dataFullScreen);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Quản lý đăng ký theo dõi của closeObservable của thành phần VpsDrawerComponent.
   * Nó chờ cho khoảng thời gian đã chỉ định (thời gian mặc định + 10ms) sau khi cửa sổ đính kèm đã đóng,
   * sau đó xóa modal và hủy thành phần.
   *
   * @remarks
   * Hàm này là một phần của CustomDrawerService và chịu trách nhiệm quản lý
   * vòng đời của thành phần VpsDrawerComponent. Nó đảm bảo rằng thành phần
   * được xử lý đúng cách sau khi đã đóng.
   *
   * @param componentRef
   *
   * @param componentId
   * @returns Observable chứa message
   */
  private destroyComponent(
    componentRef: ComponentRef<DrawerWrapperComponent<any>>,
    componentId: string,
  ) {
    const destroyObs: Subject<any> = new Subject();
    componentRef.instance.closeObservable
      .pipe(delay(componentRef.instance.durationDefault + 10))
      .subscribe((res) => {
        destroyObs.next(res);
        componentRef.instance.clearModal();
        if (this.drawerComponentRefMap.has(componentId)) {
          this.drawerComponentRefMap.delete(componentId);
        }
        componentRef.destroy();
      });

    return destroyObs;
  }
}
