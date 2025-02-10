import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { apiManager } from '../../contants/api.contant';
import { CommonService } from '../../services';
import {
  IIndependentDropdownResponseDTO,
  ITimeTrackingDoPostRequestDTO,
  ITimeTrackingRequestDTO,
} from './time-tracking.dto';
import { IHttpResponse } from '../../shared/interface/common.interface';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingApiService {
  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private messageService: MessageService,
  ) {}

  getListAsync(requestDTO: any) {
    const params = this.commonService.parseObjToParams(
      this.commonService.getParamsNotEmpty(requestDTO),
    );

    return this.http
      .get<IHttpResponse<any>>(apiManager.DATABASE + '?' + params)
      .pipe(
        map((response) => {
          console.log('service', response);
          return response.data;
        }),
      );
  }

  getDetailByIdAsync(requestDTO: any): Observable<any> {
    const params = this.commonService.parseObjToParams(
      this.commonService.getParamsNotEmpty(requestDTO),
    );

    return this.http
      .get(apiManager.DATABASE + '?' + params, {
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
      })
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  createItemAsync(requestDTO: ITimeTrackingDoPostRequestDTO) {
    return this.http
      .post<IHttpResponse>(apiManager.DATABASE, requestDTO, {
        headers: { 'Content-Type': 'text/plain' },
      })
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  updateItemAsync(requestDTO: ITimeTrackingDoPostRequestDTO): Observable<any> {
    return this.http
      .post<IHttpResponse>(apiManager.DATABASE, requestDTO, {
        headers: { 'Content-Type': 'text/plain' },
      })
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  deleteItemAsync(requestDTO: ITimeTrackingDoPostRequestDTO): Observable<any> {
    return this.http
      .post(apiManager.DATABASE, requestDTO, {
        headers: { 'Content-Type': 'text/plain' },
      })
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }

  getDropdownListAsync(requestDTO: ITimeTrackingRequestDTO): Observable<any[]> {
    const params = this.commonService.parseObjToParams(
      this.commonService.getParamsNotEmpty(requestDTO),
    );

    return this.http
      .get<IHttpResponse<any[]>>(apiManager.DATABASE + '?' + params)
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  getAllIndependentDropdownAsync(requestDTO: ITimeTrackingRequestDTO) {
    const params = this.commonService.parseObjToParams(
      this.commonService.getParamsNotEmpty(requestDTO),
    );

    return this.http
      .get<IHttpResponse<IIndependentDropdownResponseDTO>>(
        apiManager.DATABASE + '?' + params,
      )
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  getBugImprovementContinuousUpdate(url: string, requestDTO: any) {
    const params = this.commonService.parseObjToParams(
      this.commonService.getParamsNotEmpty(requestDTO),
    );

    return this.http
      .get<IHttpResponse<IIndependentDropdownResponseDTO>>(url + '?' + params)
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  deleteLogTimeInFixBugSheetAsync(): Observable<any> {
    const url =
      'https://script.google.com/macros/s/AKfycbyyLLzf1NCVnUBUe9fuNKvTw7un5N6j48LuzWIihqQlXmlWku7oIwP7VkC7Ogr9zPpc/exec';

    return this.http
      .post(url, null, {
        headers: { 'Content-Type': 'text/plain' },
      })
      .pipe(
        map((response) => {
          return response;
        }),
      );
  }
}
