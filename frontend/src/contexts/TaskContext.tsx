"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Task, TaskStatus, GetTasksParams } from '@/types/task.types';
import { taskService } from '@/services/task.service';
import { toast } from 'sonner';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  fetchTasks: (params?: GetTasksParams) => Promise<void>;
  createTask: (input: string) => Promise<void>;
  createTaskFromAudio: (audio: File) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  bulkDeleteTasks: (ids: string[]) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: TaskStatus) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const fetchTasks = useCallback(async (params?: GetTasksParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getTasks(params);
      setTasks(response.data);
      if (response.meta?.pagination) {
        setPagination(response.meta.pagination);
      }
    } catch (err) {
      setError('Failed to fetch tasks');
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (input: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.createTask({ input });
      
      // Handle multiple tasks being created
      const newTasks = Array.isArray(response.data) ? response.data : [response.data];
      
      setTasks(prevTasks => {
        const updatedTasks = [...newTasks, ...prevTasks];
        // Sort by creation date, newest first
        return updatedTasks.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      // Show success toast with number of tasks created
      toast.success(`${newTasks.length} task${newTasks.length > 1 ? 's' : ''} created`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTaskFromAudio = useCallback(async (audio: File) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.createTaskFromAudio({ audio });
      setTasks(prev => [response.data, ...prev]);
      toast.success('Task created from audio successfully');
    } catch (err) {
      setError('Failed to create task from audio');
      toast.error('Failed to create task from audio');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.updateTask(id, { status });
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data : task
      ));
      toast.success('Task status updated successfully');
    } catch (err) {
      setError('Failed to update task status');
      toast.error('Failed to update task status');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.updateTask(id, data);
      setTasks(prev => prev.map(task => 
        task._id === id ? response.data : task
      ));
      toast.success('Task updated successfully');
      return response.data;
    } catch (err) {
      setError('Failed to update task');
      toast.error('Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task._id !== id));
      toast.success('Task deleted successfully');
    } catch (err) {
      setError('Failed to delete task');
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDeleteTasks = useCallback(async (ids: string[]) => {
    try {
      setLoading(true);
      setError(null);
      await taskService.deleteTasks(ids);
      setTasks(prev => prev.filter(task => !ids.includes(task._id)));
      toast.success('Tasks deleted successfully');
    } catch (err) {
      setError('Failed to delete tasks');
      toast.error('Failed to delete tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateStatus = useCallback(async (ids: string[], status: TaskStatus) => {
    try {
      setLoading(true);
      setError(null);
      await taskService.updateTasksStatus(ids, status);
      setTasks(prev => prev.map(task => 
        ids.includes(task._id) ? { ...task, status } : task
      ));
      toast.success('Tasks status updated successfully');
    } catch (err) {
      setError('Failed to update tasks status');
      toast.error('Failed to update tasks status');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      error,
      pagination,
      fetchTasks,
      createTask,
      createTaskFromAudio,
      updateTaskStatus,
      updateTask,
      deleteTask,
      bulkDeleteTasks,
      bulkUpdateStatus,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
} 