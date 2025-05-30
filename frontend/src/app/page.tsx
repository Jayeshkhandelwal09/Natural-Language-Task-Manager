'use client';

import { TaskInput } from '@/components/tasks/TaskInput';
import { TaskList } from '@/components/tasks/TaskList';
import { PlusCircle, ListTodo } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';

export default function Home() {
  const { tasks } = useTask();

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-6">
      <section className="max-w-4xl mx-auto rounded-xl overflow-hidden backdrop-blur-xl bg-gradient-to-b from-slate-800/70 to-slate-900/70 border border-slate-700/50 shadow-xl">
        <div className="p-6 md:p-8">
          <div className="relative mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-3 text-white">
              <PlusCircle className="h-7 w-7 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text">
                Quick Add Task
              </span>
            </h2>
            <div className="absolute -bottom-4 left-0 w-full h-px bg-gradient-to-r from-blue-500/50 via-purple-500/30 to-transparent" />
          </div>
          <TaskInput />
        </div>
      </section>

      <section className="max-w-4xl mx-auto rounded-xl overflow-hidden backdrop-blur-xl bg-gradient-to-b from-slate-800/70 to-slate-900/70 border border-slate-700/50 shadow-xl">
        <div className="p-6 md:p-8">
          <div className="relative mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-3 text-white">
                <ListTodo className="h-7 w-7 text-purple-400" />
                <span className="bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text">
                  Your Tasks
                </span>
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                {tasks.length} Tasks
              </span>
            </div>
            <div className="absolute -bottom-4 left-0 w-full h-px bg-gradient-to-r from-purple-500/50 via-blue-500/30 to-transparent" />
          </div>
          <TaskList />
        </div>
      </section>
    </div>
  );
}
