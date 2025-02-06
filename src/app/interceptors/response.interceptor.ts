import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { tap } from 'rxjs/operators';
import {
  EErrorCode,
  IHttpResponse,
} from '../shared/interface/common.interface';

export const httpResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService); // Inject MessageService

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const response = event.body as IHttpResponse<any>;

        if (response) {
          if (response.errorCode === EErrorCode.SUCCESS) {
            // messageService.add({
            //   severity: 'success',
            //   summary: 'Thành công',
            //   detail: response?.message,
            // });
          } else {
            messageService.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: response.message,
            });
          }
        }
      }
    }),
  );
};
