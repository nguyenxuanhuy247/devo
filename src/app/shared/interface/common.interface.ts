export type ID = string | number | null;

export enum EErrorCode {
  SUCCESS = 0,
  FAILURE = 1,
}

export interface IHttpResponse<T = null> {
  errorCode: EErrorCode;
  message: string;
  data: T;
}

export interface IOption extends Record<string, unknown> {
  label: string;
  value: any;
}

export interface IColumnHeaderConfigs extends Record<string, unknown> {
  label: string;
  field: string;
  minWidth: number;
}
