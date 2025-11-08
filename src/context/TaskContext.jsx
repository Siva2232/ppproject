// src/context/TaskContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const TASK_KEY = "crm-compass-tasks-v3";
const HISTORY_KEY = "crm-compass-history-v1";

const TaskContext = createContext(undefined);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);

  // Load tasks
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
  }, []);

  // Load history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  // Persist tasks
  useEffect(() => {
    try {
      localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error("Failed to save tasks:", e);
    }
  }, [tasks]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  }, [history]);

  // Log history
  const log = useCallback((action, task, details = "") => {
    const entry = {
      id: Date.now(),
      action,
      taskId: task.id,
      taskTitle: task.title,
      timestamp: new Date().toISOString(),
      details,
    };
    setHistory(prev => [entry, ...prev].slice(0, 100));
  }, []);

  const addTask = useCallback((newTask) => {
    setTasks(prev => [newTask, ...prev]);
    log("created", newTask);
  }, [log]);

  const toggleTask = useCallback((id) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
    const task = tasks.find(t => t.id === id);
    if (task) log(task.completed ? "reopened" : "completed", task);
  }, [tasks, log]);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
    const task = tasks.find(t => t.id === id);
    if (task) {
      const changed = Object.keys(updates).filter(k => task[k] !== updates[k]);
      log("updated", { ...task, ...updates }, changed.join(", "));
    }
  }, [tasks, log]);

  const deleteTask = useCallback((id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setTasks(prev => prev.filter(t => t.id !== id));
      log("deleted", task);
    }
  }, [tasks, log]);

  const clearCompleted = useCallback(() => {
    const completed = tasks.filter(t => t.completed);
    setTasks(prev => prev.filter(t => !t.completed));
    completed.forEach(t => log("cleared", t));
  }, [tasks, log]);

  return (
    <TaskContext.Provider value={{
      tasks, history,
      addTask, toggleTask, updateTask, deleteTask, clearCompleted
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskContext must be used within TaskProvider");
  return ctx;
};