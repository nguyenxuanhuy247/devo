export type ID = string | number;

export enum EErrorCode {
  SUCCESS = 0,
  FAILURE = 1,
}

export interface IHttpResponse<T> {
  errorCode: EErrorCode;
  message: string;
  data: T;
}

export interface IOption {
  label: string;
  value: any;

  [s: string]: any;
}
