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

@Injectable({
  providedIn: 'root',
})
export class TimeTrackingApiService {
  constructor(private http: HttpClient, private commonService: CommonService) {}

  getListAsync(requestDTO: any) {
    const params = this.commonService.parseObjToParams(
      this.commonService.getParamsNotEmpty(requestDTO),
    );

    return this.http
      .get<IHttpResponse<any>>(apiManager.DATABASE + '?' + params)
      .pipe(
        map((response) => {
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

  createItemAsync(requestDTO: any): Observable<any> {
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

  updateItemAsync(requestDTO: any): Observable<any> {
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
}
