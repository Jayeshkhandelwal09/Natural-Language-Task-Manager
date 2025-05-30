export type TaskPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  _id: string;
  taskName: string;
  assignee: string;
  dueDate: string | null;
  priority: TaskPriority;
  description: string;
  tags: string[];
  dependencies: string[];
  status: TaskStatus;
  originalInput: string;
  aiParsedFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
}

export interface CreateTaskDTO {
  input: string;
}

export interface CreateTaskFromAudioDTO {
  audio: File;
}

export interface CreateTaskFromTranscriptDTO {
  transcript: string;
}

export interface UpdateTaskDTO {
  taskName?: string;
  assignee?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  description?: string;
  tags?: string[];
  dependencies?: string[];
  status?: TaskStatus;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
  error: null | {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters?: Record<string, any>;
  };
}

export interface TaskResponse {
  success: boolean;
  data: Task;
  error: null | {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timing?: number;
  };
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  assignee?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
} 