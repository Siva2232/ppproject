// src/pages/Task.jsx   (updated – now uses TaskContext)
import { useState, useRef, useCallback, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Sparkles,
  Edit3,
  Save,
  X,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import { useNotifications } from "../context/NotificationContext";
import DashboardLayout from "../components/DashboardLayout";
import { useTaskContext } from "../context/TaskContext";

const TEAM = [
  { id: "u1", name: "AntonyJoseph", avatar: "A", color: "from-rose-400 to-pink-500" },
  { id: "u2", name: "HariKrishnan", avatar: "H", color: "from-emerald-400 to-teal-500" },
  { id: "u3", name: "AkshayKumar", avatar: "A", color: "from-indigo-400 to-purple-500" },
];

const PRIORITY_CONFIG = {
  high: { label: "High", color: "from-red-500 to-rose-600", icon: AlertCircle },
  medium: { label: "Medium", color: "from-amber-500 to-orange-600", icon: Clock },
  low: { label: "Low", color: "from-emerald-500 to-teal-600", icon: CheckCircle },
};

const Task = () => {
  // ── Form state ───────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [editingId, setEditingId] = useState(null);

  const editRefs = useRef({});

  const { addNotification } = useNotifications();
  const { tasks, addTask, toggleTask, updateTask } = useTaskContext();

  // ── Due-date notifications (deduped) ─────────────────────────────────
  const notifiedRef = useRef(new Set());
  const checkDueDates = useCallback(() => {
    const now = new Date();
    const notified = notifiedRef.current;
    tasks.forEach((task) => {
      if (task.completed || !task.dueDate || notified.has(task.id)) return;

      const due = new Date(task.dueDate);
      const diff = due.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0 && diff > 0) {
        addNotification(`Due today: "${task.title}"`, "warning");
        notified.add(task.id);
      } else if (days === 1) {
        addNotification(`Due tomorrow: "${task.title}"`, "info");
        notified.add(task.id);
      }
    });
  }, [tasks, addNotification]);

  // Run once on mount + every minute
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    checkDueDates();
    const id = setInterval(checkDueDates, 60_000);
    return () => clearInterval(id);
  }, [checkDueDates]);

  // ── Add new task ─────────────────────────────────────────────────────
  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const member = TEAM.find((m) => m.id === assigneeId) || null;

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      dueDate,
      assigneeId: member?.id || "",
      assigneeName: member?.name || "",
      assigneeAvatar: member?.avatar || "",
      assigneeColor: member?.color || "",
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    addNotification(
      `Task created: "${title}" → ${member?.name || "Unassigned"}`,
      "success"
    );

    // reset form
    setTitle("");
    setDueDate("");
    setAssigneeId("");
    setPriority("medium");
  };

  // ── Edit helpers ─────────────────────────────────────────────────────
  const startEdit = (id) => {
    editRefs.current[id] = {};
    setEditingId(id);
  };

  const cancelEdit = () => {
    if (editingId !== null) delete editRefs.current[editingId];
    setEditingId(null);
  };

  const saveEdit = (id) => {
    const refs = editRefs.current[id];
    if (!refs) return;

    const oldTask = tasks.find((t) => t.id === id);
    if (!oldTask) return;

    const member = TEAM.find((m) => m.id === refs.assignee?.value) || null;

    const updates = {
      title: refs.title?.value.trim() || oldTask.title,
      dueDate: refs.due?.value || oldTask.dueDate,
      assigneeId: member?.id || "",
      assigneeName: member?.name || "",
      assigneeAvatar: member?.avatar || "",
      assigneeColor: member?.color || "",
      priority: refs.priority?.value || oldTask.priority,
    };

    updateTask(id, updates);
    addNotification(`Task updated: "${updates.title}"`, "info");

    delete editRefs.current[id];
    setEditingId(null);
  };

  // ── Stats ─────────────────────────────────────────────────────────────
  const { pending, done, total, completionRate } = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);
    const done = tasks.filter((t) => t.completed);
    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((done.length / total) * 100) : 0;
    return { pending, done, total, completionRate };
  }, [tasks]);

  // ── TaskCard (memoized) ──────────────────────────────────────────────
  const TaskCard = memo(({ task, index }) => {
    const isEditing = editingId === task.id;
    const { icon: PriorityIcon, color, label } = PRIORITY_CONFIG[task.priority];

    // Focus on title when editing starts
    useEffect(() => {
      if (isEditing) {
        const refs = editRefs.current[task.id];
        if (refs?.title) {
          refs.title.focus();
        }
      }
    }, [isEditing, task.id]);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05 }}
        className="group relative"
      >
        <div
          className={`
            relative overflow-hidden rounded-3xl p-6 transition-all duration-500
            ${task.completed
              ? "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50"
              : "bg-white/90 backdrop-blur-2xl border border-white/40 shadow-xl hover:shadow-2xl hover:-translate-y-1"}
          `}
        >
          {/* Edit / Save / Cancel */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isEditing ? (
              <div className="flex gap-2 bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg">
                <button
                  onClick={() => saveEdit(task.id)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startEdit(task.id)}
                className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <Edit3 size={18} />
              </button>
            )}
          </motion.div>

          {/* Checkbox */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleTask(task.id)}
            className={`
              absolute top-6 left-6 w-8 h-8 rounded-full flex items-center justify-center transition-all
              ${task.completed
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                : "border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"}
            `}
          >
            {task.completed && <CheckCircle size={18} />}
          </motion.button>

          {/* Content */}
          <div className="pl-16 pr-16">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <input
                  ref={(el) => {
                    if (!editRefs.current[task.id]) editRefs.current[task.id] = {};
                    editRefs.current[task.id] = { ...editRefs.current[task.id], title: el };
                  }}
                  defaultValue={task.title}
                  className="col-span-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 font-medium"
                />
                <input
                  ref={(el) => {
                    if (!editRefs.current[task.id]) editRefs.current[task.id] = {};
                    editRefs.current[task.id] = { ...editRefs.current[task.id], due: el };
                  }}
                  type="date"
                  defaultValue={task.dueDate}
                  className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200"
                />
                <select
                  ref={(el) => {
                    if (!editRefs.current[task.id]) editRefs.current[task.id] = {};
                    editRefs.current[task.id] = { ...editRefs.current[task.id], assignee: el };
                  }}
                  defaultValue={task.assigneeId}
                  className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 appearance-none"
                >
                  <option value="">Unassigned</option>
                  {TEAM.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <select
                  ref={(el) => {
                    if (!editRefs.current[task.id]) editRefs.current[task.id] = {};
                    editRefs.current[task.id] = { ...editRefs.current[task.id], priority: el };
                  }}
                  defaultValue={task.priority}
                  className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200"
                >
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <h3
                  className={`
                    text-xl font-bold mb-3 transition-all
                    ${task.completed ? "line-through text-gray-500" : "text-gray-900"}
                  `}
                >
                  {task.title}
                </h3>

                <div className="flex flex-wrap gap-3 text-sm">
                  {task.dueDate && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full">
                      <Calendar size={14} className="text-indigo-600" />
                      <span className="font-medium text-indigo-700">
                        {new Date(task.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  )}

                  {task.assigneeName && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-full">
                      <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${task.assigneeColor} flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {task.assigneeAvatar}
                      </div>
                      <span className="font-medium text-rose-700">{task.assigneeName}</span>
                    </div>
                  )}

                  <div
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-white
                      bg-gradient-to-r ${color}
                    `}
                  >
                    <PriorityIcon size={14} />
                    {label}
                  </div>

                  {task.completed && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-medium">
                      <CheckCircle size={14} />
                      Done
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  });

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Task Compass
              </h1>
            </div>
            <p className="text-lg text-gray-600 ml-16">Navigate your team's success with clarity</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion</p>
                  <p className="text-3xl font-bold text-emerald-600">{completionRate}%</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Add Task Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/50 mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Plus className="w-7 h-7 text-indigo-600" />
              Create New Task
            </h2>
            <form onSubmit={handleAdd} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's the mission?"
                  className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all font-medium text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign To</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all appearance-none"
                    >
                      <option value="">Unassigned</option>
                      {TEAM.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
              >
                <Plus className="w-6 h-6" />
                Launch Task
              </motion.button>
            </form>
          </motion.div>

          {/* Pending Section */}
          <section>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Pending Missions</h2>
              <span className="ml-2 px-4 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full text-sm font-bold">
                {pending.length}
              </span>
            </motion.div>

            <AnimatePresence>
              {pending.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-gray-500 bg-white/50 backdrop-blur-xl rounded-3xl"
                >
                  All clear! Add a task to get started.
                </motion.p>
              ) : (
                <div className="grid gap-5">
                  {pending.map((t, i) => (
                    <TaskCard key={t.id} task={t} index={i} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </section>

          {/* Completed Section */}
          <section className="mt-12">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Completed Victories</h2>
              <span className="ml-2 px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-bold">
                {done.length}
              </span>
            </motion.div>

            <AnimatePresence>
              {done.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-gray-500 bg-white/50 backdrop-blur-xl rounded-3xl"
                >
                  No victories yet. Complete a task!
                </motion.p>
              ) : (
                <div className="grid gap-5">
                  {done.map((t, i) => (
                    <TaskCard key={t.id} task={t} index={i} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Task;