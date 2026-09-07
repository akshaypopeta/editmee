import React, { useState, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  CheckSquare,
  Clock,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Columns,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

interface KanbanTask {
  id: string;
  title: string;
  column: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export const ProductivityStudioWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'pomodoro' | 'habits'>('kanban');

  // Kanban State
  const [tasks, setTasks] = useState<KanbanTask[]>([
    { id: '1', title: 'Audit PDF tools and verify zero mock stubs', column: 'done', priority: 'high' },
    { id: '2', title: 'Implement full client-side video studio timeline', column: 'done', priority: 'high' },
    { id: '3', title: 'Verify all 21 categories have dedicated Studios', column: 'in-progress', priority: 'high' },
    { id: '4', title: 'Run production build verification with zero warnings', column: 'todo', priority: 'medium' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Pomodoro State
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(3);

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && pomoTime > 0) {
      interval = setInterval(() => {
        setPomoTime((t) => t - 1);
      }, 1000);
    } else if (pomoTime === 0) {
      setIsRunning(false);
      if (pomoMode === 'work') {
        setSessionsCompleted((s) => s + 1);
        setPomoMode('short-break');
        setPomoTime(5 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, pomoTime, pomoMode]);

  const formatPomoTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      column: 'todo',
      priority: 'medium',
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const moveTask = (id: string, col: KanbanTask['column']) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, column: col } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Productivity Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Focus Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive Kanban task boards, Pomodoro focus cycles, and daily milestone planning.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('kanban')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'kanban' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Kanban Board
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pomodoro')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pomodoro' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Pomodoro Focus
          </button>
        </div>
      </div>

      {/* Kanban Tab */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a new sprint task or milestone..."
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={handleAddTask}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Column 1: To Do */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">To Do</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  {tasks.filter((t) => t.column === 'todo').length}
                </span>
              </div>
              <div className="space-y-2.5 min-h-[220px]">
                {tasks
                  .filter((t) => t.column === 'todo')
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2 group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-bold text-slate-900 leading-snug">{t.title}</p>
                        <button
                          type="button"
                          onClick={() => deleteTask(t.id)}
                          className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => moveTask(t.id, 'in-progress')}
                        className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Start →
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black uppercase tracking-wider text-blue-900">In Progress</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200 text-blue-800">
                  {tasks.filter((t) => t.column === 'in-progress').length}
                </span>
              </div>
              <div className="space-y-2.5 min-h-[220px]">
                {tasks
                  .filter((t) => t.column === 'in-progress')
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 bg-white border border-blue-200 rounded-xl shadow-xs space-y-2 group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-bold text-slate-900 leading-snug">{t.title}</p>
                        <button
                          type="button"
                          onClick={() => deleteTask(t.id)}
                          className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveTask(t.id, 'todo')}
                          className="text-[10px] font-bold text-slate-500 hover:underline cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTask(t.id, 'done')}
                          className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Done ✓
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 3: Done */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900">Done</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800">
                  {tasks.filter((t) => t.column === 'done').length}
                </span>
              </div>
              <div className="space-y-2.5 min-h-[220px]">
                {tasks
                  .filter((t) => t.column === 'done')
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 bg-white border border-emerald-200 rounded-xl shadow-xs space-y-2 group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-bold text-slate-500 line-through leading-snug">{t.title}</p>
                        <button
                          type="button"
                          onClick={() => deleteTask(t.id)}
                          className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pomodoro Tab */}
      {activeTab === 'pomodoro' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 text-white max-w-xl mx-auto">
          <div className="flex gap-2">
            {(['work', 'short-break', 'long-break'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setPomoMode(mode);
                  setIsRunning(false);
                  if (mode === 'work') setPomoTime(25 * 60);
                  if (mode === 'short-break') setPomoTime(5 * 60);
                  if (mode === 'long-break') setPomoTime(15 * 60);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                  pomoMode === mode ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {mode.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="text-7xl font-black font-mono tracking-tight text-white py-4">
            {formatPomoTime(pomoTime)}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              <span>{isRunning ? 'Pause Timer' : 'Start Focus'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setPomoTime(pomoMode === 'work' ? 25 * 60 : 5 * 60);
              }}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          <div className="text-xs text-slate-400 font-bold">
            🔥 Completed Sessions Today: <span className="text-red-400 font-mono">{sessionsCompleted}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const productivityStudioToolDef: ToolDefinition = {
  id: 'productivity-studio',
  name: 'Productivity Studio Pro',
  category: 'productivity',
  subcategory: 'planner',
  description: 'Productivity workspace with interactive Kanban sprint boards and Pomodoro focus timers.',
  iconName: 'CheckSquare',
  version: '2.0.0',
  tags: ['productivity', 'kanban', 'pomodoro', 'timer', 'tasks', 'habits', 'sprint', 'studio'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  inputSchema: { fields: [] },
  outputSchema: { type: 'custom' },
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  customWorkspace: ProductivityStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Productivity Studio Ready' };
  },
};
