export enum EGetApiMode {
  USER_LIST = 1,
  TABLE_DATA = 2,
  DETAIL = 3,
}

// 🡫🡫🡫🡫🡫 START REGION : Request DTO 🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫
export interface ITimeTrackingRequestDTO {
  mode: EGetApiMode;
}

export interface ITimeTrackingTableDataRequestDTO {
  tabIndex: number;
  startTime: Date;
  endTime: Date;
  pic: string;
  page: number;
  size: number;
  mode: EGetApiMode;
}

// 🡩🡩🡩🡩🡩 END REGION : Request DTO 🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩

// 🡫🡫🡫🡫🡫 START REGION : Response DTO 🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫🡫
export interface ITimeTrackingResponseDTO {
  mode: EGetApiMode;
}

// 🡩🡩🡩🡩🡩 END REGION : Response DTO 🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩🡩

