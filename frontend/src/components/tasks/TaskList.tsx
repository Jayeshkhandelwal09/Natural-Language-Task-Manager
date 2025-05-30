"use client";
import React, { useEffect, useState } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { Task, TaskStatus, TaskPriority } from '@/types/task.types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/Skeleton';
import { MoreVertical, Edit, Trash, Clock, ListTodo, PlusCircle, Mic, Calendar, Tags, AlertCircle, Filter, SortAsc, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskList() {
  const {
    tasks,
    loading,
    error,
    pagination,
    fetchTasks,
    updateTaskStatus,
    deleteTask,
    updateTask
  } = useTask();

  const [currentPage, setCurrentPage] = useState(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({
    taskName: '',
    description: '',
    priority: 'P2' as TaskPriority,
    dueDate: '',
    assignee: '',
    tags: [] as string[],
    status: 'pending' as TaskStatus
  });
  const [newTag, setNewTag] = useState('');
  const [filters, setFilters] = useState<{
    assignee: string;
    priority: TaskPriority | null;
    status: TaskStatus | null;
  }>({
    assignee: '',
    priority: null,
    status: null
  });
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'dueDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      ...(filters.assignee && { assignee: filters.assignee }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.status && { status: filters.status }),
      sortBy,
      sortOrder
    };
    fetchTasks(params);
  }, [currentPage, filters, sortBy, sortOrder, fetchTasks]);

  const handleStatusChange = async (taskId: string, checked: boolean) => {
    try {
      const newStatus: TaskStatus = checked ? 'completed' : 'pending';
      await updateTaskStatus(taskId, newStatus);
      // Refetch tasks to ensure state is in sync
      const params = {
        page: currentPage,
        limit: 10,
        ...(filters.assignee && { assignee: filters.assignee }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.status && { status: filters.status }),
        sortBy,
        sortOrder
      };
      await fetchTasks(params);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      // Refetch tasks to ensure state is in sync
      const params = {
        page: currentPage,
        limit: 10,
        ...(filters.assignee && { assignee: filters.assignee }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.status && { status: filters.status }),
        sortBy,
        sortOrder
      };
      await fetchTasks(params);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      taskName: task.taskName || '',
      description: task.description || '',
      priority: task.priority || 'P3',
      dueDate: task.dueDate || '',
      assignee: task.assignee || '',
      tags: task.tags || [],
      status: task.status || 'pending'
    });
  };

  const handleSaveEdit = async () => {
    if (editingTask && editForm.taskName.trim()) {
      try {
        await updateTask(editingTask._id, {
          taskName: editForm.taskName.trim(),
          description: editForm.description.trim(),
          priority: editForm.priority,
          dueDate: editForm.dueDate || null,
          assignee: editForm.assignee,
          tags: editForm.tags,
          status: editForm.status
        });
        setEditingTask(null);
        // Refetch tasks to ensure state is in sync
        const params = {
          page: currentPage,
          limit: 10,
          ...(filters.assignee && { assignee: filters.assignee }),
          ...(filters.priority && { priority: filters.priority }),
          ...(filters.status && { status: filters.status }),
          sortBy,
          sortOrder
        };
        await fetchTasks(params);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'P1': return 'text-red-500';
      case 'P2': return 'text-orange-500';
      case 'P3': return 'text-yellow-500';
      case 'P4': return 'text-blue-500';
      default: return '';
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={filters.priority || "all"}
              onValueChange={(value: TaskPriority | "all") => 
                setFilters(prev => ({ 
                  ...prev, 
                  priority: value === "all" ? null : value 
                }))
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="P1">P1 - High</SelectItem>
                <SelectItem value="P2">P2 - Medium</SelectItem>
                <SelectItem value="P3">P3 - Low</SelectItem>
                <SelectItem value="P4">P4 - Optional</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status || "all"}
              onValueChange={(value: TaskStatus | "all") => 
                setFilters(prev => ({ 
                  ...prev, 
                  status: value === "all" ? null : value 
                }))
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-slate-200"
              >
                <SortAsc className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => setSortBy('createdAt')}
                className={cn(sortBy === 'createdAt' && "bg-slate-700/50")}
              >
                Creation Date
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy('priority')}
                className={cn(sortBy === 'priority' && "bg-slate-700/50")}
              >
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy('dueDate')}
                className={cn(sortBy === 'dueDate' && "bg-slate-700/50")}
              >
                Due Date
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700/50" />
              <DropdownMenuItem 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-800/50 bg-slate-800/20">
              <Skeleton className="h-4 w-4" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={filters.priority || "all"}
              onValueChange={(value: TaskPriority | "all") => 
                setFilters(prev => ({ 
                  ...prev, 
                  priority: value === "all" ? null : value 
                }))
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="P1">P1 - High</SelectItem>
                <SelectItem value="P2">P2 - Medium</SelectItem>
                <SelectItem value="P3">P3 - Low</SelectItem>
                <SelectItem value="P4">P4 - Optional</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status || "all"}
              onValueChange={(value: TaskStatus | "all") => 
                setFilters(prev => ({ 
                  ...prev, 
                  status: value === "all" ? null : value 
                }))
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-slate-200"
              >
                <SortAsc className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => setSortBy('createdAt')}
                className={cn(sortBy === 'createdAt' && "bg-slate-700/50")}
              >
                Creation Date
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy('priority')}
                className={cn(sortBy === 'priority' && "bg-slate-700/50")}
              >
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy('dueDate')}
                className={cn(sortBy === 'dueDate' && "bg-slate-700/50")}
              >
                Due Date
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700/50" />
              <DropdownMenuItem 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select
            value={filters.priority || "all"}
            onValueChange={(value: TaskPriority | "all") => 
              setFilters(prev => ({ 
                ...prev, 
                priority: value === "all" ? null : value 
              }))
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="P1">P1 - High</SelectItem>
              <SelectItem value="P2">P2 - Medium</SelectItem>
              <SelectItem value="P3">P3 - Low</SelectItem>
              <SelectItem value="P4">P4 - Optional</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status || "all"}
            onValueChange={(value: TaskStatus | "all") => 
              setFilters(prev => ({ 
                ...prev, 
                status: value === "all" ? null : value 
              }))
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-slate-200"
            >
              <SortAsc className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => setSortBy('createdAt')}
              className={cn(sortBy === 'createdAt' && "bg-slate-700/50")}
            >
              Creation Date
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortBy('priority')}
              className={cn(sortBy === 'priority' && "bg-slate-700/50")}
            >
              Priority
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortBy('dueDate')}
              className={cn(sortBy === 'dueDate' && "bg-slate-700/50")}
            >
              Due Date
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700/50" />
            <DropdownMenuItem 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>

      {/* Tasks or Empty State */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 bg-slate-800/20 border border-slate-700/50 rounded-lg">
          <div className="mb-4">
            <ListTodo className="h-8 w-8 mx-auto text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No tasks found</h3>
          <p className="text-sm text-slate-400">
            {filters.priority || filters.status ? (
              <>
                No tasks match your current filters.
                <br />
                Try adjusting your filters or create a new task.
              </>
            ) : (
              "Get started by creating your first task using natural language."
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={task._id || `task-${index}`} className={cn(
              "group relative flex items-start gap-4 p-4 rounded-lg transition-all duration-200",
              "bg-gradient-to-r from-slate-800/90 to-slate-800/70 hover:from-slate-700/90 hover:to-slate-700/70",
              "border border-slate-700/50 hover:border-slate-600/50",
              "shadow-lg hover:shadow-xl",
              task.status === 'completed' && "bg-opacity-50 hover:bg-opacity-60",
              task.isOverdue && "border-red-500/30"
            )}>
              <Checkbox
                checked={task.status === 'completed'}
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  if (typeof checked === 'boolean') {
                    handleStatusChange(task._id, checked);
                  }
                }}
                className={cn(
                  "mt-1 transition-colors",
                  task.status === 'completed' ? "text-purple-400" : "text-blue-400"
                )}
              />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={cn(
                    "font-medium text-slate-100 break-words",
                    task.status === 'completed' && "line-through text-slate-400"
                  )}>
                    {task.taskName}
                  </h3>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full shrink-0",
                    "shadow-sm",
                    task.priority === 'P1' && "bg-red-500/20 text-red-300 border border-red-500/30",
                    task.priority === 'P2' && "bg-orange-500/20 text-orange-300 border border-orange-500/30",
                    task.priority === 'P3' && "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
                    task.priority === 'P4' && "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  )}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-slate-400 leading-relaxed">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {task.dueDate && (
                    <div className={cn(
                      "flex items-center gap-1.5",
                      task.isOverdue && "text-red-400"
                    )}>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {task.assignee && task.assignee !== 'Unassigned' && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-[10px] font-medium text-white shadow-sm">
                        {task.assignee[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>{task.assignee}</span>
                    </div>
                  )}
                  {task.tags?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {task.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50 shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="gap-2" onClick={() => handleEdit(task)}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-red-400" onClick={() => handleDelete(task._id)}>
                    <Trash className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="gap-1 text-slate-300 border-slate-700/50 hover:bg-slate-800/50 hover:text-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-2 px-2 text-sm text-slate-400">
            <span>Page {currentPage} of {pagination.pages}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="gap-1 text-slate-300 border-slate-700/50 hover:bg-slate-800/50 hover:text-slate-200"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-100">Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Task Name</label>
              <Input
                value={editForm.taskName}
                onChange={(e) => setEditForm(prev => ({ ...prev, taskName: e.target.value }))}
                placeholder="Enter task name"
                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
                className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                  className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-slate-100 p-2"
                >
                  <option value="P1">P1 - High</option>
                  <option value="P2">P2 - Medium</option>
                  <option value="P3">P3 - Low</option>
                  <option value="P4">P4 - Optional</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                  className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-slate-100 p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Due Date</label>
                <Input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-slate-800/50 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Assignee</label>
                <Input
                  value={editForm.assignee}
                  onChange={(e) => setEditForm(prev => ({ ...prev, assignee: e.target.value }))}
                  placeholder="Enter assignee name"
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Tags</label>
              <div className="flex flex-wrap gap-2 p-2 rounded-md bg-slate-800/50 border border-slate-700 min-h-[42px]">
                {editForm.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({
                        ...prev,
                        tags: prev.tags?.filter((_, i) => i !== index) || []
                      }))}
                      className="hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag and press Enter"
                  className="border-0 bg-transparent text-slate-100 placeholder:text-slate-500 flex-1 min-w-[100px] focus-visible:ring-0 p-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTag.trim()) {
                      e.preventDefault();
                      setEditForm(prev => ({
                        ...prev,
                        tags: [...prev.tags, newTag.trim()]
                      }));
                      setNewTag('');
                    }
                  }}
                />
              </div>
              <p className="text-xs text-slate-400">Press Enter to add a tag</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingTask(null)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!editForm.taskName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 