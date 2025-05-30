import api from '@/lib/axios';
import { 
  Task, 
  TaskResponse, 
  TasksResponse, 
  CreateTaskDTO, 
  UpdateTaskDTO, 
  GetTasksParams,
  CreateTaskFromAudioDTO,
  CreateTaskFromTranscriptDTO
} from '@/types/task.types';

class TaskService {
  private static instance: TaskService;
  private readonly BASE_PATH = '/tasks';

  private constructor() {}

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  // Get tasks with pagination and filters
  async getTasks(params?: GetTasksParams): Promise<TasksResponse> {
    const response = await api.get<TasksResponse>(this.BASE_PATH, { params });
    return response.data;
  }

  // Get single task
  async getTaskById(id: string): Promise<TaskResponse> {
    const response = await api.get<TaskResponse>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Create task from natural language
  async createTask(data: CreateTaskDTO): Promise<TaskResponse> {
    const response = await api.post<TaskResponse>(this.BASE_PATH, data);
    return response.data;
  }

  // Create task from audio
  async createTaskFromAudio(data: CreateTaskFromAudioDTO): Promise<TaskResponse> {
    const formData = new FormData();
    formData.append('audio', data.audio);

    const response = await api.post<TaskResponse>(
      `${this.BASE_PATH}/audio`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Create task from transcript
  async createTaskFromTranscript(data: CreateTaskFromTranscriptDTO): Promise<TaskResponse> {
    const response = await api.post<TaskResponse>(`${this.BASE_PATH}/transcript`, data);
    return response.data;
  }

  // Update task
  async updateTask(id: string, data: UpdateTaskDTO): Promise<TaskResponse> {
    const response = await api.put<TaskResponse>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  // Delete task
  async deleteTask(id: string): Promise<TaskResponse> {
    const response = await api.delete<TaskResponse>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Bulk delete tasks
  async deleteTasks(ids: string[]): Promise<TaskResponse> {
    // Using POST with _method=DELETE to handle request body
    const response = await api.post<TaskResponse>(`${this.BASE_PATH}/bulk`, { ids }, {
      headers: {
        'X-HTTP-Method-Override': 'DELETE'
      }
    });
    return response.data;
  }

  // Bulk update tasks status
  async updateTasksStatus(ids: string[], status: Task['status']): Promise<TaskResponse> {
    const response = await api.put<TaskResponse>(`${this.BASE_PATH}/bulk/status`, {
      ids,
      status,
    });
    return response.data;
  }
}

export const taskService = TaskService.getInstance(); 