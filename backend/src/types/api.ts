export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    pagination?: PaginationInfo;
    filters?: FilterInfo;
    timing?: number;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterInfo {
  assignee?: string;
  priority?: string;
  status?: string;
  [key: string]: any;
}

// Standard response helper
export const createResponse = <T>(
  success: boolean,
  data?: T,
  error?: any,
  metadata?: any
): ApiResponse<T> => ({
  success,
  ...(data && { data }),
  ...(error && { error }),
  ...(metadata && { metadata })
}); 